"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

import { FileNode } from "../types"
import { FileListItem } from "./file-list-item"

export type VibePickerProps = {
  nodes: FileNode[]
  selectedFileIds: Set<string>
  onToggleFile: (fileId: string) => void
  onPreviewFile: (file: FileNode) => void
  className?: string
}

export function VibePicker({
  nodes,
  selectedFileIds,
  onToggleFile,
  onPreviewFile,
  className,
}: VibePickerProps) {
  const getCheckboxId = React.useCallback((fileId: string) => {
    return `file-${fileId.replace(/[^a-zA-Z0-9_-]/g, "-")}`
  }, [])

  const renderNodes = React.useCallback(
    (treeNodes: FileNode[], depth = 0) => {
      return treeNodes.map((node) => {
        if (node.type === "folder") {
          return (
            <div
              key={node.id}
              className={cn(depth === 0 ? "mt-0" : "mt-2", "space-y-1")}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {node.name}
              </p>
              <div className="space-y-1">
                {node.children?.length ? renderNodes(node.children, depth + 1) : null}
              </div>
            </div>
          )
        }

        const isChecked = selectedFileIds.has(node.id)
        const checkboxId = getCheckboxId(node.id)

        return (
          <FileListItem
            key={node.id}
            file={node}
            onPreview={onPreviewFile}
            prefix={
              <Checkbox
                id={checkboxId}
                checked={isChecked}
                onCheckedChange={() => onToggleFile(node.id)}
                className="h-4 w-4 rounded-full"
                style={{
                  borderColor: node.accentColor,
                  backgroundColor: isChecked ? node.accentColor : undefined,
                }}
              />
            }
            titleSlot={
              <label
                htmlFor={checkboxId}
                className="cursor-pointer text-sm font-medium text-foreground"
              >
                {node.name}
              </label>
            }
            descriptionSlot={
              <label
                htmlFor={checkboxId}
                className="cursor-pointer text-xs text-muted-foreground"
              >
                {node.summary ?? "No summary documented."}
              </label>
            }
          />
        )
      })
    },
    [getCheckboxId, onPreviewFile, onToggleFile, selectedFileIds]
  )

  return (
    <Card className={cn("flex h-full flex-col lg:min-h-0", className)}>
      <CardHeader>
        <CardTitle>Vibe Picker</CardTitle>
        <CardDescription>
          Your styles, goals, and identities. <br/>
          All in one place.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-2 pb-4">{renderNodes(nodes)}</div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
