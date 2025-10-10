export async function POST(req: Request) {
  //Params
  const body = await req.json()
  console.log("Request body:", body)

  return new Response(null, { status: 204 });
}