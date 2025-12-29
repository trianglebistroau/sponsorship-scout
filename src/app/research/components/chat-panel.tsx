"use client"

import * as React from "react"
import { Paperclip, RefreshCcw, Send } from "lucide-react"

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

import { convertMarkdownToHtml } from "../../generate/utils"

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
      "### Let's craft your next move\n\nNow for the fun part — I'll help you shape ideas, explore brand partnerships, and refine what makes your content unmistakably *you*.\n\nThink out loud here. Ask for ideas, clarity, or creative direction.\n\n**Try asking:**\n- Give me ideas for a brand deal with [brand name]\n- Help me make my content stand out\n- What worked best in my niche this month?\n- Draft 5 hooks for my next vlog\n\nJust start typing — we'll figure it out together.",
    timestamp: "2m ago",
  },
  {
    id: "user-1",
    role: "user",
    content: "I want a running series that doesn't feel intimidating or try-hard.",
    timestamp: "Just now",
  },
  {
    id: "assistant-2",
    role: "assistant",
    content:
      "Yeah, totally get that.\n\nWhat if running is just the backdrop, not the main character?\n\nA few ideas that feel low-pressure:\n\n**1. 'Runs I Almost Skipped'**  \nHonest, very relatable. People connect with the struggle more than the pace.\n\n**2. 'One Run, One Thought'**  \nShort reflections while cooling down. Calm, repeatable, brand-safe.\n\n**3. 'Running Days That Felt Like Therapy'**  \nLeans into emotion, not performance.\n\nNone of these need to be perfect or intense. They work because they feel like real life.\n\nWant to shape one of these into a weekly format?",
    timestamp: "Just now",
  },
]

type ResearchChatPanelProps = {
  inputValue: string
  onInputChange: (value: string) => void
}

export function ResearchChatPanel({ inputValue, onInputChange }: ResearchChatPanelProps) {
  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onInputChange("")
  }, [onInputChange])

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>Our Brainstorming Space</CardTitle>
            <CardDescription>Think like a creative director — with backup.</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="shrink-0">
            <RefreshCcw className="mr-2 h-4 w-4" /> New Thread
          </Button>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="space-y-6 p-6">
            {mockMessages.map((message) => {
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
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="What's on your mind? Ask about brands, content ideas, or your next big move..."
            className="min-h-[120px] resize-none"
          />
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="icon">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button type="submit" className="flex-1" disabled={!inputValue.trim()}>
              Let's explore
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  )
}
