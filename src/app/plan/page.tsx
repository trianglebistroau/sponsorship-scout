"use client"

import { format } from "date-fns"
import * as React from "react"

import { GeneratorNav } from "@/components/navigation"
import { fileTreeData } from "../generate/data/file-tree"
import { buildFileMap } from "../generate/utils"
import { PlannerCalendar } from "./components/planner-calendar"
import { SavedConceptsPanel } from "./components/saved-concepts-panel"
import type { SavedConcept } from "./types"

import {
  loadPlanConcepts,
  savePlanConcepts,
  subscribePlanItems,
} from "@/lib/planStore"

export default function PlanPage() {
  const [month, setMonth] = React.useState(new Date())

  const [concepts, setConcepts] = React.useState<SavedConcept[]>(() => {
    const loaded = loadPlanConcepts()
    return loaded
  })

  const [isSynced, setIsSynced] = React.useState(false)
  const fileLookup = React.useMemo(() => buildFileMap(fileTreeData), [])

  // If Deck commits while Plan is open (same tab), refresh
  React.useEffect(() => {
    return subscribePlanItems(() => {
      setConcepts(loadPlanConcepts())
    })
  }, [])

  // Persist any edits/scheduling/toggles
  React.useEffect(() => {
    savePlanConcepts(concepts)
  }, [concepts])

  const scheduleByDay = React.useMemo(() => {
    return concepts.reduce<Record<string, SavedConcept[]>>((acc, concept) => {
      if (!concept.plannedDate) return acc

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
        concept.id === conceptId ? { ...concept, executed: !concept.executed } : concept
      )
    )
  }, [])

  const handleDragStart = React.useCallback((conceptId: string) => {
    return conceptId
  }, [])

  const handleDrop = React.useCallback(
    (conceptId: string, date: Date) => {
      handlePlanConcept(conceptId, date)
    },
    [handlePlanConcept]
  )

  React.useEffect(() => {
    savePlanConcepts(concepts, { emit: false });
  }, [concepts]);


  const handleUpdateConcept = React.useCallback(
    (conceptId: string, updates: Pick<SavedConcept, "title" | "summary">) => {
      setConcepts((prev) =>
        prev.map((concept) => (concept.id === conceptId ? { ...concept, ...updates } : concept))
      )
    },
    []
  )

  const handleToggleChecklist = React.useCallback((conceptId: string, index: number) => {
    setConcepts((prev) =>
      prev.map((concept) => {
        if (concept.id !== conceptId) return concept
        const completed = concept.completedChecklists ? [...concept.completedChecklists] : []
        completed[index] = !completed[index]
        return { ...concept, completedChecklists: completed }
      })
    )
  }, [])

  const handleToggleReminder = React.useCallback((conceptId: string) => {
    setConcepts((prev) =>
      prev.map((concept) =>
        concept.id === conceptId ? { ...concept, reminder: !concept.reminder } : concept
      )
    )
  }, [])

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
              onToggleChecklist={handleToggleChecklist}
              fileLookup={fileLookup}
              onDragStart={handleDragStart}
              onToggleReminder={handleToggleReminder}
            />
          </div>
        </div>
      </div>
    </main>
  )
}

