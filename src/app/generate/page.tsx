"use client"

import * as React from "react"

import { ConceptFeed } from "./components/concept-feed"
import { GenerateChatPanel } from "./components/generate-chat-panel"
import { VibePicker } from "./components/vibe-picker"
import { PreviewDialog } from "./components/preview-dialog"
import { GeneratorNav } from "@/components/navigation"
import { fileTreeData } from "./data/file-tree"
import { applyFileOverrides, buildFileMap } from "./utils"
import { FeedItem, FileNode, FileNodeUpdate, TagCategory } from "./types"

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

const conceptTemplates = [
  {
    title: "Busy Girl Beach Reset",
    duration: "2 min watch • Easy",
    theme: "Soft reset energy with end-of-day reflection",
    whyThisHits: [
      "Reset-style content is trending",
      "Aesthetic B-roll = high save potential",
      "Relatable burnout → calm payoff"
    ],
    hooks: [
      "POV: you finally logged off",
      "This reset fixed my mood",
      "Come reset with me"
    ],
    storyboard: [
      "Arrival at beach",
      "Quiet walk B-roll",
      "One reflective line to camera",
      "Sunset close"
    ],
    cta: [
      "Save for later",
      "Which reset should I do next?",
      "Comment 'reset'"
    ],
    brandFit: "Would naturally align with Lululemon (wellness, calm routines) and Nike (movement as self-care)"
  },
  {
    title: "10-Minute Meals That Saved Me",
    duration: "90 sec watch • Easy",
    theme: "Quick, practical food content for busy days",
    whyThisHits: [
      "Short-form cooking is highly shareable",
      "Solves a real problem (fast meals)",
      "No fancy ingredients = more relatable"
    ],
    hooks: [
      "When you're too tired to cook but need to eat",
      "This took 10 minutes, no joke",
      "Lazy girl dinner that actually slaps"
    ],
    storyboard: [
      "Ingredients laid out",
      "Fast cuts of cooking process",
      "Final plate reveal",
      "Quick taste reaction"
    ],
    cta: [
      "What should I make next?",
      "Drop your go-to quick meal",
      "Save this for busy nights"
    ],
    brandFit: null
  },
  {
    title: "Morning Run I Almost Skipped",
    duration: "2 min watch • Medium",
    theme: "Honest, relatable fitness content without pressure",
    whyThisHits: [
      "Struggle-to-success arc is engaging",
      "Authenticity > performance metrics",
      "Viewers connect with the 'almost didn't' feeling"
    ],
    hooks: [
      "I really didn't want to run today",
      "POV: convincing yourself to just start",
      "The run I almost skipped changed my whole day"
    ],
    storyboard: [
      "Morning struggle (still in bed)",
      "Lacing up shoes reluctantly",
      "First steps outside",
      "Mid-run reflection to camera",
      "Post-run relief shot"
    ],
    cta: [
      "Comment if you've been there",
      "Which run almost didn't happen for you?",
      "Save for motivation"
    ],
    brandFit: "Would naturally align with Nike (everyday movement, authentic athlete energy) and Apple (morning routine content)"
  },
  {
    title: "Café Study Session Essentials",
    duration: "90 sec watch • Easy",
    theme: "Aesthetic productivity with a cozy vibe",
    whyThisHits: [
      "Study/work content is evergreen",
      "Café aesthetic = high engagement",
      "Viewers love 'what's in my bag' style content"
    ],
    hooks: [
      "What I bring to every café study session",
      "Setting up my mobile office",
      "This setup keeps me locked in for hours"
    ],
    storyboard: [
      "Walking into café",
      "Setting up laptop and essentials",
      "B-roll of study environment",
      "Quick productivity tip to camera"
    ],
    cta: [
      "What's your study essential?",
      "Favorite café study spot?",
      "Save for your next session"
    ],
    brandFit: "Would naturally align with Apple (productivity, clean visuals) and Lululemon (intentional routine content)"
  }
]

const generateFeedItems = (
  startIndex: number,
  batchSize: number,
  categoryMap: Record<TagCategory, string[]>
): FeedItem[] => {
  return Array.from({ length: batchSize }).map((_, offset) => {
    const order = startIndex + offset + 1
    const templateIndex = (order - 1) % conceptTemplates.length
    const template = conceptTemplates[templateIndex]
    
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

    const whyThisHitsText = template.whyThisHits.map(item => `- ${item}`).join('\n')
    const hooksText = template.hooks.map((hook, i) => `${i + 1}. "${hook}"`).join('\n')
    const storyboardText = template.storyboard.map((beat, i) => `${i + 1}. ${beat}`).join('\n')
    const ctaText = template.cta.map(cta => `- "${cta}"`).join('\n')
    const brandFitSection = template.brandFit ? `\n\n### Suggested Brand Fit\n${template.brandFit}` : ''

    return {
      id: `feed-${order}`,
      title: template.title,
      excerpt: template.theme,
      duration: template.duration,
      body: `### Theme\n${template.theme}\n\n### Why this hits\n${whyThisHitsText}\n\n### Hook Options\n${hooksText}\n\n### Storyboard\n${storyboardText}\n\n### CTA Ideas\n${ctaText}${brandFitSection}`,
      tags,
    }
  })
}

export default function GeneratorPage() {
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
            activeFilters={selectedFiles}
            onRemoveFilter={handleRemoveFile}
            className="lg:basis-[50%]"
          />
          
          <div className="flex h-full flex-col lg:basis-[30%] lg:overflow-hidden">
            <GenerateChatPanel className="flex h-full flex-col" />
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
