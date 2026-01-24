import { format } from "date-fns"
import { CalendarIcon, Sparkles, Upload, Video } from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"

import type { FileNode, TagCategory } from "../../generate/types"
import type { SavedConcept } from "../types"

type SavedConceptsPanelProps = {
  concepts: SavedConcept[]
  onPlanConcept: (conceptId: string, date: Date | null) => void
  onToggleExecuted: (conceptId: string) => void
  onToggleChecklist?: (conceptId: string, index: number) => void
  onToggleReminder?: (conceptId: string) => void
  onUpdateConcept: (conceptId: string, updates: Pick<SavedConcept, "title" | "summary">) => void
  fileLookup: Record<string, FileNode>
  onDragStart?: (conceptId: string) => string
}

export function SavedConceptsPanel({
  concepts,
  onPlanConcept,
  onToggleExecuted,
  onUpdateConcept,
  onToggleChecklist,
  onToggleReminder,
  fileLookup,
  onDragStart,
}: SavedConceptsPanelProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>Starred Concepts</CardTitle>
          <CardDescription>{concepts.length} ideas ready to schedule</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
        <div className="space-y-4 p-4">
          {concepts.map((concept) => (
            <ConceptListItem
              key={concept.id}
              concept={concept}
              onPlanConcept={onPlanConcept}
              onToggleExecuted={onToggleExecuted}
              onUpdateConcept={onUpdateConcept}
              onToggleChecklist={onToggleChecklist}
              onToggleReminder={onToggleReminder}
              fileLookup={fileLookup}
              onDragStart={onDragStart}
            />
          ))}
        </div>
      </ScrollArea>
      </CardContent>
    </Card>
  )
}

type ConceptListItemProps = {
  concept: SavedConcept
  onPlanConcept: (conceptId: string, date: Date | null) => void
  onToggleExecuted: (conceptId: string) => void
  onUpdateConcept: (conceptId: string, updates: Pick<SavedConcept, "title" | "summary">) => void
  fileLookup: Record<string, FileNode>
  onDragStart?: (conceptId: string) => string
  onToggleChecklist?: (conceptId: string, index: number) => void
  onToggleReminder?: (conceptId: string) => void
}

const tagCategoryLabels: Record<TagCategory, string> = {
  ideas: "Content Lane",
  themes: "Format",
  strategies: "Recurring Series",
}

function ConceptListItem({
  concept,
  onPlanConcept,
  onToggleExecuted,
  onUpdateConcept,
  fileLookup,
  onDragStart,
  onToggleChecklist,
  onToggleReminder,
}: ConceptListItemProps) {
  const [open, setOpen] = React.useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [draftTitle, setDraftTitle] = React.useState(concept.title)
  const [draftSummary, setDraftSummary] = React.useState(concept.summary ?? "")
  const tagEntries = Object.entries(concept.tags ?? {}) as [TagCategory, string[]][]
  const resolvedTags = tagEntries.flatMap(([category, ids]) =>
    ids.map((tagId) => ({ category, node: fileLookup[tagId] }))
  )

  React.useEffect(() => {
    setDraftTitle(concept.title)
    setDraftSummary(concept.summary ?? "")
  }, [concept.id, concept.summary, concept.title])

  const handleSave = () => {
    onUpdateConcept(concept.id, { title: draftTitle, summary: draftSummary })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setDraftTitle(concept.title)
    setDraftSummary(concept.summary ?? "")
    setIsEditing(false)
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(concept.id)
    }
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("conceptId", concept.id)
  }

  return (
    <Card 
      className="bg-card/80 cursor-grab active:cursor-grabbing transition-transform hover:scale-[1.02]"
      draggable
      onDragStart={handleDragStart}
    >
      <CardHeader className="space-y-3">
        <CardTitle className="text-xl">{concept.title}</CardTitle>

        <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Upload video"
              >
                <Upload className="h-4 w-4" />
                <span className="sr-only">Upload video for {concept.title}</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Generate with Veo"
              >
                <Video className="h-4 w-4" />
                <span className="sr-only">Generate with Veo for {concept.title}</span>
              </Button>
            </div>
        <div className="flex items-start justify-between gap-3">
        <div className="flex shrink-0 items-start gap-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Badge variant={concept.plannedDate ? "secondary" : "outline"} className="text-xs">
                  {concept.plannedDate ? "Scheduled" : "Unplanned"}
                </Badge>
                {concept.reminder && (
                  <Badge variant="secondary" className="text-xs">
                    Reminder set
                  </Badge>
                )}
              </div>
            </div>
            
          </div>
        </div>
        {resolvedTags.length ? (
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
                  key={`${concept.id}-${category}-${node.id}`}
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
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="text-sm text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Publishing date
            </p>
            <p className="text-foreground">
              {concept.plannedDate ? format(concept.plannedDate, "MMM do") : "Not planned yet"}
            </p>
          </div>
          <div className="flex flex-nowrap items-center justify-end gap-2">
            <Popover open={open} onOpenChange={setOpen} modal={false}>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {concept.plannedDate ? "Reschedule" : "Plan date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="space-y-3 p-3">
                  <Calendar
                    mode="single"
                    selected={concept.plannedDate ?? undefined}
                    onSelect={(date) => {
                      if (!date) return
                      onPlanConcept(concept.id, date)
                      setOpen(false)
                    }}
                    initialFocus
                  />
                  {concept.plannedDate ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-center"
                      onClick={() => {
                        onPlanConcept(concept.id, null)
                        setOpen(false)
                      }}
                    >
                      Cancel schedule
                    </Button>
                  ) : null}
                </div>
              </PopoverContent>
            </Popover>
            <Popover open={suggestionsOpen} onOpenChange={setSuggestionsOpen}>
              <PopoverTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-muted-foreground"
                  title="AI suggestions"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="sr-only">AI suggestions for {concept.title}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Best posting window</h4>
                    <p className="text-xs text-muted-foreground mt-1"> </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">checklist to do</h4>
                    <span>
                      {concept.checklists?.map((item, index) => (
                        <p key={index} className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                          <span>{format(item, "MMM do")}</span>
                          <input
                            type="checkbox"
                            checked={concept.completedChecklists?.[index] || false}
                            onChange={() => {
                              if (onToggleChecklist) onToggleChecklist(concept.id, index)
                            }}
                          />
                        </p>
                      ))}
                    </span>

                  </div>
                  {resolvedTags.some(tag => tag.category === 'strategies' && tag.node) && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Frequency</h4>
                      <p className="text-xs text-muted-foreground mt-1">Once weekly keeps the series consistent</p>
                    </div>
                  )}

                  <Button
                    type="button"
                    variant={concept.reminder ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    title="Toggle reminder"
                    onClick={() => onToggleReminder?.(concept.id)}
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                    <span className="p-5">{concept.reminder ? "Reminder set." : "want to set a reminder?"}</span>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground italic">
                      Based on your formats + past saves
                    </p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
      <Dialog
        open={isEditing}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            handleCancel()
          } else {
            setIsEditing(true)
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit concept</DialogTitle>
            <DialogDescription>Keep descriptions tight before you publish.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Title
              </label>
              <Input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Summary
              </label>
              <Textarea
                value={draftSummary}
                onChange={(event) => setDraftSummary(event.target.value)}
                className="min-h-[160px]"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={!draftTitle.trim() || !draftSummary.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
