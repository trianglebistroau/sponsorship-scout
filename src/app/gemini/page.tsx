// import { GoogleGenAI, Type } from "@google/genai"

// export default async function Page() {
//   const ai = new GoogleGenAI({
//     apiKey: process.env.GEMINI_API_KEY,
//   })

//   let uploadResponse = null

//   try {
//     // Fetch the video file from the provided API endpoint
//     const request = {
//       method: "GET",
//       headers: {
//         "Content-Type": "video/mp4",
//       },
//     }
//     const videoUrl =
//       "https://3bb7af4bcb0c.ngrok-free.app/download?video_url=https://www.tiktok.com/@hwg_yangg/video/7539167831678618897"
//     const videoResponse = await fetch(videoUrl, request)

//     if (!videoResponse.ok) {
//       throw new Error(
//         `Failed to fetch video: ${videoResponse.status} ${videoResponse.statusText}`
//       )
//     }

//     const videoBlob = await videoResponse.blob()
//     console.log("Video blob:", videoBlob)

//     uploadResponse = await ai.files.upload({
//       file: videoBlob,
//       config: {
//         mimeType: "video/mp4",
//       },
//     })

//     console.log("uploadResponse", uploadResponse)

//     // Wait for the file to be processed
//     let fileStatus = uploadResponse
//     while (fileStatus.state === "PROCESSING") {
//       console.log("File is still processing, waiting...")
//       await new Promise((resolve) => setTimeout(resolve, 2000))

//       fileStatus = await ai.files.get({ name: uploadResponse.name })
//       console.log("File status:", fileStatus.state)
//     }

//     if (fileStatus.state === "FAILED") {
//       throw new Error("File processing failed")
//     }

//     const response = await ai.models.generateContent({
//       model: "gemini-2.5-flash-lite-preview-06-17",
//       config: {
//         responseMimeType: "application/json",
//         responseSchema: {
//           type: Type.ARRAY,
//           items: {
//             type: Type.OBJECT,
//             properties: {
//               description: {
//                 type: Type.STRING,
//               },
//               position: {
//                 type: Type.STRING,
//               },
//               time: {
//                 type: Type.NUMBER,
//               },
//             },
//             propertyOrdering: ["description", "position", "time"],
//           },
//         },
//       },
//       contents: [
//         {
//           role: "user",
//           parts: [
//             { text: "Explain the content of this video?" },
//             {
//               fileData: {
//                 mimeType: fileStatus.mimeType,
//                 fileUri: fileStatus.uri,
//               },
//             },
//           ],
//         },
//       ],
//     })

//     // Clean up: Delete the file after getting the response
//     try {
//       await ai.files.delete({ name: uploadResponse.name })
//       console.log("File deleted successfully:", uploadResponse.name)
//     } catch (deleteError) {
//       console.warn("Failed to delete file:", deleteError)
//       // Don't throw here, since we got our response successfully
//     }

//     // Extract the response text
//     const responseText = response.text

//     return (
//       <div className="p-4">
//         <h1 className="text-2xl font-bold mb-4">Video Analysis</h1>
//         <div className="bg-gray-100 p-4 rounded">
//           <h2 className="font-semibold mb-2">Response:</h2>
//           <pre className="whitespace-pre-wrap">{responseText}</pre>
//         </div>
//       </div>
//     )
//   } catch (error) {
//     console.error("Error:", error)

//     // Clean up file even if there was an error (if upload was successful)
//     if (uploadResponse?.name) {
//       try {
//         await ai.files.delete({ name: uploadResponse.name })
//         console.log("File deleted after error:", uploadResponse.name)
//       } catch (deleteError) {
//         console.warn("Failed to delete file after error:", deleteError)
//       }
//     }
//   }
// }
export default async function Page() {
  const response = await fetch(`api/analyze-video`, {
    cache: 'no-store'
  });
  
  const data = await response.json();

  if (!data.success) {
    return <div>Error: {data.error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Video Analysis</h1>
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold mb-2">Response:</h2>
        <pre className="whitespace-pre-wrap">{data.data}</pre>
      </div>
    </div>
  );
}