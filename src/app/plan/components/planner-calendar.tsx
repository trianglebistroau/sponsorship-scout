import * as React from "react"
import { format } from "date-fns"
import { CheckCircle2, RefreshCw } from "lucide-react"
import { DayContentProps } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"

import type { SavedConcept } from "../types"

type PlannerCalendarProps = {
  month: Date
  onMonthChange: (month: Date) => void
  scheduleByDay: Record<string, SavedConcept[]>
  isSynced: boolean
  onToggleSync: () => void
  onDrop?: (conceptId: string, date: Date) => void
}

const DAY_KEY = "yyyy-MM-dd"

export function PlannerCalendar({
  month,
  onMonthChange,
  scheduleByDay,
  isSynced,
  onToggleSync,
  onDrop,
}: PlannerCalendarProps) {
  const dayContent = React.useMemo(() => {
    const DayContent = ({ date }: DayContentProps) => {
      const key = format(date, DAY_KEY)
      const items = scheduleByDay[key] ?? []

      const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
      }

      const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const conceptId = e.dataTransfer.getData("conceptId")
        if (conceptId && onDrop) {
          onDrop(conceptId, date)
        }
      }

      return (
        <div 
          className="flex h-full w-full flex-col gap-1 rounded-md bg-background/60 p-1.5 transition-colors hover:bg-background/80"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <span className="text-xs font-semibold text-foreground">{format(date, "d")}</span>
          <div className="space-y-1">
            {items.slice(0, 2).map((item) => (
              <p
                key={item.id}
                className="truncate rounded bg-primary/10 px-1 py-0.5 text-[10px] font-medium text-primary"
              >
                {item.title}
              </p>
            ))}
            {items.length > 2 ? (
              <p className="text-[10px] text-muted-foreground">+{items.length - 2} more</p>
            ) : null}
          </div>
        </div>
      )
    }

    return DayContent
  }, [scheduleByDay])

  const busyDays = React.useMemo(() => {
    return Object.keys(scheduleByDay).map((key) => {
      const [year, month, day] = key.split("-").map(Number)
      return new Date(year, month - 1, day)
    })
  }, [scheduleByDay])

  const syncLabel = isSynced ? "Synced with Google Calendar" : "Sync with Google Calendar"
  const SyncIcon = isSynced ? CheckCircle2 : RefreshCw

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>{format(month, "MMMM yyyy")}</CardTitle>
            <CardDescription>Publishing Calendar</CardDescription>
          </div>
          <Button
            variant={isSynced ? "secondary" : "outline"}
            size="sm"
            className="gap-2 whitespace-nowrap"
            onClick={onToggleSync}
          >
            <SyncIcon className="h-4 w-4" />
            {syncLabel}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-2">
        <Calendar
          month={month}
          onMonthChange={onMonthChange}
          components={{ DayContent: dayContent }}
          modifiers={{ busy: busyDays }}
          modifiersClassNames={{ busy: "border-primary/60" }}
          className="w-full"
          classNames={{
            months: "w-full",
            month: "w-full space-y-4",
            table: "w-full border-collapse",
            head_row: "grid grid-cols-7",
            head_cell:
              "text-center text-xs font-medium text-muted-foreground pb-2",
            row: "grid grid-cols-7 gap-2",
            cell: "relative min-h-[110px] rounded-lg border border-border bg-muted/40 p-1 align-top",
            day: "flex h-full w-full items-start justify-start bg-transparent p-0 text-left",
          }}
          showOutsideDays={false}
          mode="single"
        />
      </CardContent>
    </Card>
  )
}
