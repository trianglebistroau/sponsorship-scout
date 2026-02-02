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
  selectedFileIds?: Set<string>
  onToggleFile?: (fileId: string) => void
  onPreviewFile?: (file: FileNode) => void
  onSelectVibe?: (file: FileNode) => void
  className?: string
  title?: React.ReactNode
  description?: React.ReactNode
  showHeader?: boolean
}

export function VibePicker({
  nodes,
  selectedFileIds,
  onToggleFile,
  onPreviewFile,
  onSelectVibe,
  className,
  title,
  description,
  showHeader = true,
}: VibePickerProps) {
  const selectionSet = selectedFileIds ?? new Set<string>()
  const mentionMode = typeof onSelectVibe === "function"
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

        if (mentionMode && onSelectVibe) {
          return (
            <div
              key={node.id}
              role="button"
              tabIndex={0}
              className="w-full text-left cursor-pointer"
              onClick={() => onSelectVibe?.(node)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectVibe?.(node);
                }
              }}
            >
              <FileListItem
                file={node}
                onPreview={onPreviewFile}
                className="cursor-pointer"
                prefix={
                  <span
                    className="inline-flex h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: node.accentColor ?? "#94a3b8" }}
                    aria-hidden
                  />
                }
              />
            </div>
          )
        }

        if (!onToggleFile) {
          return null
        }

        const isChecked = selectionSet.has(node.id)
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
    [getCheckboxId, mentionMode, onPreviewFile, onSelectVibe, onToggleFile, selectionSet]
  )

  const headerTitle = title ?? "Your Creative Blueprint"
  const headerDescription =
    description ?? (
      <>
        The worlds you show up in. <br />Filter your idea stream.
      </>
    )

  return (
    <Card className={cn("flex h-full flex-col lg:min-h-0", className)}>
      {showHeader ? (
        <CardHeader>
          <CardTitle>{headerTitle}</CardTitle>
          {headerDescription ? <CardDescription>{headerDescription}</CardDescription> : null}
        </CardHeader>
      ) : null}
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-2 pb-4">{renderNodes(nodes)}</div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
