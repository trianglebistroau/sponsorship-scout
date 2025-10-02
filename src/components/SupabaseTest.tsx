import { supabase } from "../utils/supabase/client"

export default async function Page() {
  const { data: video, error } = await supabase.from("Video").select("*")
  const { data: user, error: userError } = await supabase
    .from("User")
    .select("*")

  const { data: testData, error: testError } = await supabase
    .from("Video")
    .select("*")
    .eq("username", "hwg_yangg")

  console.log("Test data for hwg_yangg:", testData)

  return (
    <div>
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Video Table
        </h2>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm text-gray-700">
          {JSON.stringify(video, null, 2)}
        </pre>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          User Table
        </h2>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm text-gray-700">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  )
}
