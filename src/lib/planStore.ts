// src/lib/planStore.ts
import type { SavedConcept } from "@/app/plan/types"
import type { FeedItemTags } from "@/app/generate/types"

export const DECK_KEY = "idea_deck_v1"
export const DECK_INDEX_KEY = "idea_deck_index_v1"

// Keep your key name so existing session data still works:
export const PLAN_ITEMS_KEY = "plan_items_v1"

const EMPTY_TAGS: FeedItemTags = { ideas: [], themes: [], strategies: [] }

// --- tiny session helpers ---
function ssGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function ssSet<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(key, JSON.stringify(value))
}

// Same-tab notification (sessionStorage does NOT emit "storage" events in same tab)
const EVENT_PREFIX = "planstore:"
function emit(key: string) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(`${EVENT_PREFIX}${key}`))
}
export function subscribePlanItems(cb: () => void) {
  if (typeof window === "undefined") return () => {}
  const handler = () => cb()
  window.addEventListener(`${EVENT_PREFIX}${PLAN_ITEMS_KEY}`, handler)
  return () => window.removeEventListener(`${EVENT_PREFIX}${PLAN_ITEMS_KEY}`, handler)
}

// --- deck persistence (generic) ---
export function loadDeck<T = any>(): T[] {
  return ssGet<T[]>(DECK_KEY, [])
}
export function saveDeck<T = any>(ideas: T[]) {
  ssSet(DECK_KEY, ideas)
  emit(DECK_KEY)
}
export function loadDeckIndex(): number {
  return ssGet<number>(DECK_INDEX_KEY, 0)
}
export function saveDeckIndex(i: number) {
  ssSet(DECK_INDEX_KEY, i)
  emit(DECK_INDEX_KEY)
}

// --- plan concepts persistence (SavedConcept) ---
// We persist dates as ISO strings because JSON can't store Date objects.
type PersistedConcept = Omit<SavedConcept, "plannedDate" | "checklists"> & {
  plannedDate?: string | null
  checklists?: string[]
}

// Backward compat: if you previously stored PlanItem[] like {id,title,hook,contentMd,...}
type LegacyPlanItem = {
  id: string
  title?: string
  hook?: string
  contentMd?: string
  createdAt?: string
}

function looksLikeLegacyPlanItem(x: any): x is LegacyPlanItem {
  return x && typeof x === "object" && typeof x.id === "string" && ("hook" in x || "contentMd" in x)
}

function hydrateConcept(p: PersistedConcept): SavedConcept {
  return {
    ...p,
    tags: p.tags ?? EMPTY_TAGS,
    plannedDate: p.plannedDate ? new Date(p.plannedDate) : null,
    checklists: p.checklists ? p.checklists.map((d) => new Date(d)) : undefined,
  }
}

function dehydrateConcept(c: SavedConcept): PersistedConcept {
  return {
    ...c,
    tags: c.tags ?? EMPTY_TAGS,
    plannedDate: c.plannedDate ? c.plannedDate.toISOString() : null,
    checklists: c.checklists ? c.checklists.map((d) => d.toISOString()) : undefined,
  }
}

export function loadPlanConcepts(): SavedConcept[] {
  const raw = ssGet<any[]>(PLAN_ITEMS_KEY, [])

  // Migration: legacy PlanItem[] -> SavedConcept[]
  if (raw.length && looksLikeLegacyPlanItem(raw[0])) {
    return raw.map((it: LegacyPlanItem) => ({
      id: it.id,
      title: it.title ?? "Untitled",
      summary: it.hook ?? "",
      tags: EMPTY_TAGS,
      plannedDate: null,
      executed: false,
      reminder: false,
    }))
  }

  // Normal: persisted SavedConcept[]
  return (raw as PersistedConcept[]).map(hydrateConcept)
}

export function savePlanConcepts(concepts: SavedConcept[], opts?: { emit?: boolean }) {
  ssSet(PLAN_ITEMS_KEY, concepts.map(dehydrateConcept));

  // Only emit when explicitly requested
  if (opts?.emit) emit(PLAN_ITEMS_KEY);
}


// --- upsert from committed deck ideas ---
// Keep this structural so we don't import IdeaData type (paths differ)
type IdeaForPlan = {
  status?: string
  planId?: string
  title?: string
  hook?: string
  contentMd?: string
}

export function upsertCommittedToPlan(ideas: IdeaForPlan[]) {
  const existing = loadPlanConcepts()
  const map = new Map(existing.map((c) => [c.id, c]))

  const committed = ideas.filter((i) => i.status === "committed" && i.planId)

  for (const idea of committed) {
    const id = idea.planId!
    const prev = map.get(id)

    map.set(id, {
      id,
      title: idea.title ?? prev?.title ?? "Untitled",
      summary: idea.hook ?? prev?.summary ?? "",
      tags: prev?.tags ?? EMPTY_TAGS,
      plannedDate: prev?.plannedDate ?? null,
      executed: prev?.executed ?? false,
      reminder: prev?.reminder ?? false,
      checklists: prev?.checklists,
      completedChecklists: prev?.completedChecklists,
    })
  }

  savePlanConcepts(Array.from(map.values()))
}
