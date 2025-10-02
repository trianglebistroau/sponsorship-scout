import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { questions } = body;

    if (!questions || !Array.isArray(questions)) {
      return Response.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      model: "gemini-2.5-flash",
      maxOutputTokens: 2048,
    });

    // Convert questions to messages
    const messages = questions.map((q: string) => new HumanMessage(q));

    // Invoke the model directly
    const result = await model.invoke(messages);
    
    return Response.json({ result: result.content });
  } catch (error) {
    return Response.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}