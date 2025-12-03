"use client"

import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

import { FileNode } from "../types"
import { FileListItem } from "./file-list-item"

export type ContextPanelProps = {
  files: FileNode[]
  onRemoveFile: (fileId: string) => void
  onPreviewFile: (file: FileNode) => void
  className?: string
}

export function ContextPanel({
  files,
  onRemoveFile,
  onPreviewFile,
  className,
}: ContextPanelProps) {
  const hasFiles = files.length > 0

  return (
    <Card className={cn("flex flex-1 flex-col lg:min-h-0", className)}>
      <CardHeader>
        <CardTitle>Context</CardTitle>
        <CardDescription>
          Extra information that makes concepts tailored to your brand.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {hasFiles ? (
          <ScrollArea className="h-full">
            <div className="space-y-3 pb-4">
              {files.map((file) => (
                <FileListItem
                  key={file.id}
                  file={file}
                  onPreview={onPreviewFile}
                  suffix={
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={() => onRemoveFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove {file.name}</span>
                    </Button>
                  }
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Select vibes on the left to connect your context here.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
