import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai"
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { S0Schema, S1Schema, S2Schema, S3Schema } from "./schema";
import { S0Output, S1Output, S2Output, S3Output } from "./types";
import { S0Prompt, S1Prompt, S2Prompt, S3Prompt } from "./prompts";

// Define the state for the graph
const GraphState = Annotation.Root({
  input: Annotation<{ mimeType: string; fileUri: string }>,
  stage0_output: Annotation<S0Output | undefined>,
  stage1_output: Annotation<string | undefined>,
  stage2_output: Annotation<string | undefined>,
});

export type GraphStateType = typeof GraphState.State;

// Export input type for external use
export type WorkflowInput = {
  mimeType: string;
  fileUri: string;
};

// Export result type
export type WorkflowResult = {
  input: WorkflowInput;
  stage0_output?: S0Output;
  stage1_output?: string;
  stage2_output?: string;
};

// Store AI instance for use in executeStage
let ai: GoogleGenAI;

// Generic stage executor with error handling
async function executeStage<T>(
  stageName: string,
  prompt: string,
  schema: any,
  outputKey: string,
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  console.log(`Entering ${stageName}`);
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: createUserContent([
      createPartFromUri(state.input.fileUri, state.input.mimeType),
      prompt,
    ]),
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      maxOutputTokens: 8192,
    }
  });
  
  console.log(`${stageName} response text:`, response.text);
  
  if (!response.text || response.text === "undefined") {
    throw new Error(`${stageName} returned empty or undefined response. Possible token limit exceeded.`);
  }
  
  try {
    const parsedOutput: T = JSON.parse(response.text);
    return { [outputKey]: parsedOutput };
  } catch (error) {
    console.error(`${stageName} JSON parse error:`, error);
    console.error(`Response text:`, response.text);
    throw new Error(`${stageName} failed to parse JSON: ${(error as Error).message}`);
  }
}

const workflow = new StateGraph(GraphState)
  .addNode("s0", (state) => executeStage<S0Output>("Stage 0", S0Prompt, S0Schema, "stage0_output", state))
  .addNode("s1", (state) => executeStage<S1Output>("Stage 1", S1Prompt, S1Schema, "stage1_output", state))
  .addNode("s2", (state) => executeStage<S2Output>("Stage 2", S2Prompt, S2Schema, "stage2_output", state))
  .addNode("s3", (state) => executeStage<S3Output>("Stage 3", S3Prompt, S3Schema, "stage3_output", state))
  .addEdge(START, "s0")
  .addEdge("s0", "s1")
  .addEdge("s1", "s2")
  .addEdge("s2", "s3")
  .addEdge("s3", END);

const app = workflow.compile();

// Initialize AI instance - must be called before running workflow
export function initializeAI(apiKey: string) {
  ai = new GoogleGenAI({ apiKey });
}

// Run the workflow with given input
export async function runWorkflow(input: WorkflowInput): Promise<WorkflowResult> {
  if (!ai) {
    throw new Error("AI instance not initialized. Call initializeAI() first.");
  }

  const initialState: GraphStateType = {
    input,
    stage0_output: undefined,
    stage1_output: undefined,
    stage2_output: undefined,
  };

  const result = await app.invoke(initialState);
  return result as WorkflowResult;
}