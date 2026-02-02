"use client"

import * as React from "react"
import { Maximize2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { FileNode } from "../types"

export type FileListItemProps = {
  file: FileNode
  summaryFallback?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  onPreview?: (file: FileNode) => void
  titleSlot?: React.ReactNode
  descriptionSlot?: React.ReactNode
  className?: string
}

export function FileListItem({
  file,
  summaryFallback = "No summary provided yet.",
  prefix,
  suffix,
  onPreview,
  titleSlot,
  descriptionSlot,
  className,
}: FileListItemProps) {
  const accentStyle = file.accentColor
    ? {
        borderLeftColor: file.accentColor,
        backgroundColor: `${file.accentColor}14`,
      }
    : undefined

  return (
    <div
      style={accentStyle}
      className={cn(
        "flex w-full items-start gap-3 rounded-md border border-l-4 px-3 py-2",
        "transition hover:bg-muted/60",
        className
      )}
    >
      {prefix ? <div className="pt-0.5">{prefix}</div> : null}
      <div className="flex flex-1 flex-col gap-1">
        {titleSlot ?? (
          <p className="text-sm font-medium text-foreground">{file.name}</p>
        )}
        {descriptionSlot ?? (
          <p className="text-xs text-muted-foreground">
            {file.summary ?? summaryFallback}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {file.accentColor ? (
          <span
            aria-hidden
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: file.accentColor }}
          />
        ) : null}
        {onPreview ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPreview(file)}
          >
            <Maximize2 className="h-4 w-4" />
            <span className="sr-only">Preview {file.name}</span>
          </Button>
        ) : null}
        {suffix}
      </div>
    </div>
  )
}
