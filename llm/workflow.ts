import {
  GoogleGenAI,
  createPartFromUri,
  createUserContent,
} from "@google/genai"
import { Annotation, END, START, StateGraph } from "@langchain/langgraph"
import { S0Prompt, S1Prompt, S2Prompt, S3Prompt, S4PerVidPrompt, S4PerCreatorPrompt } from "./prompts"
import { S0Schema, S1Schema, S2Schema, S3Schema, S4PerVidSchema, S4PerCreatorSchema } from "./schema"
import { S0Output, S1Output, S2Output, S3Output, S4PerVidOutput, S4PerCreatorOutput } from "./types"

// Define the state for the graph
const GraphState = Annotation.Root({
  input: Annotation<{ mimeType: string; fileUri: string }>,
  stage0_output: Annotation<S0Output | undefined>,
  stage1_output: Annotation<S1Output | undefined>,
  stage2_output: Annotation<S2Output | undefined>,
  stage3_output: Annotation<S3Output | undefined>,
})

type StageOutputKey =
  | "stage0_output"
  | "stage1_output"
  | "stage2_output"
  | "stage3_output"
  | "stage4_output"
  | "stage5_output"

const STAGE_LABELS: Record<StageOutputKey, string> = {
  stage0_output: "Stage 0",
  stage1_output: "Stage 1",
  stage2_output: "Stage 2",
  stage3_output: "Stage 3",
  stage4_output: "Stage 4",
  stage5_output: "Stage 5",
}

export type GraphStateType = typeof GraphState.State

// Export input type for external use
export type WorkflowInput = {
  mimeType: string
  fileUri: string
}

// Export result type
export type WorkflowResult = {
  input: WorkflowInput
  stage0_output?: S0Output
  stage1_output?: S1Output
  stage2_output?: S2Output
  stage3_output?: S3Output
}

// Store AI instance for use in executeStage
let ai: GoogleGenAI

// Generic stage executor with error handling
async function executeStage<T, S extends Record<string, any>>(
  stageName: string,
  prompt: string,
  schema: any,
  outputKey: keyof S,
  state: S,
  contextKeys: (keyof S)[] = []
): Promise<Partial<S>> {
  console.log(`Entering ${stageName}`)

  const contextualOutputs = contextKeys.reduce<string[]>((acc, key) => {
    const value = state[key];

    if (value === undefined || value === null) {
      return acc;
    }

    const serialized =
      typeof value === "string" ? value : JSON.stringify(value, null, 2);

    acc.push(`${STAGE_LABELS[key as StageOutputKey] ?? String(key)} output:\n${serialized}`);
    return acc;
  }, []);

  // For fileUri/mimeType, check if present, otherwise skip (for per-vid rec)
  let fileUri: string | undefined;
  let mimeType: string | undefined;
  if ("input" in state && state.input) {
    fileUri = (state.input as any).fileUri;
    mimeType = (state.input as any).mimeType;
  }

  const contentParts = [];
  if (fileUri && mimeType) {
    contentParts.push(createPartFromUri(fileUri, mimeType));
  }
  contentParts.push(...contextualOutputs, prompt);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: createUserContent(contentParts),
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      maxOutputTokens: 8192,
    },
  });

  console.log(`${stageName} response text:`, response.text);

  if (!response.text || response.text === "undefined") {
    throw new Error(
      `${stageName} returned empty or undefined response. Possible token limit exceeded.`
    );
  }

  try {
    const parsedOutput: T = JSON.parse(response.text);
    return { [outputKey]: parsedOutput } as Partial<S>;
  } catch (error) {
    console.error(`${stageName} JSON parse error:`, error);
    console.error(`Response text:`, response.text);
    throw new Error(
      `${stageName} failed to parse JSON: ${(error as Error).message}`
    );
  }
}

const workflow = new StateGraph(GraphState)
  .addNode("s0", (state) =>
    executeStage<S0Output, GraphStateType>(
      "Stage 0",
      S0Prompt,
      S0Schema,
      "stage0_output",
      state
    )
  )
  .addNode("s1", (state) =>
    executeStage<S1Output, GraphStateType>(
      "Stage 1",
      S1Prompt,
      S1Schema,
      "stage1_output",
      state,
      ["stage0_output"]
    )
  )
  .addNode("s2", (state) =>
    executeStage<S2Output, GraphStateType>(
      "Stage 2",
      S2Prompt,
      S2Schema,
      "stage2_output",
      state,
      ["stage0_output", "stage1_output"]
    )
  )
  .addNode("s3", (state) =>
    executeStage<S3Output, GraphStateType>(
      "Stage 3",
      S3Prompt,
      S3Schema,
      "stage3_output",
      state,
      ["stage0_output", "stage1_output", "stage2_output"]
    )
  )
  .addEdge(START, "s0")
  .addEdge("s0", "s1")
  .addEdge("s1", "s2")
  .addEdge("s2", "s3")
  .addEdge("s3", END)

const app = workflow.compile()

const PerVidRecState = Annotation.Root({
  input: Annotation<{
    hygiene: string,
    engagement: number,
    script : string,
  }>(),
  stage4_output: Annotation<S4PerVidOutput | undefined>,
})

const recommendationPerVid = new StateGraph(PerVidRecState)
  .addNode("s4", (state) =>
    executeStage<S4PerVidOutput, typeof PerVidRecState.State>(
      "Stage 4",
      S4PerVidPrompt,
      S4PerVidSchema,
      "stage4_output",
      state,
      ["input"]
    )
  )
  .addEdge(START, "s4")
  .addEdge("s4", END)

const perVidApp = recommendationPerVid.compile()

const PerCreatorRecState = Annotation.Root({
  input: Annotation<{
    contentTypeAnalysis: { [key: string]: { totalEngagement: number; count: number } },
    avgHygiene: number,
    avgEngagement: number,
    script: string,
  }>(),
  stage4_output: Annotation<S4PerCreatorOutput | undefined>,
})

const recommendationPerCreator = new StateGraph(PerCreatorRecState)
  .addNode("s4", (state) =>
    executeStage<S4PerCreatorOutput, typeof PerCreatorRecState.State>(
      "Stage 4",
      S4PerCreatorPrompt,
      S4PerCreatorSchema,
      "stage4_output",
      state,
      ["input"]
    )
  )
  .addEdge(START, "s4")
  .addEdge("s4", END)

const perCreatorApp = recommendationPerCreator.compile()

// Initialize AI instance - must be called before running workflow
export function initializeAI(apiKey: string) {
  ai = new GoogleGenAI({ apiKey })
}

// Run the workflow with given input
export async function runWorkflow(
  input: WorkflowInput
): Promise<WorkflowResult> {
  if (!ai) {
    throw new Error("AI instance not initialized. Call initializeAI() first.")
  }

  const initialState: GraphStateType = {
    input,
    stage0_output: undefined,
    stage1_output: undefined,
    stage2_output: undefined,
    stage3_output: undefined,
  }

  const result = await app.invoke(initialState)
  return result as WorkflowResult
}

export async function getPerCreatorRecommendation(
  contentTypeAnalysis: { [key: string]: { totalEngagement: number; count: number } },
  avgHygiene: number,
  avgEngagement: number,
  script: string
): Promise<S4PerCreatorOutput> {
  if (!ai) {
    throw new Error("AI instance not initialized. Call initializeAI() first.")
  }
  const initialState = {
    input: { contentTypeAnalysis, avgHygiene, avgEngagement, script },
    stage4_output: undefined,
  } as typeof PerCreatorRecState.State

  const result = await perCreatorApp.invoke(initialState)
  return (
    result.stage4_output ?? {
      content_recommendation: "No recommendation",
      profile_recommendation: "No recommendation",
    }
  )
}

export async function getPerVidRecommendation(
  hygiene: string,
  engagement: number,
  script: string
): Promise<string> {
  if (!ai) {
    throw new Error("AI instance not initialized. Call initializeAI() first.")
  }
  const initialState = {
    input: { hygiene, engagement, script },
    stage4_output: undefined,
  } as typeof PerVidRecState.State

  const result = await perVidApp.invoke(initialState)
  return result.stage4_output?.recommendation || "No recommendation"
}
