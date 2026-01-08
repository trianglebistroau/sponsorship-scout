"use client"

import * as React from "react"
import { Paperclip, RefreshCcw, Send } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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

import { convertMarkdownToHtml } from "../utils"

type ChatMessage = {
  id: string
  role: "assistant" | "user"
  content: string
  timestamp: string
}

const mockMessages: ChatMessage[] = [
  {
    id: "assistant-1",
    role: "assistant",
    content:
      "### Your Creative Notes\n\nJot reactions, tweak ideas, ask questions — I'll use this to shape what comes next.\n\n**Try things like:**\n- 'This feels too polished'\n- 'Can we make this more chaotic?'\n- 'Should I wear gold or silver jewelry?'\n- 'I like the idea but not the hook'",
    timestamp: "2m ago",
  },
]

export type GenerateChatPanelProps = {
  className?: string
}

export function GenerateChatPanel({ className }: GenerateChatPanelProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(mockMessages)
  const [inputValue, setInputValue] = React.useState("")
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!inputValue.trim()) return

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: inputValue,
        timestamp: "Just now",
      }

      setMessages((prev) => [...prev, userMessage])
      setInputValue("")

      // Simulate AI response
      setTimeout(() => {
        const aiMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content:
            "Got it! I'll tune the next ideas to match that vibe. Keep the feedback coming — it helps me learn what feels right for you.",
          timestamp: "Just now",
        }
        setMessages((prev) => [...prev, aiMessage])
      }, 1000)
    },
    [inputValue]
  )

  const handleNewThread = React.useCallback(() => {
    setMessages(mockMessages)
    setInputValue("")
  }, [])

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <Card className={className}>
      <CardHeader className="py-2">
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={handleNewThread}
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> New Thread
          </Button>
        </div>
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
                    <article
                      className="prose prose-sm text-foreground dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: renderedContent ?? "" }}
                    />
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
            className="min-h-[120px] resize-none"
          />
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="icon">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button type="submit" className="flex-1" disabled={!inputValue.trim()}>
              Share thought
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  )
}
