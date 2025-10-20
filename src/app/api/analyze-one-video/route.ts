import { supabase } from "@/utils/supabase/client"
import { GoogleGenAI } from "@google/genai"
import { initializeAI, runWorkflow, type WorkflowInput } from "llm/workflow"
import { NextResponse } from "next/server"

export const runtime = "edge"

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    //Params
    const body = await req.json()

    const videoUrl = body.videoUrl
    console.log("Video URL:", videoUrl)

    // Extract username and video ID from URL
    const urlMatch = videoUrl.match(/@([^/]+)\/video\/(\d+)/)
    if (!urlMatch) {
      return NextResponse.json(
        { error: "Invalid TikTok video URL" },
        { status: 400 }
      )
    }
    const username = urlMatch[1]
    const videoId = urlMatch[2]
    console.log("Extracted username:", username)
    console.log("Extracted video ID:", videoId)

    const videoObj = {
      id: videoId,
      username: username,
    }

    //Check if user exists in User table, insert if not
    const { data: existingUser, error: userSelectError } = await supabase
      .from("User")
      .select("username")
      .eq("username", username)
      .single()

    if (userSelectError && userSelectError.code !== "PGRST116") {
      // Handle unexpected errors (ignore "row not found" error)
      console.error(`Error checking user ${username}:`, userSelectError)
      return NextResponse.json(
        { error: "Failed to check user" },
        { status: 500 }
      )
    }

    if (!existingUser) {
      const { error: userInsertError } = await supabase.from("User").insert([
        {
          username,
        },
      ])

      if (userInsertError) {
        console.error(`Error inserting user ${username}:`, userInsertError)
        return NextResponse.json(
          { error: "Failed to insert user" },
          { status: 500 }
        )
      }
    } else {
      console.log(`User ${username} already exists, skipping insertion.`)
    }

    //Insert video into Supabase table if not exists
    const { data: existingVideo, error: selectError } = await supabase
      .from("Video")
      .select("id")
      .eq("id", videoId)
      .single()

    if (selectError && selectError.code !== "PGRST116") {
      // Handle unexpected errors (ignore "row not found" error)
      console.error(`Error checking video ${videoId}:`, selectError)
      return NextResponse.json(
        { error: "Failed to check video" },
        { status: 500 }
      )
    }

    if (!existingVideo) {
      const { error: videoInsertError } = await supabase
        .from("Video")
        .insert([videoObj])

      // Initialize AI for the workflow
      initializeAI(process.env.GEMINI_API_KEY!)

      // Initialize AI for file operations
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY!,
      })

      let uploadResponse = null

      let videoStats = null
      try {
        console.log(
          "Fetching video stats for: ",
          `${process.env.BACKEND_URL}/video/stats/${username}/${videoId}`
        )
        videoStats = await fetch(
          `${process.env.BACKEND_URL}/video/stats/${username}/${videoId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
      } catch (error) {
        console.error(
          `Error fetching video stats for video ID ${videoId}:`,
          error
        )
      }

      const videoStatsData = await videoStats.json()

      videoStatsData.repostCount = parseInt(videoStatsData.repostCount) || 0

      videoStatsData.engagement_rate =
        videoStatsData.playCount === 0
          ? 0
          : (videoStatsData.diggCount + videoStatsData.commentCount) /
            videoStatsData.playCount

      videoStatsData.amplification_rate =
        videoStatsData.playCount === 0
          ? 0
          : (videoStatsData.shareCount + videoStatsData.repostCount) /
            videoStatsData.playCount

      console.log("Video stats:", videoStatsData)

      const { error: statsUpdateError } = await supabase
        .from("Video")
        .update(videoStatsData)
        .eq("id", videoId)
        .select()

      if (statsUpdateError) {
        console.error(`Error updating video ${videoId}:`, statsUpdateError)
      } else {
        console.log(`Successfully updated video ${videoId}`)
      }

      let videoResponse = null
      try {
        videoResponse = await fetch(
          `${process.env.BACKEND_URL}/download?video_url=${videoUrl}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "video/mp4",
              "User-Agent": "Vercel-Edge-Function/1.0",
            },
          }
        )
      } catch (error) {
        console.error(`Error downloading video ${videoId}:`, error)
      }

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

      console.log("Video size (bytes):", videoBlob.size)
      if (videoBlob.size >= 10 * 10e5) {
        console.log("Skipping video larger than 10MB")
        return NextResponse.json(
          { success: false, error: "Video too large to process" },
          { status: 400 }
        )
      }

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
        console.log(
          `Successfully updated video ${videoId} for user ${username}`
        )
      }

      // Clean up
      await ai.files.delete({ name: uploadResponse.name }).catch(console.warn)
      return NextResponse.json(
        {
          success: true,
          data: {
            userStats: videoStatsData,
            ai_processed_output: result,
          },
        },
        { status: 200 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Video processed successfully.",
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
