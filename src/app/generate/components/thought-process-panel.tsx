"use client"

import * as React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export type ThoughtProcessPanelProps = {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function ThoughtProcessPanel({ value, onChange, className }: ThoughtProcessPanelProps) {
  return (
    <Card className={cn("flex flex-1 flex-col lg:min-h-0", className)}>
      <CardHeader>
        <CardTitle>Thought Process</CardTitle>
        <CardDescription>
          Put down your ideas, vision, questions, and what makes you YOU to the concepts.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-full min-h-[180px] resize-none"
          placeholder="e.g. Should I wear jewelry? Let's put the reference to the colour pallette of this collection here..."
        />
      </CardContent>
    </Card>
  )
}
