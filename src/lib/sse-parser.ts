/**
 * SSE (Server-Sent Events) Parser Utility
 * Handles parsing of SSE streams from the chat API
 * 
 * This parser handles a non-standard SSE format where:
 * - Content can contain embedded newlines (paragraphs)
 * - Events are separated by double newlines followed by "data:"
 * - Stream ends with "data: [DONE]"
 */

export interface SSEParseOptions {
  onChunk?: (chunk: string) => void
  onComplete?: (fullContent: string) => void
  onError?: (error: Error) => void
}

/**
 * Parse raw SSE text into individual event data chunks
 * Handles content with embedded newlines by detecting event boundaries
 */
export function parseSSEText(text: string): string[] {
  const chunks: string[] = []
  
  // Split on double-newline followed by "data:" to separate events
  // This handles content that contains single newlines
  const events = text.split(/\n\n+(?=data:)/)
  
  for (const event of events) {
    const trimmed = event.trim()
    if (!trimmed) continue
    
    // Extract data after "data: " prefix
    if (trimmed.startsWith("data:")) {
      const data = trimmed.slice(5).trim()
      if (data && data !== "[DONE]") {
        chunks.push(data)
      }
    }
  }
  
  return chunks
}

/**
 * Parse an SSE stream and yield content chunks
 * Handles the backend's specific SSE format with embedded newlines
 */
export async function* parseSSEStream(
  response: Response
): AsyncGenerator<string, void, unknown> {
  if (!response.body) {
    throw new Error("No response body")
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        // Process any remaining buffer
        if (buffer.trim()) {
          const chunks = parseSSEText(buffer)
          for (const chunk of chunks) {
            yield chunk
          }
        }
        break
      }

      // Decode the chunk and add to buffer
      buffer += decoder.decode(value, { stream: true })

      // Check for completion signal
      if (buffer.includes("data: [DONE]")) {
        // Process everything before [DONE]
        const beforeDone = buffer.split("data: [DONE]")[0]
        if (beforeDone.trim()) {
          const chunks = parseSSEText(beforeDone)
          for (const chunk of chunks) {
            yield chunk
          }
        }
        return
      }

      // Process complete events (those followed by double newline + data:)
      // Keep incomplete data in buffer
      const eventBoundaryRegex = /\n\n+(?=data:)/g
      let lastIndex = 0
      let match

      while ((match = eventBoundaryRegex.exec(buffer)) !== null) {
        const eventText = buffer.slice(lastIndex, match.index)
        if (eventText.trim()) {
          const chunks = parseSSEText(eventText)
          for (const chunk of chunks) {
            yield chunk
          }
        }
        lastIndex = match.index + match[0].length
      }

      // Keep unprocessed data in buffer
      buffer = buffer.slice(lastIndex)
    }
  } finally {
    reader.releaseLock()
  }
}

/**
 * Create a streaming text accumulator
 * Useful for building up content while streaming
 */
export function createStreamAccumulator() {
  let content = ""

  return {
    append(chunk: string): string {
      content += chunk
      return content
    },
    getContent(): string {
      return content
    },
    reset(): void {
      content = ""
    },
  }
}

/**
 * Helper to consume an SSE stream with callbacks
 */
export async function consumeSSEStream(
  response: Response,
  options: SSEParseOptions
): Promise<string> {
  const { onChunk, onComplete, onError } = options
  let fullContent = ""

  try {
    for await (const chunk of parseSSEStream(response)) {
      fullContent += chunk
      onChunk?.(chunk)
    }
    onComplete?.(fullContent)
    return fullContent
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    onError?.(err)
    throw err
  }
}
