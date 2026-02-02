"use client"

import { Loader2, Paperclip, RefreshCcw, Send } from "lucide-react"
import * as React from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

import {
    createChatSession,
    deleteChatSession,
    streamMessage,
} from "@/lib/chat-api"
import { convertMarkdownToHtml } from "../../generate/utils"

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
    "### Let's craft your next move\n\nNow for the fun part — I'll help you shape ideas, explore brand partnerships, and refine what makes your content unmistakably *you*.\n\nThink out loud here. Ask for ideas, clarity, or creative direction.\n\n**Try asking:**\n- Give me ideas for a brand deal with [brand name]\n- Help me make my content stand out\n- What worked best in my niche this month?\n- Draft 5 hooks for my next vlog\n\nJust start typing — we'll figure it out together.",
  timestamp: "Just now",
}

type ResearchChatPanelProps = {
  inputValue: string
  onInputChange: (value: string) => void
}

export function ResearchChatPanel({ inputValue, onInputChange }: ResearchChatPanelProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([initialMessage])
  const [isLoading, setIsLoading] = React.useState(false)
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Initialize session on mount
  React.useEffect(() => {
    const initSession = async () => {
      try {
        const response = await createChatSession(
          "You are a creative brainstorming AI assistant helping content creators shape ideas, explore brand partnerships, and refine their unique content style. Be conversational, supportive, and provide actionable suggestions."
        )
        setSessionId(response.session_id)
        setError(null)
      } catch (err) {
        console.error("Failed to create session:", err)
        setError("Failed to connect to chat service. Please try again.")
      }
    }
    initSession()

    // Cleanup on unmount
    return () => {
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

      if (!sessionId) {
        setError("No active session. Please refresh to start a new chat.")
        return
      }

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: inputValue,
        timestamp: "Just now",
      }

      setMessages((prev) => [...prev, userMessage])
      onInputChange("")
      setIsLoading(true)
      setError(null)

      // Create placeholder for assistant response
      const assistantMessageId = `assistant-${Date.now()}`
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          timestamp: "Just now",
        },
      ])

      try {
        let fullContent = ""
        for await (const chunk of streamMessage(sessionId, inputValue)) {
          fullContent += chunk
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: fullContent }
                : msg
            )
          )
        }
      } catch (err) {
        console.error("Failed to stream message:", err)
        setError("Failed to get response. Please try again.")
        // Remove the empty assistant message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId))
      } finally {
        setIsLoading(false)
      }
    },
    [inputValue, isLoading, sessionId, onInputChange]
  )

  const handleNewThread = React.useCallback(async () => {
    // Delete old session if exists
    if (sessionId) {
      try {
        await deleteChatSession(sessionId)
      } catch (err) {
        console.error("Failed to delete old session:", err)
      }
    }

    setMessages([initialMessage])
    onInputChange("")
    setError(null)

    // Create new session
    try {
      const response = await createChatSession(
        "You are a creative brainstorming AI assistant helping content creators shape ideas, explore brand partnerships, and refine their unique content style. Be conversational, supportive, and provide actionable suggestions."
      )
      setSessionId(response.session_id)
    } catch (err) {
      console.error("Failed to create new session:", err)
      setError("Failed to start new chat. Please try again.")
    }
  }, [sessionId, onInputChange])

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>Our Brainstorming Space</CardTitle>
            <CardDescription>Think like a creative director — with backup.</CardDescription>
          </div>
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
        {error && (
          <p className="text-xs text-destructive mt-2">{error}</p>
        )}
      </CardHeader>
      <Separator />
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="space-y-6 p-6">
            {messages.map((message) => {
              const isAssistant = message.role === "assistant"
              const renderedContent = isAssistant
                ? convertMarkdownToHtml(message.content)
                : null

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
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="What's on your mind? Ask about brands, content ideas, or your next big move..."
            className="min-h-[120px] resize-none"
            disabled={isLoading}
          />
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="icon" disabled={isLoading}>
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!inputValue.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  Let's explore
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
