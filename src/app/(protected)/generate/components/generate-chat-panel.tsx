"use client"

import { Loader2, Paperclip, RefreshCcw, Send, Wifi, WifiOff } from "lucide-react"
import * as React from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

import { createChatSession, deleteChatSession } from "@/lib/chat-api"
import { ChatWebSocket } from "@/lib/chat-websocket"
import { convertMarkdownToHtml } from "../utils"

type ChatMessage = {
  id: string
  role: "assistant" | "user"
  content: string
  timestamp: string
}

const initialMessage: ChatMessage = {
  id: "assistant-1",
  role: "assistant",
  content:
    "### Thought Process\nShare your ideas, vision, and what makes your content unique. I'll help refine your concepts and provide suggestions.",
  timestamp: "Just now",
}

export type GenerateChatPanelProps = {
  className?: string
}

export function GenerateChatPanel({ className }: GenerateChatPanelProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([initialMessage])
  const [inputValue, setInputValue] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isConnected, setIsConnected] = React.useState(false)
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const wsRef = React.useRef<ChatWebSocket | null>(null)
  const currentAssistantMessageRef = React.useRef<string | null>(null)

  // Initialize session and WebSocket connection
  React.useEffect(() => {
    const initSession = async () => {
      try {
        const response = await createChatSession(
          "You are a creative AI assistant helping content creators refine their ideas, vision, and unique content concepts. Provide helpful suggestions and engage thoughtfully with their creative process."
        )
        setSessionId(response.session_id)
        setError(null)

        // Connect WebSocket after session is created
        const ws = new ChatWebSocket({
          sessionId: response.session_id,
          onMessage: (content) => {
            setIsLoading(false)

            // If we don't have a current assistant message, create one
            if (!currentAssistantMessageRef.current) {
              const newMessageId = `assistant-${Date.now()}`
              currentAssistantMessageRef.current = newMessageId
              setMessages((prev) => [
                ...prev,
                {
                  id: newMessageId,
                  role: "assistant",
                  content: content,
                  timestamp: "Just now",
                },
              ])
            } else {
              // Append to existing assistant message
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === currentAssistantMessageRef.current
                    ? { ...msg, content: msg.content + content }
                    : msg
                )
              )
            }
          },
          onError: (errorMsg) => {
            setError(errorMsg)
            setIsLoading(false)
          },
          onOpen: () => {
            setIsConnected(true)
            setError(null)
          },
          onClose: () => {
            setIsConnected(false)
          },
        })

        ws.connect()
        wsRef.current = ws
      } catch (err) {
        console.error("Failed to create session:", err)
        setError("Failed to connect to chat service. Please try again.")
      }
    }

    initSession()

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect()
      }
      if (sessionId) {
        deleteChatSession(sessionId).catch(console.error)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!inputValue.trim() || isLoading) return

      if (!wsRef.current?.isConnected()) {
        setError("Not connected. Please wait or refresh to reconnect.")
        return
      }

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: inputValue,
        timestamp: "Just now",
      }

      setMessages((prev) => [...prev, userMessage])
      setInputValue("")
      setIsLoading(true)
      setError(null)

      // Reset current assistant message ref for new response
      currentAssistantMessageRef.current = null

      // Send via WebSocket
      wsRef.current.sendMessage(inputValue)
    },
    [inputValue, isLoading]
  )

  const handleNewThread = React.useCallback(async () => {
    // Disconnect existing WebSocket
    if (wsRef.current) {
      wsRef.current.disconnect()
    }

    // Delete old session
    if (sessionId) {
      try {
        await deleteChatSession(sessionId)
      } catch (err) {
        console.error("Failed to delete old session:", err)
      }
    }

    setMessages([initialMessage])
    setInputValue("")
    setError(null)
    setIsConnected(false)
    currentAssistantMessageRef.current = null

    // Create new session and reconnect
    try {
      const response = await createChatSession(
        "You are a creative AI assistant helping content creators refine their ideas, vision, and unique content concepts. Provide helpful suggestions and engage thoughtfully with their creative process."
      )
      setSessionId(response.session_id)

      const ws = new ChatWebSocket({
        sessionId: response.session_id,
        onMessage: (content) => {
          setIsLoading(false)

          if (!currentAssistantMessageRef.current) {
            const newMessageId = `assistant-${Date.now()}`
            currentAssistantMessageRef.current = newMessageId
            setMessages((prev) => [
              ...prev,
              {
                id: newMessageId,
                role: "assistant",
                content: content,
                timestamp: "Just now",
              },
            ])
          } else {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === currentAssistantMessageRef.current
                  ? { ...msg, content: msg.content + content }
                  : msg
              )
            )
          }
        },
        onError: (errorMsg) => {
          setError(errorMsg)
          setIsLoading(false)
        },
        onOpen: () => {
          setIsConnected(true)
          setError(null)
        },
        onClose: () => {
          setIsConnected(false)
        },
      })

      ws.connect()
      wsRef.current = ws
    } catch (err) {
      console.error("Failed to create new session:", err)
      setError("Failed to start new chat. Please try again.")
    }
  }, [sessionId])

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <Card className={className}>
      <CardHeader className="py-2">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant={isConnected ? "default" : "secondary"}
            className="flex items-center gap-1"
          >
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3" />
                <span>Live</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span>Offline</span>
              </>
            )}
          </Badge>
          {error && (
            <p className="text-xs text-destructive truncate flex-1">{error}</p>
          )}
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={handleNewThread}
            disabled={isLoading}
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> New Thread
          </Button>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="space-y-6 p-6">
            {isInitializing && (
              <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading chat history...</span>
              </div>
            )}
            {messages.map((message) => {
              const isAssistant = message.role === "assistant"

              return (
                <div key={message.id} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback>
                        {isAssistant ? "AI" : "You"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-foreground">
                      {isAssistant ? "Solvi" : "You"}
                    </span>
                    <span>·</span>
                    <span>{message.timestamp}</span>
                  </div>
                  {isAssistant ? (
                    message.content ? (
                      <article
                        className="prose prose-sm text-foreground dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: renderedContent ?? "" }}
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    )
                  ) : (
                    <div className="rounded-xl border bg-muted/40 px-4 py-3 text-sm text-foreground">
                      {message.content}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <Textarea
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Share thoughts, reactions, or questions... I'm here to help shape ideas with you."
            placeholder="Share thoughts, reactions, or questions... I'm here to help shape ideas with you."
            className="min-h-[120px] resize-none"
            disabled={isLoading || !isConnected}
          />
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="icon" disabled={isLoading}>
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!inputValue.trim() || isLoading || !isConnected}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Send message
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  )
}
