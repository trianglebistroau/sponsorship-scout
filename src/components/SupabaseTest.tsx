import { supabase } from "../utils/supabase/client";

export default async function Page() {
  const { data: video, error } = await supabase.from("Video").select("*");

  console.log("data", video);

  return (
    <ul>
      {video?.map((video) => (
        <li key={video.id}>{JSON.stringify(video)}</li>
      ))}
    </ul>
  );
}
