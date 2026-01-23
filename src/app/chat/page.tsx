"use client"

import { ChevronRight } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { GeneratorNav } from "@/components/navigation"
import { fileTreeData } from "../generate/data/file-tree"
import { FileNode } from "../generate/types"
import { ResearchChatPanel } from "./components/chat-panel"
import { VibeGallery } from "./components/vibe-gallery"

export default function ResearchPage() {
  const [isGalleryOpen, setIsGalleryOpen] = React.useState(true)
  const [composerValue, setComposerValue] = React.useState("")

  const handleInsertVibe = React.useCallback((file: FileNode) => {
    const mention = `@${file.name}`
    setComposerValue((prev) => {
      const needsSpace = prev && !prev.endsWith(" ") ? " " : ""
      return `${prev}${needsSpace}${mention} `
    })
  }, [])

  return (
    <main className="h-screen bg-background overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1600px] flex-col gap-6 px-4 py-6 lg:px-8">
        <div className="flex flex-1 flex-col gap-6 overflow-hidden lg:flex-row lg:gap-8">
          <div
            className={cn(
              "flex flex-col transition-all duration-300",
              "min-h-0",
              isGalleryOpen
                ? "lg:basis-[30%] lg:max-w-md"
                : "lg:basis-[4%] lg:max-w-[48px]"
            )}
          >
            {isGalleryOpen ? (
              <div className="flex-1 overflow-hidden rounded-2xl border bg-card/60">
                <VibeGallery
                  sections={fileTreeData}
                  open={isGalleryOpen}
                  onOpenChange={setIsGalleryOpen}
                  onInsertVibe={handleInsertVibe}
                />
              </div>
            ) : (
              <Button
                variant="ghost"
                className="flex h-full w-full items-center justify-center rounded-2xl border bg-card/80"
                onClick={() => setIsGalleryOpen(true)}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Expand vibe reference</span>
              </Button>
            )}
          </div>
          <div
            className={cn(
              "flex flex-1 flex-col transition-all duration-300",
              "min-h-0",
              isGalleryOpen ? "lg:basis-[70%]" : "lg:basis-full"
            )}
          >
            <div className="flex-1 min-h-0">
              <ResearchChatPanel
                inputValue={composerValue}
                onInputChange={setComposerValue}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
