/**
 * HTTP Chat API service
 * Base path: /api/v1/chat
 */

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
}

export interface ChatHistoryResponse {
  messages: ChatHistoryMessage[]
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
 * Parse concatenated JSON objects from a string buffer
 * Returns parsed objects and remaining unparsed buffer
 */
function parseJsonChunks(buffer: string): { objects: Array<{ type: string; content?: string; full_response?: string }>; remaining: string } {
  const objects: Array<{ type: string; content?: string; full_response?: string }> = []
  let remaining = buffer
  let startIndex = 0

  while (startIndex < remaining.length) {
    // Find the start of a JSON object
    const objStart = remaining.indexOf("{", startIndex)
    if (objStart === -1) break

    // Track brace depth to find matching closing brace
    let depth = 0
    let inString = false
    let escaped = false
    let objEnd = -1

    for (let i = objStart; i < remaining.length; i++) {
      const char = remaining[i]

      if (escaped) {
        escaped = false
        continue
      }

      if (char === "\\") {
        escaped = true
        continue
      }

      if (char === '"') {
        inString = !inString
        continue
      }

      if (!inString) {
        if (char === "{") depth++
        else if (char === "}") {
          depth--
          if (depth === 0) {
            objEnd = i
            break
          }
        }
      }
    }

    if (objEnd === -1) {
      // Incomplete JSON object, keep in buffer
      remaining = remaining.slice(objStart)
      break
    }

    // Extract and parse the JSON object
    const jsonStr = remaining.slice(objStart, objEnd + 1)
    try {
      const parsed = JSON.parse(jsonStr)
      objects.push(parsed)
    } catch {
      // Invalid JSON, skip this portion
    }

    startIndex = objEnd + 1
    if (startIndex >= remaining.length) {
      remaining = ""
      break
    }
    remaining = remaining.slice(startIndex)
    startIndex = 0
  }

  return { objects, remaining }
}

/**
 * Stream a message to the chat session
 * Returns an async generator that yields content chunks
 * Parses JSON responses in format: {"type":"token","content":"..."} or {"type":"complete","full_response":"..."}
 */
export async function* streamMessage(
  sessionId: string,
  content: string
): AsyncGenerator<string, void, unknown> {
  console.log(`[streamMessage] Starting stream for session: ${sessionId}`)
  
  const response = await fetch(`${API_BASE}/${sessionId}/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
    } as StreamMessageRequest),
  })

  console.log(`[streamMessage] Response status: ${response.status}`)

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[streamMessage] Error response:`, errorText)
    throw new Error(`Failed to stream message: ${response.status} ${response.statusText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error("No response body")
  }

  const decoder = new TextDecoder()
  let buffer = ""
  let chunkCount = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        console.log(`[streamMessage] Stream complete. Total chunks: ${chunkCount}`)
        break
      }

      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk
      chunkCount++
      
      console.log(`[streamMessage] Chunk ${chunkCount}, buffer length: ${buffer.length}`)
      console.log(`[streamMessage] Buffer preview:`, buffer.substring(0, 200))

      // Check if response is SSE format (data: content)
      if (buffer.includes("data:")) {
        // Process SSE format
        const lines = buffer.split("\n")
        // Keep last line in buffer if it might be incomplete
        buffer = lines[lines.length - 1] || ""
        
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim()
          if (line.startsWith("data:")) {
            const content = line.replace(/^data:\s*/, "")
            if (content && content !== "[DONE]") {
              console.log(`[streamMessage] Yielding SSE content: ${content.substring(0, 50)}...`)
              yield content
            } else if (content === "[DONE]") {
              console.log(`[streamMessage] Received [DONE] signal`)
              return
            }
          }
        }
      } else {
        // Parse as JSON format
        const { objects, remaining } = parseJsonChunks(buffer)
        buffer = remaining

        console.log(`[streamMessage] Parsed ${objects.length} objects, remaining buffer: ${remaining.length}`)

        // Yield content from each token
        for (const obj of objects) {
          if (obj.type === "token" && obj.content) {
            console.log(`[streamMessage] Yielding token: ${obj.content.substring(0, 50)}...`)
            yield obj.content
          } else if (obj.type === "complete") {
            console.log(`[streamMessage] Received complete signal`)
            return
          }
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      console.log(`[streamMessage] Processing remaining buffer: ${buffer.length} chars`)
      
      // Check for SSE format
      if (buffer.includes("data:")) {
        const lines = buffer.split("\n")
        for (const line of lines) {
          if (line.trim().startsWith("data:")) {
            const content = line.replace(/^data:\s*/, "").trim()
            if (content && content !== "[DONE]") {
              yield content
            }
          }
        }
      } else {
        // Try JSON format
        const { objects } = parseJsonChunks(buffer)
        for (const obj of objects) {
          if (obj.type === "token" && obj.content) {
            yield obj.content
          }
        }
      }
    }
  } catch (error) {
    console.error(`[streamMessage] Stream error:`, error)
    throw error
  } finally {
    reader.releaseLock()
  }
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
