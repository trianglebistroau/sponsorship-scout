"use client"

import { AnimatePresence, motion } from "framer-motion"
import { PenSquare, Star, X } from "lucide-react"
import * as React from "react"

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
  activeFilters?: FileNode[]
  onRemoveFilter?: (fileId: string) => void
}

const tagCategoryLabels: Record<TagCategory, string> = {
  ideas: "Content Lane",
  themes: "Format",
  strategies: "Recurring Series",
}

// Animation variants for snappy feel
const itemVariants = {
  hidden: {
    y: 100,
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 25,
      mass: 0.8,
    },
  },
  exit: {
    y: -100,
    opacity: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
}

const starVariants = {
  inactive: { scale: 1, rotate: 0 },
  active: {
    scale: [1, 1.3, 1],
    rotate: [0, 15, -15, 0],
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    },
  },
}

const sentinelVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

// Helper to parse markdown sections
const parseConceptBody = (body: string) => {
  const sections: Record<string, string> = {}
  const lines = body.split('\n')
  let currentSection = ''
  let currentContent: string[] = []

  lines.forEach((line) => {
    if (line.startsWith('### ')) {
      if (currentSection && currentContent.length) {
        sections[currentSection] = currentContent.join('\n').trim()
      }
      currentSection = line.replace('### ', '').trim()
      currentContent = []
    } else if (currentSection) {
      currentContent.push(line)
    }
  })

  if (currentSection && currentContent.length) {
    sections[currentSection] = currentContent.join('\n').trim()
  }

  return sections
}

export function ConceptFeed({
  items,
  onLoadMore,
  starredItemIds,
  onToggleStar,
  onUpdateItem,
  fileLookup,
  className,
  activeFilters = [],
  onRemoveFilter,
}: ConceptFeedProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null)
  const sentinelRef = React.useRef<HTMLDivElement | null>(null)
  const loadingRef = React.useRef(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [draftTitle, setDraftTitle] = React.useState("")
  const [draftBody, setDraftBody] = React.useState("")

  React.useEffect(() => {
    const container = scrollContainerRef.current
    const sentinel = sentinelRef.current

    if (!container || !sentinel) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting)
        if (!isVisible || loadingRef.current) {
          return
        }

        loadingRef.current = true
        onLoadMore()
      },
      { root: container, threshold: 0.5 }
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
    setExpandedId(null) // Close expanded view when editing
    setDraftTitle(item.title)
    setDraftBody(item.body)
  }, [])

  const toggleExpanded = React.useCallback((itemId: string) => {
    setExpandedId((prev) => prev === itemId ? null : itemId)
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
        <CardTitle>Your Idea Stream</CardTitle>
        <CardDescription>Fresh ideas made for you, tuned to your creative blueprint.</CardDescription>
        {activeFilters.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeFilters.map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => onRemoveFilter?.(file.id)}
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition hover:bg-muted"
                style={{
                  borderColor: file.accentColor ?? undefined,
                  color: file.accentColor ?? undefined,
                }}
              >
                <span>@{file.name}</span>
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <div
          ref={scrollContainerRef}
          className="h-full overflow-y-auto snap-y snap-mandatory scroll-smooth scrollbar-hide"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((item) => {
              const isStarred = starredItemIds.has(item.id)
              const isEditing = editingId === item.id
              const isExpanded = expandedId === item.id
              const tagEntries = Object.entries(item.tags) as [TagCategory, string[]][]
              const resolvedTags = tagEntries.flatMap(([category, ids]) =>
                ids.map((tagId) => ({ category, node: fileLookup[tagId] }))
              )
              
              const sections = parseConceptBody(item.body)

              return (
                <motion.div
                  key={item.id}
                  className="h-full snap-start snap-always flex items-stretch"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  layoutId={`concept-${item.id}`}
                  style={{ willChange: "transform, opacity" }}
                >
                <motion.div layout layoutId={`card-${item.id}`} className="w-full h-full flex">
                  <Card
                    className={cn(
                      "w-full h-full flex flex-col bg-card/80"
                    )}
                  >
                  <CardHeader className="space-y-3 flex-shrink-0">
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
                          <motion.div
                            variants={starVariants}
                            initial="inactive"
                            animate={isStarred ? "active" : "inactive"}
                          >
                            <Star
                              className={cn(
                                "h-4 w-4",
                                isStarred ? "fill-yellow-400 text-yellow-400" : ""
                              )}
                              fill={isStarred ? "currentColor" : "none"}
                            />
                          </motion.div>
                          <span className="sr-only">
                            {isStarred ? "Unsave" : "Save"} concept {item.title}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className={cn("flex-1 space-y-4", isEditing && "overflow-hidden")}>
                    <AnimatePresence mode="wait">
                      {!isEditing && resolvedTags.length ? (
                      <div className="flex flex-wrap gap-2">
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
                        <motion.div
                          key="edit"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex flex-col gap-4 h-full"
                        >
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
                        <div className="flex-1 min-h-0 flex flex-col gap-1">
                          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Body (Markdown)
                          </label>
                          <Textarea
                            value={draftBody}
                            onChange={(event) => setDraftBody(event.target.value)}
                            className="flex-1 resize-none"
                            placeholder="Use markdown for structure."
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" variant="ghost" onClick={handleCancel}>
                            Cancel
                          </Button>
                          <Button type="button" onClick={handleSave}>
                            Save
                          </Button>
                        </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="view"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4"
                        >
                          {/* Theme */}
                          <div>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {sections.Theme || item.excerpt}
                            </p>
                          </div>

                          {/* Why this hits */}
                          {sections['Why this hits'] && (
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                                Why this hits
                              </h4>
                              <div className="space-y-1">
                                {sections['Why this hits'].split('\n').filter(line => line.trim().startsWith('-')).slice(0, 3).map((line, i) => (
                                  <p key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
                                    <span>{line.replace(/^-\s*/, '')}</span>
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Hook Options - show 2-3 */}
                          {sections['Hook Options'] && (
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                                Hook Options
                              </h4>
                              <div className="space-y-1.5">
                                {sections['Hook Options'].split('\n').filter(line => line.trim()).slice(0, 3).map((hook, i) => (
                                  <p key={i} className="text-sm font-medium text-foreground/90 italic">
                                    {hook.replace(/^\d+\.\s*/, '')}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Storyboard Summary - first 3-4 beats */}
                          {sections['Storyboard'] && (
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                                Storyboard
                              </h4>
                              <div className="space-y-1">
                                {sections['Storyboard'].split('\n').filter(line => line.trim()).slice(0, isExpanded ? undefined : 4).map((beat, i) => (
                                  <p key={i} className="text-sm text-muted-foreground">
                                    {beat.replace(/^\d+\.\s*/, '').trim()}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Expanded content */}
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-4 border-t pt-4"
                            >
                              {/* Full Storyboard already shown above */}
                              
                              {/* CTA Ideas */}
                              {sections['CTA Ideas'] && (
                                <div className="space-y-2">
                                  <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                                    CTA Ideas
                                  </h4>
                                  <div className="space-y-1">
                                    {sections['CTA Ideas'].split('\n').filter(line => line.trim().startsWith('-')).map((cta, i) => (
                                      <p key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
                                        <span>{cta.replace(/^-\s*/, '').replace(/"/g, '')}</span>
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Suggested Brand Fit */}
                              {sections['Suggested Brand Fit'] && (
                                <div className="space-y-2">
                                  <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                                    Suggested Brand Fit
                                  </h4>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {sections['Suggested Brand Fit']}
                                  </p>
                                </div>
                              )}
                            </motion.div>
                          )}

                          {/* See More / See Less toggle */}
                          {(sections['CTA Ideas'] || sections['Suggested Brand Fit']) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(item.id)}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              {isExpanded ? 'See less' : 'See full details'}
                            </Button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )
          })}
          </AnimatePresence>

          <motion.div
            ref={sentinelRef}
            className="h-full snap-start flex items-center justify-center"
            // variants={sentinelVariants}
            initial="hidden"
            animate="visible"
          >
            <p className="text-xs text-muted-foreground">
              Keep scrolling for more ideas tailored to you…
            </p>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}
