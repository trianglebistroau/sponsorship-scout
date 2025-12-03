"use client"

import * as React from "react"
import { format } from "date-fns"

import { GeneratorNav } from "../generate/components/top-nav"
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
      title: "Matcha tasting recap",
      summary: "Quick beats + CTA focused on tasting notes.",
      tags: {
        ideas: ["ideas/matcha-tasting"],
        themes: ["themes/vlog"],
        strategies: ["strategies/diversify-personal-brand"],
      },
      plannedDate: new Date(year, month, 5),
      executed: false,
    },
    {
      id: "concept-2",
      title: "Diversify personal brand",
      summary: "Share 3 variations of the hero storyline.",
      tags: {
        ideas: ["ideas/day-in-life"],
        themes: ["themes/camera-facing"],
        strategies: ["strategies/diversify-personal-brand"],
      },
      plannedDate: new Date(year, month, 12),
      executed: true,
    },
    {
      id: "concept-3",
      title: "Beach day vlog",
      summary: "Shot list + hook for sunrise session.",
      tags: {
        ideas: ["ideas/food-map"],
        themes: ["themes/beach"],
        strategies: ["strategies/repeat-consistency"],
      },
      executed: false,
    },
    {
      id: "concept-4",
      title: "White Fox drop",
      summary: "Post-launch hype checkpoints.",
      tags: {
        ideas: ["ideas/day-in-life"],
        themes: ["themes/camera-facing"],
        strategies: ["strategies/diversify-personal-brand"],
      },
      executed: false,
    },
    {
      id: "concept-5",
      title: "Camera facing pep talk",
      summary: "Short motivational script cues.",
      tags: {
        ideas: ["ideas/matcha-tasting"],
        themes: ["themes/camera-facing"],
        strategies: ["strategies/repeat-consistency"],
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
            />
          </div>
          <div className="flex h-full flex-1 flex-col lg:basis-[30%]">
            <SavedConceptsPanel
              concepts={concepts}
              onPlanConcept={handlePlanConcept}
              onToggleExecuted={handleToggleExecuted}
              onUpdateConcept={handleUpdateConcept}
              fileLookup={fileLookup}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
