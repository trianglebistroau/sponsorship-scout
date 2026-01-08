"use client"

import * as React from "react"
import { format } from "date-fns"

import { GeneratorNav } from "@/components/navigation"
import { fileTreeData } from "../generate/data/file-tree"
import { buildFileMap } from "../generate/utils"
import { PlannerCalendar } from "./components/planner-calendar"
import { SavedConceptsPanel } from "./components/saved-concepts-panel"
import type { SavedConcept } from "./types"

const buildInitialConcepts = (): SavedConcept[] => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  return [
    {
      id: "concept-1",
      title: "Busy Girl Beach Reset",
      summary: "A calm sunset reset vlog with aesthetic B-roll",
      tags: {
        ideas: ["ideas/solo-runs"],
        themes: ["themes/voiceover-broll"],
        strategies: ["strategies/quiet-moments"],
      },
      plannedDate: new Date(year, month, 5),
      executed: false,
    },
    {
      id: "concept-2",
      title: "Morning Run I Almost Skipped",
      summary: "Honest fitness content without pressure",
      tags: {
        ideas: ["ideas/solo-runs"],
        themes: ["themes/camera-facing"],
        strategies: ["strategies/runs-almost-skipped"],
      },
      plannedDate: new Date(year, month, 12),
      executed: true,
    },
    {
      id: "concept-3",
      title: "10-Minute Meals That Saved Me",
      summary: "Quick cooking for busy days",
      tags: {
        ideas: ["ideas/cafe-hopping"],
        themes: ["themes/day-in-life"],
        strategies: ["strategies/quick-meals"],
      },
      executed: false,
    },
    {
      id: "concept-4",
      title: "Café Study Session Essentials",
      summary: "Aesthetic productivity with cozy vibes",
      tags: {
        ideas: ["ideas/cafe-hopping"],
        themes: ["themes/photo-dumps"],
        strategies: [],
      },
      executed: false,
    },
    {
      id: "concept-5",
      title: "Quiet Moments After 9PM",
      summary: "Late-night reflections and winding down",
      tags: {
        ideas: ["ideas/night-resets"],
        themes: ["themes/camera-facing"],
        strategies: ["strategies/quiet-moments"],
      },
      plannedDate: new Date(year, month, 22),
      executed: false,
    },
  ]
}

export default function PlanPage() {
  const [month, setMonth] = React.useState(new Date())
  const [concepts, setConcepts] = React.useState<SavedConcept[]>(() =>
    buildInitialConcepts()
  )
  const [isSynced, setIsSynced] = React.useState(false)
  const fileLookup = React.useMemo(() => buildFileMap(fileTreeData), [])

  const scheduleByDay = React.useMemo(() => {
    return concepts.reduce<Record<string, SavedConcept[]>>((acc, concept) => {
      if (!concept.plannedDate) {
        return acc
      }

      const normalizedDate = new Date(
        concept.plannedDate.getFullYear(),
        concept.plannedDate.getMonth(),
        concept.plannedDate.getDate()
      )
      const key = format(normalizedDate, "yyyy-MM-dd")
      acc[key] = acc[key] ? [...acc[key], concept] : [concept]
      return acc
    }, {})
  }, [concepts])

  const handlePlanConcept = React.useCallback((conceptId: string, date: Date | null) => {
    setConcepts((prev) =>
      prev.map((concept) =>
        concept.id === conceptId
          ? {
              ...concept,
              plannedDate: date
                ? new Date(date.getFullYear(), date.getMonth(), date.getDate())
                : null,
            }
          : concept
      )
    )
  }, [])

  const handleToggleExecuted = React.useCallback((conceptId: string) => {
    setConcepts((prev) =>
      prev.map((concept) =>
        concept.id === conceptId
          ? { ...concept, executed: !concept.executed }
          : concept
      )
    )
  }, [])

  const handleDragStart = React.useCallback((conceptId: string) => {
    // Store concept ID for drop handling
    return conceptId
  }, [])

  const handleDrop = React.useCallback((conceptId: string, date: Date) => {
    handlePlanConcept(conceptId, date)
  }, [handlePlanConcept])

  const handleUpdateConcept = React.useCallback(
    (conceptId: string, updates: Pick<SavedConcept, "title" | "summary">) => {
      setConcepts((prev) =>
        prev.map((concept) =>
          concept.id === conceptId ? { ...concept, ...updates } : concept
        )
      )
    },
    []
  )

  return (
    <main className="h-screen bg-background overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1600px] flex-col gap-6 px-4 py-6 lg:px-8">
        <GeneratorNav />
        <div className="flex flex-1 flex-col gap-6 overflow-hidden lg:flex-row">
          <div className="flex h-full flex-1 flex-col lg:basis-[70%]">
            <PlannerCalendar
              month={month}
              onMonthChange={setMonth}
              scheduleByDay={scheduleByDay}
              isSynced={isSynced}
              onToggleSync={() => setIsSynced((prev) => !prev)}
              onDrop={handleDrop}
            />
          </div>
          <div className="flex h-full flex-1 flex-col lg:basis-[30%]">
            <SavedConceptsPanel
              concepts={concepts}
              onPlanConcept={handlePlanConcept}
              onToggleExecuted={handleToggleExecuted}
              onUpdateConcept={handleUpdateConcept}
              fileLookup={fileLookup}
              onDragStart={handleDragStart}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
