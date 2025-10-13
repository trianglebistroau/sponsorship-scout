import { supabase } from '@/utils/supabase/client';

export async function POST(req: Request) {
  //Params
  const body = await req.json()
  // console.log("Request body:", body)
  const videoLinks = body.videoLinks ?? [];
  const username = body.username ?? null;

  const videoIds = videoLinks.map(url => {
    const match = url.match(/@([^/]+)\/video\/(\d+)/);
    return {
      // username: match ? match[1] : null,
      id: match ? match[2] : null
    };
  });
  // console.log(videoIds);

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
  const first10Videos = videoIds;
  console.log(`Found ${videoIds.length} videos, processing first 10`);

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
    // const { collectCount, commentCount, diggCount, playCount, repostCount, shareCount } = video.stats;
    const videoObj = {
      id: videoId,
      username: username,
      // created_at: video.create_time,
      // collectCount: collectCount,
      // commentCount: commentCount,
      // diggCount: diggCount,
      // playCount: playCount,
      // repostCount: repostCount,
      // shareCount: shareCount
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

  return new Response(null, { status: 204 });
}