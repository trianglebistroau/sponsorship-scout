import type { FeedItemTags } from "../test/types"

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
