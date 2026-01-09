/**
 * WebSocket Chat service
 * Endpoint: /ws/chat/{session_id}
 */

export type WebSocketMessageType = "message" | "error" | "connected" | "typing"

export interface WebSocketMessage {
  type: WebSocketMessageType
  payload: {
    content?: string
    error?: string
  }
}

export interface ChatWebSocketOptions {
  sessionId: string
  onMessage: (content: string) => void
  onError?: (error: string) => void
  onOpen?: () => void
  onClose?: () => void
  onTyping?: (isTyping: boolean) => void
}

export class ChatWebSocket {
  private ws: WebSocket | null = null
  private sessionId: string
  private options: ChatWebSocketOptions
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private jsonBuffer = ""

  constructor(options: ChatWebSocketOptions) {
    this.sessionId = options.sessionId
    this.options = options
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    // WebSocket connections need to go directly to the backend
    // Next.js rewrites don't support WebSocket upgrades
    const isDev =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")

    let wsUrl: string
    if (isDev) {
      // In development, connect directly to the backend
      wsUrl = `ws://localhost:8000/ws/chat/${this.sessionId}`
    } else {
      // In production, use the same host with appropriate protocol
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      const host = window.location.host
      wsUrl = `${protocol}//${host}/ws/chat/${this.sessionId}`
    }

    this.ws = new WebSocket(wsUrl)

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      this.options.onOpen?.()
    }

    this.ws.onmessage = (event) => {
      const rawData = event.data as string

      // Handle SSE format: "data: content here\n" or "data: [DONE]"
      if (rawData.startsWith("data:")) {
        const content = rawData.replace(/^data:\s*/, "").trim()
        if (content === "[DONE]") {
          return
        }
        this.options.onMessage(content)
        return
      }

      // Handle multiple SSE lines in a single message
      if (rawData.includes("data:")) {
        const lines = rawData.split(/\n+/)
        for (const line of lines) {
          if (line.startsWith("data:")) {
            const content = line.replace(/^data:\s*/, "").trim()
            if (content && content !== "[DONE]") {
              this.options.onMessage(content)
            }
          }
        }
        return
      }

      // Try parsing as concatenated JSON format: {"type":"token","content":"..."}{"type":"token","content":"..."}
      this.jsonBuffer += rawData
      this.parseJsonTokens()
    }

    this.ws.onerror = () => {
      this.options.onError?.("WebSocket connection error")
    }

    this.ws.onclose = () => {
      this.options.onClose?.()
      this.attemptReconnect()
    }
  }

  /**
   * Parse concatenated JSON tokens from buffer
   */
  private parseJsonTokens(): void {
    let startIdx = 0
    
    while (startIdx < this.jsonBuffer.length) {
      const openBrace = this.jsonBuffer.indexOf("{", startIdx)
      if (openBrace === -1) break

      // Find matching closing brace
      let depth = 0
      let inString = false
      let escaped = false
      let closeBrace = -1

      for (let i = openBrace; i < this.jsonBuffer.length; i++) {
        const char = this.jsonBuffer[i]

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
              closeBrace = i
              break
            }
          }
        }
      }

      if (closeBrace === -1) {
        // Incomplete JSON, wait for more data
        break
      }

      // Extract and parse complete JSON object
      const jsonStr = this.jsonBuffer.slice(openBrace, closeBrace + 1)
      
      try {
        const parsed = JSON.parse(jsonStr)
        
        if (parsed.type === "token" && parsed.content) {
          // Send content directly - React will handle the smooth rendering
          this.options.onMessage(parsed.content)
        } else if (parsed.type === "complete") {
          // Stream complete
          return
        }
      } catch (error) {
        console.error("Failed to parse JSON token:", error)
      }

      startIdx = closeBrace + 1
    }

    // Remove processed portion from buffer
    if (startIdx > 0) {
      this.jsonBuffer = this.jsonBuffer.slice(startIdx)
    }
  }

  /**
   * Handle incoming WebSocket messages (legacy structured format)
   */
  private handleMessage(data: WebSocketMessage): void {
    switch (data.type) {
      case "message":
        if (data.payload.content) {
          this.options.onMessage(data.payload.content)
        }
        break
      case "error":
        this.options.onError?.(data.payload.error || "Unknown error")
        break
      case "typing":
        this.options.onTyping?.(true)
        break
      case "connected":
        // Connection acknowledged
        break
      default:
        // Handle unknown message types
        if (data.payload.content) {
          this.options.onMessage(data.payload.content)
        }
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      setTimeout(() => {
        this.connect()
      }, delay)
    }
  }

  /**
   * Send a message through the WebSocket
   */
  sendMessage(content: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: "message",
        payload: {
          content,
        },
      }
      this.ws.send(JSON.stringify(message))
    } else {
      this.options.onError?.("WebSocket is not connected")
    }
  }

  /**
   * Check if the WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

/**
 * React hook helper for creating a chat WebSocket connection
 */
export function createChatWebSocket(options: ChatWebSocketOptions): ChatWebSocket {
  return new ChatWebSocket(options)
}
