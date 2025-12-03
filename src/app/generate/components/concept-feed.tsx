"use client"

import * as React from "react"
import { PenSquare, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import { FeedItem, FileNode, TagCategory } from "../types"

export type ConceptFeedProps = {
  items: FeedItem[]
  onLoadMore: () => void
  starredItemIds: Set<string>
  onToggleStar: (itemId: string) => void
  onUpdateItem: (itemId: string, updates: Pick<FeedItem, "title" | "body">) => void
  fileLookup: Record<string, FileNode>
  className?: string
}

const tagCategoryLabels: Record<TagCategory, string> = {
  ideas: "Idea",
  themes: "Theme",
  strategies: "Strategy",
}

export function ConceptFeed({
  items,
  onLoadMore,
  starredItemIds,
  onToggleStar,
  onUpdateItem,
  fileLookup,
  className,
}: ConceptFeedProps) {
  const scrollAreaRef = React.useRef<HTMLDivElement | null>(null)
  const sentinelRef = React.useRef<HTMLDivElement | null>(null)
  const loadingRef = React.useRef(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [draftTitle, setDraftTitle] = React.useState("")
  const [draftBody, setDraftBody] = React.useState("")

  React.useEffect(() => {
    const root = scrollAreaRef.current
    const sentinel = sentinelRef.current

    if (!root || !sentinel) {
      return
    }

    const viewport =
      (root.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLDivElement | null) ?? root

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting)
        if (!isVisible || loadingRef.current) {
          return
        }

        loadingRef.current = true
        onLoadMore()
      },
      { root: viewport ?? null, threshold: 1 }
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [onLoadMore])

  React.useEffect(() => {
    loadingRef.current = false
  }, [items.length])

  const startEditing = React.useCallback((item: FeedItem) => {
    setEditingId(item.id)
    setDraftTitle(item.title)
    setDraftBody(item.body)
  }, [])

  const handleCancel = React.useCallback(() => {
    setEditingId(null)
    setDraftTitle("")
    setDraftBody("")
  }, [])

  const handleSave = React.useCallback(() => {
    if (!editingId) return
    onUpdateItem(editingId, { title: draftTitle, body: draftBody })
    handleCancel()
  }, [draftBody, draftTitle, editingId, handleCancel, onUpdateItem])

  return (
    <Card className={cn("flex h-full flex-col lg:min-h-0", className)}>
      <CardHeader>
        <CardTitle>Concept Feed</CardTitle>
        <CardDescription>Find your next viral idea.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="space-y-6 pb-10">
            {items.map((item) => {
              const isStarred = starredItemIds.has(item.id)
              const isEditing = editingId === item.id
              const tagEntries = Object.entries(item.tags) as [TagCategory, string[]][]
              const resolvedTags = tagEntries.flatMap(([category, ids]) =>
                ids.map((tagId) => ({ category, node: fileLookup[tagId] }))
              )
              return (
                <Card
                  key={item.id}
                  className={cn(
                    "flex flex-col bg-card/80",
                    isEditing ? "h-[460px]" : "min-h-[200px]"
                  )}
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                        <CardDescription>{item.duration}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isEditing && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground"
                            onClick={() => startEditing(item)}
                          >
                            <PenSquare className="h-4 w-4" />
                            <span className="sr-only">Edit {item.title}</span>
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-9 w-9",
                            isStarred ? "text-yellow-400" : "text-muted-foreground"
                          )}
                          onClick={() => onToggleStar(item.id)}
                        >
                          <Star
                            className={cn(
                              "h-4 w-4",
                              isStarred ? "fill-yellow-400 text-yellow-400" : ""
                            )}
                            fill={isStarred ? "currentColor" : "none"}
                          />
                          <span className="sr-only">
                            {isStarred ? "Unsave" : "Save"} concept {item.title}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className={cn(isEditing && "flex-1 overflow-hidden")}> 
                    {!isEditing && resolvedTags.length ? (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {resolvedTags.map(({ category, node }) => {
                          if (!node) return null
                          const accentStyle = node.accentColor
                            ? {
                                borderColor: `${node.accentColor}40`,
                                color: node.accentColor,
                              }
                            : undefined
                          return (
                            <Badge
                              key={`${item.id}-${category}-${node.id}`}
                              variant="outline"
                              className="text-[11px] font-medium"
                              style={accentStyle}
                            >
                              {tagCategoryLabels[category]}: {node.name}
                            </Badge>
                          )
                        })}
                      </div>
                    ) : null}
                    {isEditing ? (
                      <div className="h-full overflow-auto pr-1">
                        <div className="flex h-full flex-col gap-4">
                          <div>
                            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Title (Markdown ready)
                            </label>
                            <Input
                              value={draftTitle}
                              onChange={(event) => setDraftTitle(event.target.value)}
                              placeholder="Add your hook title"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Body (Markdown)
                            </label>
                            <Textarea
                              value={draftBody}
                              onChange={(event) => setDraftBody(event.target.value)}
                              className="min-h-[120px] resize-none"
                              placeholder="Use markdown for structure."
                            />
                          </div>
                          <div className="mt-auto flex flex-wrap gap-2">
                            <Button type="button" variant="ghost" onClick={handleCancel}>
                              Cancel
                            </Button>
                            <Button type="button" onClick={handleSave}>
                              Save
                            </Button>
                            <Button type="button" variant="secondary">
                              Revise with AI
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {item.excerpt}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
            <div
              ref={sentinelRef}
              className="py-4 text-center text-xs text-muted-foreground"
            >
              Keep scrolling for more virtual reels…
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
