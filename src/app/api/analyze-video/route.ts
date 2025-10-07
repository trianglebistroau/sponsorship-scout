import { TIKTOK_BASE_URL } from "@/const/constants"
import { supabase } from "@/utils/supabase/client"
import { GoogleGenAI } from "@google/genai"
import { initializeAI, runWorkflow, type WorkflowInput } from "llm/workflow"
import { NextResponse } from "next/server"

export const runtime = "edge"

export const maxDuration = 60

export async function POST(req: Request) {
  //Params
  const body = await req.json()
  const username = body.username
  console.log("Username:", username)

  // Initialize AI for the workflow
  initializeAI(process.env.GEMINI_API_KEY!)

  // Initialize AI for file operations
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  })

  let uploadResponse = null

  //Get video from Supabase where username = username
  const { data: videoData, error: videoError } = await supabase
    .from("Video")
    .select("*")
    .eq("username", username)

  //Construct video id array, this is only for 1 username for now
  const videoIdMap = new Map<string, { url: string; response: any | null }>()
  console.log("Video data from Supabase:", videoData, videoError)
  for (const video of videoData) {
    videoIdMap.set(video.id, {
      url: `${TIKTOK_BASE_URL}/@${username}/video/${video.id}`,
      response: null,
    })
  }
  console.log("Video ID Map:", videoIdMap)
  try {
    for (const [videoId, { url: videoUrl }] of videoIdMap) {
      const videoResponse = await fetch(
        `${process.env.BACKEND_URL}/download?video_url=${videoUrl}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "video/mp4",
            "User-Agent": "Vercel-Edge-Function/1.0",
          },
        }
      )

      const reader = videoResponse.body.getReader()
      const chunks = []
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        // Process each chunk immediately as it arrives
        chunks.push(value)
      }

      //turn stream back into blob
      const videoBlob = new Blob(chunks, { type: "video/mp4" })
      console.log("Video blob:", videoBlob)

      if (!videoResponse.ok) {
        throw new Error(
          `Failed to fetch video: ${videoResponse.status} ${videoResponse.statusText}`
        )
      }

      uploadResponse = await ai.files.upload({
        file: videoBlob,
        config: {
          mimeType: "video/mp4",
        },
      })

      // Wait for processing
      let fileStatus = uploadResponse
      while (fileStatus.state === "PROCESSING") {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        fileStatus = await ai.files.get({ name: uploadResponse.name })
      }

      if (fileStatus.state === "FAILED") {
        throw new Error("File processing failed")
      }

      // Run the workflow
      const workflowInput: WorkflowInput = {
        mimeType: fileStatus.mimeType,
        fileUri: fileStatus.uri,
      }
      const result = await runWorkflow(workflowInput)

      const { data, error: updateError } = await supabase
        .from("Video")
        .update({ ai_processed_output: result })
        .eq("id", videoId)
        .select()

      if (updateError) {
        console.error(`Error updating video ${videoId}:`, updateError)
      } else {
        console.log(`Successfully updated video ${videoId}`)
      }

      // Clean up
      await ai.files.delete({ name: uploadResponse.name }).catch(console.warn)
      videoIdMap.set(videoId, {
        url: videoUrl,
        response: result,
      })
    }

    console.log("Video ID Map with responses:", videoIdMap)

    //Update Supabase with response, currently not working
    for (const [videoId, { response }] of videoIdMap) {
      if (!response) continue
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Error:", error)

    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
