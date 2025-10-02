export default async function Page() {
  const response = await fetch(`/api/langgraph`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        { role: "user", content: "What is the weather in San Francisco?" },
      ],
    }),
    cache: "no-store",
  })

  const data = await response.json()

  if (!response.ok) {
    return <div>Error: {data.error}</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Langgraph Example</h1>
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold mb-2">Response:</h2>
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(data.result, null, 2)}
        </pre>
      </div>
    </div>
  )
}
