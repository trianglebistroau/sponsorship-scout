/**
 * HTTP Chat API service
 * Base path: /api/v1/chat
 */

import { parseSSEStream } from "./sse-parser"

export interface CreateSessionRequest {
  system_instruction: string
}

export interface CreateSessionResponse {
  session_id: string
}

export interface StreamMessageRequest {
  content: string
}

export interface ChatHistoryMessage {
  role: "user" | "assistant"
  content: string
  timestamp?: string
  source?: string
}

export interface ChatHistoryResponse {
  session_id: string
  message_history: ChatHistoryMessage[]
}

const API_BASE = "/api/v1/chat"

/**
 * Create a new chat session
 */
export async function createChatSession(
  systemInstruction: string = "You are a helpful AI assistant"
): Promise<CreateSessionResponse> {
  const response = await fetch(`${API_BASE}/session/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      system_instruction: systemInstruction,
    } as CreateSessionRequest),
  })

  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Stream a message to the chat session
 * Returns an async generator that yields content chunks
 */
export async function* streamMessage(
  sessionId: string,
  content: string
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(`${API_BASE}/${sessionId}/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
    } as StreamMessageRequest),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[streamMessage] Error response:`, errorText)
    throw new Error(`Failed to stream message: ${response.status} ${response.statusText}`)
  }

  // Use the SSE parser to handle the stream
  yield* parseSSEStream(response)
}

/**
 * Get chat history for a session
 */
export async function getChatHistory(
  sessionId: string
): Promise<ChatHistoryResponse> {
  const response = await fetch(`${API_BASE}/${sessionId}/history`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get history: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Delete a chat session
 */
export async function deleteChatSession(sessionId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${sessionId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error(`Failed to delete session: ${response.statusText}`)
  }
}
