"use client"

import * as React from "react"

import { ConceptFeed } from "./components/concept-feed"
import { ContextPanel } from "./components/context-panel"
import { ThoughtProcessPanel } from "./components/thought-process-panel"
import { VibePicker } from "./components/vibe-picker"
import { PreviewDialog } from "./components/preview-dialog"
import { GeneratorNav } from "./components/top-nav"
import { fileTreeData } from "./data/file-tree"
import { applyFileOverrides, buildFileMap } from "./utils"
import { FeedItem, FileNode, FileNodeUpdate, TagCategory } from "./types"

const basePlaceholder =
  "High-energy storyline about the creator's latest post paired with brand-safe takeaways."

const TAG_CATEGORIES: TagCategory[] = ["ideas", "themes", "strategies"]

const buildCategoryFileIds = (): Record<TagCategory, string[]> => {
  return TAG_CATEGORIES.reduce((acc, category) => {
    const categoryNode = fileTreeData.find((node) => node.id === category)
    acc[category] = categoryNode?.children?.map((child) => child.id) ?? []
    return acc
  }, {} as Record<TagCategory, string[]>)
}

const categoryFileIds = buildCategoryFileIds()

const createEmptyTags = () => ({
  ideas: [] as string[],
  themes: [] as string[],
  strategies: [] as string[],
})

const generateFeedItems = (
  startIndex: number,
  batchSize: number,
  categoryMap: Record<TagCategory, string[]>
): FeedItem[] => {
  return Array.from({ length: batchSize }).map((_, offset) => {
    const order = startIndex + offset + 1
    const tags = TAG_CATEGORIES.reduce((acc, category, categoryIndex) => {
      const ids = categoryMap[category]
      if (!ids.length) {
        acc[category] = []
        return acc
      }

      const selections = new Set<string>()
      const selectionCount = ids.length > 1 && (order + categoryIndex) % 4 === 0 ? 2 : 1

      for (let pick = 0; pick < selectionCount; pick += 1) {
        const listIndex = (order + categoryIndex + pick) % ids.length
        selections.add(ids[listIndex])
      }

      acc[category] = Array.from(selections)
      return acc
    }, createEmptyTags())

    return {
      id: `feed-${order}`,
      title: `Creator spotlight #${order}`,
      excerpt: `${basePlaceholder} Clip ${order} keeps looping with a concise CTA placeholder.`,
      duration: "2 min watch",
      body: `## Hook for clip ${order}\n\n${basePlaceholder}\n\n- Bullet one\n- Bullet two\n\n**CTA**: Drop your CTA copy here.`,
      tags,
    }
  })
}

export default function GeneratorPage() {
  const [thoughtProcess, setThoughtProcess] = React.useState("")
  const [selectedFileIds, setSelectedFileIds] = React.useState<Set<string>>(
    () => new Set()
  )
  const [fileOverrides, setFileOverrides] = React.useState<Record<string, FileNodeUpdate>>({})
  const resolvedFileTree = React.useMemo(
    () => applyFileOverrides(fileTreeData, fileOverrides),
    [fileOverrides]
  )
  const [feedItems, setFeedItems] = React.useState<FeedItem[]>(() =>
    generateFeedItems(0, 6, categoryFileIds)
  )
  const [starredItemIds, setStarredItemIds] = React.useState<Set<string>>(
    () => new Set()
  )
  const [previewFileId, setPreviewFileId] = React.useState<string | null>(null)

  const fileMap = React.useMemo(() => buildFileMap(resolvedFileTree), [resolvedFileTree])

  const selectedFiles = React.useMemo(() => {
    return Array.from(selectedFileIds)
      .map((fileId) => fileMap[fileId])
      .filter(Boolean) as FileNode[]
  }, [fileMap, selectedFileIds])

  const handleToggleFile = React.useCallback((fileId: string) => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev)
      if (next.has(fileId)) {
        next.delete(fileId)
      } else {
        next.add(fileId)
      }
      return next
    })
  }, [])

  const handleRemoveFile = React.useCallback((fileId: string) => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev)
      next.delete(fileId)
      return next
    })
  }, [])

  const handleLoadMore = React.useCallback(() => {
    setFeedItems((prev) => [...prev, ...generateFeedItems(prev.length, 4, categoryFileIds)])
  }, [])

  const handleToggleStar = React.useCallback((itemId: string) => {
    setStarredItemIds((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }, [])

  const handlePreviewFile = React.useCallback((file: FileNode) => {
    setPreviewFileId(file.id)
  }, [])

  const handleUpdateFeedItem = React.useCallback(
    (itemId: string, updates: Pick<FeedItem, "title" | "body">) => {
      setFeedItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
      )
    },
    []
  )

  const handleUpdateFileMeta = React.useCallback(
    (fileId: string, updates: FileNodeUpdate) => {
      setFileOverrides((prev) => ({
        ...prev,
        [fileId]: {
          ...(prev[fileId] ?? {}),
          ...updates,
        },
      }))
    },
    []
  )

  const previewFile = previewFileId ? fileMap[previewFileId] ?? null : null

  return (
    <main className="h-screen bg-background overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1600px] flex-col gap-6 px-4 py-6 lg:px-8">
        <GeneratorNav />
        <div className="flex flex-1 flex-col gap-6 overflow-hidden lg:flex-row">
          <VibePicker
            nodes={resolvedFileTree}
            selectedFileIds={selectedFileIds}
            onToggleFile={handleToggleFile}
            onPreviewFile={handlePreviewFile}
            className="lg:basis-[20%]"
          />

          <ConceptFeed
            items={feedItems}
            onLoadMore={handleLoadMore}
            starredItemIds={starredItemIds}
            onToggleStar={handleToggleStar}
            onUpdateItem={handleUpdateFeedItem}
            fileLookup={fileMap}
            className="lg:basis-[50%]"
          />

          <div className="flex h-full flex-col gap-4 lg:basis-[30%] lg:overflow-hidden">
            <ThoughtProcessPanel value={thoughtProcess} onChange={setThoughtProcess} />
            <ContextPanel
              files={selectedFiles}
              onRemoveFile={handleRemoveFile}
              onPreviewFile={handlePreviewFile}
            />
          </div>
        </div>
      </div>

      <PreviewDialog
        file={previewFile}
        open={Boolean(previewFile)}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewFileId(null)
          }
        }}
        onUpdateFile={handleUpdateFileMeta}
      />
    </main>
  )
}
