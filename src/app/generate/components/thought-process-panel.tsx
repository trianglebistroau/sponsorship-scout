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
        <CardTitle>Your Creative Notes</CardTitle>
        <CardDescription>
          Think out loud, I'm listening.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-full min-h-[180px] resize-none"
          placeholder="Jot reactions, tweak ideas, ask questions — I'll use this to shape what comes next.\n\ne.g. 'This feels too polished' or 'Should I wear gold or silver jewelry?'"
        />
      </CardContent>
    </Card>
  )
}
