export const runtime = 'edge';

export async function GET(request) {
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
    const apiAUrl = `http://localhost:8000/profile/${username}`;
    
    const videoListResponse = await fetch(apiAUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add any required API keys or auth headers
        // 'Authorization': `Bearer ${process.env.API_A_TOKEN}`,
        'User-Agent': 'Vercel-Edge-Function/1.0'
      },
    });

    if (!videoListResponse.ok) {
      throw new Error(`API A failed: ${videoListResponse.status} ${videoListResponse.statusText}`);
    }

    const videoListData = await videoListResponse.json();
    console.log(videoListData);
    
    // Extract video URLs (adjust based on actual API response structure)
    let videoUrls;
    if (videoListData.videos) {
      videoUrls = videoListData.videos;
    } else {
      throw new Error('Unexpected API A response structure');
    }

    // Get first 10 videos
    const first10Videos = videoUrls.slice(0, 10);
    console.log(`Found ${videoUrls.length} videos, processing first 10`);

    // // Step 2: Call API B for each video to get detailed information
    // const videoDetailsPromises = first10Videos.map(async (video, index) => {
    //   try {
    //     // Extract video ID or URL (adjust based on your video object structure)
    //     const videoId = video.id; //|| video.url || video;
    //     const apiBUrl = `http://localhost:8000/video/stats/${username}/${videoId}`;
        
    //     const detailResponse = await fetch(apiBUrl, {
    //       method: 'GET',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         // Add any required API keys or auth headers
    //         // 'Authorization': `Bearer ${process.env.API_B_TOKEN}`,
    //         'User-Agent': 'Vercel-Edge-Function/1.0'
    //       },
    //     });

    //     if (!detailResponse.ok) {
    //       console.warn(`API B failed for video ${index + 1}: ${detailResponse.status}`);
    //       return {
    //         videoId,
    //         error: `Failed to fetch details: ${detailResponse.status}`,
    //         originalVideo: video
    //       };
    //     }

    //     const detailData = await detailResponse.json();
    //     console.log("success: ", videoId);
    //     console.log(detailData);
        
    //     return {
    //       videoId,
    //       details: detailData
    //     };
        
    //   } catch (error) {
    //     console.error(`Error processing video ${index + 1}:`, error);
    //     return {
    //       videoId: video.id || video.url || video,
    //       error: error.message,
    //       originalVideo: video
    //     };
    //   }
    // });

    // // // Wait for all API B calls to complete
    // // const videoDetails = await Promise.all(videoDetailsPromises);

    // // // Prepare response
    // // const response = {
    // //   username,
    // //   totalVideosFound: videoUrls.length,
    // //   processedCount: first10Videos.length,
    // //   videos: videoDetails,
    // //   timestamp: new Date().toISOString(),
    // //   region: process.env.VERCEL_REGION
    // // };

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