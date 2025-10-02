import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    // Extract username from URL search params
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    // Validate username
    if (!username) {
      return Response.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    console.log(`Processing request for username: ${username}`);

    // Step 1: Call API A to get video URLs
    //
    const apiAUrl = `https://3bb7af4bcb0c.ngrok-free.app/profile/${username}`;
    
    const ProfileResponse = await fetch(apiAUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add any required API keys or auth headers
        // 'Authorization': `Bearer ${process.env.API_A_TOKEN}`,
        'User-Agent': 'Vercel-Edge-Function/1.0'
      },
    });

    if (!ProfileResponse.ok) {
      throw new Error(`API A failed: ${ProfileResponse.status} ${ProfileResponse.statusText}`);
    }

    const { stats, videos: videoListData } = await ProfileResponse.json();
    console.log(stats);
    const {diggCount : viewCount, followerCount, heartCount : likeCount, videoCount} = stats;
    console.log(videoListData);
    
    // Extract video URLs (adjust based on actual API response structure)
    let videoUrls;
    if (videoListData) {
      videoUrls = videoListData;
    } else {
      throw new Error('Unexpected API A response structure');
    }

    // Step 2: Check if user exists in User table, insert if not
    const { data: existingUser, error: userSelectError } = await supabase
      .from('User')
      .select('username')
      .eq('username', username)
      .single();

    if (userSelectError && userSelectError.code !== 'PGRST116') {
      // Handle unexpected errors (ignore "row not found" error)
      console.error(`Error checking user ${username}:`, userSelectError);
      return Response.json(
        { error: 'Failed to check user' },
        { status: 500 }
      );
    }

    if (!existingUser) {
      const { error: userInsertError } = await supabase
        .from('User')
        .insert([{
          username,
          viewCount,
          followerCount,
          likeCount,
          videoCount
        }]);

      if (userInsertError) {
        console.error(`Error inserting user ${username}:`, userInsertError);
        return Response.json(
          { error: 'Failed to insert user' },
          { status: 500 }
        );
      }
    } else {
      console.log(`User ${username} already exists, skipping insertion.`);
    }

    // Get first 10 videos
    const first10Videos = videoUrls.slice(0, 10);
    console.log(`Found ${videoUrls.length} videos, processing first 10`);

    // Step 3: Insert videos into Supabase table
    for (const video of first10Videos) {
      const videoId = video.id; // Extract video ID as number

      // Check if video already exists in the table
      const { data: existingVideo, error: selectError } = await supabase
        .from('Video')
        .select('id')
        .eq('id', videoId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        // Handle unexpected errors (ignore "row not found" error)
        console.error(`Error checking video ${videoId}:`, selectError);
        continue;
      }

      if (existingVideo) {
        console.log(`Video ${videoId} already exists, skipping.`);
        continue;
      }

      // Insert new video entry
      const { collectCount, commentCount, diggCount, playCount, repostCount, shareCount } = video.stats;
      const videoObj = {
        id: videoId,
        username: username,
        created_at: video.create_time,
        collectCount: collectCount,
        commentCount: commentCount,
        diggCount: diggCount,
        playCount: playCount,
        repostCount: repostCount,
        shareCount: shareCount
      }
      const { error: insertError } = await supabase
        .from('Video')
        .insert(
          videoObj,
        );

      if (insertError) {
        console.error(`Error inserting video ${videoId}:`, insertError);
      } else {
        console.log(`Inserted video ${videoId} successfully.`);
      }
    }

    return Response.json({"result" : "hehe"}, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Edge function error:', error);
    
    return Response.json(
      { 
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString(),
        region: process.env.VERCEL_REGION
      },
      { status: 500 }
    );
  }
}