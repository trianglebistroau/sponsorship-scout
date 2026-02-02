"use client"

import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import * as React from "react"

import { VibePicker } from "@/app/(protected)/generate/components/vibe-picker"
import { FileNode } from "@/app/(protected)/generate/types"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"

type VibeGalleryProps = {
  sections: FileNode[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsertVibe: (file: FileNode) => void
}

export function VibeGallery({ sections, open, onOpenChange, onInsertVibe }: VibeGalleryProps) {
  const [query, setQuery] = React.useState("")

  const filteredSections = React.useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return sections
    }

    const filterTree = (nodes: FileNode[]): FileNode[] => {
      return nodes
        .map((node) => {
          if (node.type === "folder") {
            const children = node.children ? filterTree(node.children) : []
            if (node.name.toLowerCase().includes(normalized)) {
              return {
                ...node,
                children: children.length ? children : node.children,
              }
            }
            if (children.length) {
              return {
                ...node,
                children,
              }
            }
            return null
          }

          if (
            node.name.toLowerCase().includes(normalized) ||
            (node.summary?.toLowerCase().includes(normalized) ?? false)
          ) {
            return node
          }

          return null
        })
        .filter((node): node is FileNode => Boolean(node))
    }

    return filterTree(sections)
  }, [query, sections])

  const handlePreviewFile = React.useCallback((_: FileNode) => {
    return
  }, [])

  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className="flex h-full w-full flex-col overflow-hidden"
    >
      <Card className="flex h-full flex-col border-dashed">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>Your Creative Blueprint</CardTitle>
              <CardDescription>The worlds you show up in</CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <span className="sr-only">
                  {open ? "Collapse vibe reference" : "Expand vibe reference"}
                </span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search vibes"
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CollapsibleContent className="flex-1 overflow-hidden">
          {filteredSections.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No vibes match “{query}”.
            </div>
          ) : (
            <VibePicker
              nodes={filteredSections}
              onPreviewFile={handlePreviewFile}
              onSelectVibe={onInsertVibe}
              showHeader={false}
              className="border-none bg-transparent shadow-none"
            />
          )}
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
