import { initializeAI, getPerVidRecommendation, getPerCreatorRecommendation } from "llm/workflow"

import { supabase } from "@/utils/supabase/client"
import { NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

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
      

    const { data: videoData, error: videoError } = await supabase
    .from("Video")
    .select("id, engagement_score, engagement_rating, ai_processed_output")
    .eq("username", username)
    .not("ai_processed_output", 'is', null)

    if (videoError) {
        console.error("Error fetching video data:", videoError)
        return NextResponse.json({ done: "Error fetching video data" }, { status: 500 })
    }

    const evaluatedVideos = await Promise.all(videoData.map(async (video: any) => {
        const hygiene = video?.ai_processed_output?.stage2_output?.overall_score?.category || "Unknown";
        const engagement = video?.engagement_rating || "Unknown";
        
        console.log(`Video ID: ${video.id}, Hygiene: ${hygiene}, Engagement: ${engagement}`);
        
        let evaluation = "No evaluation available";
        if (hygiene === "Excellent" && engagement === "Excellent") {
            evaluation = "role model";
        } else if (hygiene === "Poor" &&  engagement === "Excellent") {
            evaluation = "idea resonates, fix technicals";
        } else if (hygiene === "Poor" && engagement === "Poor") {
            evaluation = "technical flaws are blocking performance and content is missing audience attention";
        } else if (hygiene === "Excellent" && engagement === "Poor") {
            evaluation = "content idea not resonating, test new content type";
        }
        
        // Get recommendation from AI for the video
        const ai_evaluation = await getPerVidRecommendation(hygiene, engagement, video.script || "");

        console.log(`Video ID: ${video.id}, Evaluation: ${evaluation}`);
        return { ...video, evaluation : ai_evaluation };
    }));

    console.log("Evaluated Videos:", evaluatedVideos);

    // Update evaluated videos back to Supabase
    for (const video of evaluatedVideos) {
        const { id, evaluation } = video;
        const { error: updateError } = await supabase
            .from("Video")
            .update({ evaluation })
            .eq("id", id);

        if (updateError) {
            console.error(`Error updating video ${id}:`, updateError);
        } else {
            console.log(`Video ${id} updated successfully.`);
        }
    }

    // Per content type analysis
    const contentTypeAnalysis = videoData.reduce((acc: { [key: string]: { totalEngagement: number; count: number } }, video: any) => {
        const contentType = video?.ai_processed_output?.stage3_output?.content_type_primary || "Unknown";
        const engagementScore = video?.engagement_score || 0;

        if (!acc[contentType]) {
            acc[contentType] = { totalEngagement: 0, count: 0 };
        }

        acc[contentType].totalEngagement = (acc[contentType].totalEngagement * (acc[contentType].count) + engagementScore) / (acc[contentType].count += 1);

        return acc;
    }, {});

    console.log("Content Type Analysis:", contentTypeAnalysis);

    // Per creator analysis
    const creatorAnalysis = videoData.reduce((acc: { avgHygiene: number; avgEngagement: number; count: number }, video: any) => {
        const hygieneLevel = video?.ai_processed_output?.stage2_output?.overall_score?.numeric_score || 0;
        const engagementLevel = video?.engagement_score || 0;

        acc.avgHygiene = (acc.avgHygiene * acc.count + hygieneLevel) / (acc.count += 1);
        acc.avgEngagement = (acc.avgEngagement * (acc.count - 1) + engagementLevel) / acc.count;
        return acc;
    }, { avgHygiene: 0, avgEngagement: 0, count: 0 });

    console.log("Creator Analysis:", creatorAnalysis);

    let creatorReccommendation = null;
    if (creatorAnalysis.avgHygiene > 2 && creatorAnalysis.avgEngagement < 0.8) {
        creatorReccommendation =  "Strategy issue (hooks, CTAs, content style)";
    } else if (creatorAnalysis.avgHygiene < 1 && creatorAnalysis.avgEngagement > 1.2) {
        creatorReccommendation = "Concept works, fix recurring technical issues";
    }

    // Get recommendation from AI for the creator
    const ai_creator_evaluation = await getPerCreatorRecommendation(
        contentTypeAnalysis,
        creatorAnalysis.avgHygiene,
        creatorAnalysis.avgEngagement,
        creatorReccommendation || "" // Use existing recommendation as script
    )

    console.log("AI Creator Evaluation:", ai_creator_evaluation);

    // update to Supabase
    const { error: creatorUpdateError } = await supabase
        .from("User")
        .update({
            content_analysis : contentTypeAnalysis,
            profile_analysis: creatorAnalysis,
            recommendation: ai_creator_evaluation.content_recommendation + "\n\n" + ai_creator_evaluation.profile_recommendation
        })
        .eq("username", username);

    if (creatorUpdateError) {
        console.error(`Error updating user ${username}:`, creatorUpdateError);
    } else {
        console.log(`User ${username} updated successfully.`);
    }

    return NextResponse.json({
        contentType : contentTypeAnalysis,
        creatorAnalysis,
        ai_creator_evaluation
    }, { status: 200 })
}