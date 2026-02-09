"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"

import { convertMarkdownToHtml } from "../utils"
import { FileNode, FileNodeUpdate } from "../types"

type PreviewDialogProps = {
  file?: FileNode | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateFile: (fileId: string, updates: FileNodeUpdate) => void
}

export function PreviewDialog({ file, open, onOpenChange, onUpdateFile }: PreviewDialogProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [draftTitle, setDraftTitle] = React.useState("")
  const [draftSummary, setDraftSummary] = React.useState("")
  const [draftBody, setDraftBody] = React.useState("")

  const resetDrafts = React.useCallback(() => {
    if (!file) {
      setDraftTitle("")
      setDraftSummary("")
      setDraftBody("")
      return
    }
    setDraftTitle(file.name)
    setDraftSummary(file.summary ?? "")
    setDraftBody(file.content ?? "")
  }, [file])

  React.useEffect(() => {
    if (!file) {
      setIsEditing(false)
      resetDrafts()
      return
    }
    resetDrafts()
    setIsEditing(false)
  }, [file, resetDrafts])

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setIsEditing(false)
      resetDrafts()
    }
    onOpenChange(nextOpen)
  }

  const handleSave = () => {
    if (!file) return
    onUpdateFile(file.id, {
      name: draftTitle,
      summary: draftSummary,
      content: draftBody,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    resetDrafts()
    setIsEditing(false)
  }

  const renderedMarkdown = React.useMemo(() => {
    if (!file?.content) {
      return ""
    }
    return convertMarkdownToHtml(file.content)
  }, [file?.content])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pr-10">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <DialogTitle>{file?.name ?? "Preview"}</DialogTitle>
              {!isEditing ? (
                <DialogDescription>
                  {file?.summary ?? "Preview content coming soon."}
                </DialogDescription>
              ) : null}
            </div>
            <div className="flex shrink-0 gap-2">
              {isEditing ? (
                <>
                  <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="button" size="sm" onClick={handleSave} disabled={!draftTitle.trim()}>
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  disabled={!file}
                >
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Title
              </label>
              <Input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Summary
              </label>
              <Textarea
                value={draftSummary}
                onChange={(event) => setDraftSummary(event.target.value)}
                className="min-h-[120px]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Body
              </label>
              <Textarea
                value={draftBody}
                onChange={(event) => setDraftBody(event.target.value)}
                className="min-h-[180px]"
              />
            </div>
          </div>
        ) : (
          <ScrollArea className="max-h-[50vh] rounded-md border">
            {file?.content ? (
              <article
                className="prose prose-sm p-4 dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
              />
            ) : (
              <div className="p-4 text-sm text-muted-foreground">
                Preview content coming soon.
              </div>
            )}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
