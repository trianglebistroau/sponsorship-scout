import type { FeedItemTags } from "../generate/types"

export type SavedConcept = {
  id: string
  title: string
  summary: string
  tags: FeedItemTags
  plannedDate?: Date | null
  executed?: boolean
  checklists?: Date[]
  completedChecklists?: boolean[]
  reminder?: boolean
}
