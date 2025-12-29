import { FileNode } from "../types"

const accents = {
  ideas: "#f97316",
  themes: "#6366f1",
  strategies: "#10b981",
  brand: "#06b6d4",
}

export const fileTreeData: FileNode[] = [
  {
    id: "ideas",
    name: "Content Lanes",
    type: "folder",
    children: [
      {
        id: "ideas/uni-life",
        name: "Uni life & routines",
        type: "file",
        summary: "What this creator naturally shows up for",
        content:
          "### Uni life & routines\n\nBalancing classes, study sessions, and finding moments to breathe between deadlines.",
        accentColor: accents.ideas,
      },
      {
        id: "ideas/cafe-hopping",
        name: "Café hopping",
        type: "file",
        summary: "Exploring local coffee spots and hidden gems",
        content:
          "### Café hopping\n\nFinding the best study spots, aesthetic corners, and discovering neighborhood favorites.",
        accentColor: accents.ideas,
      },
      {
        id: "ideas/solo-runs",
        name: "Solo runs around the city",
        type: "file",
        summary: "Movement, mindfulness, and urban exploration",
        content:
          "### Solo runs around the city\n\nEarly morning routes, evening wind-downs, and finding peace in motion.",
        accentColor: accents.ideas,
      },
      {
        id: "ideas/night-resets",
        name: "Quiet night resets",
        type: "file",
        summary: "Evening rituals and unwinding routines",
        content:
          "### Quiet night resets\n\nWinding down with intention: skincare, journaling, and setting up for tomorrow.",
        accentColor: accents.ideas,
      },
    ],
  },
  {
    id: "themes",
    name: "Formats",
    type: "folder",
    children: [
      {
        id: "themes/day-in-life",
        name: "Day-in-the-life vlog",
        type: "file",
        summary: "Authentic, unfiltered daily experiences",
        content:
          "### Day-in-the-life vlog\n\nFollow along from morning to night, showing the real, unfiltered day.",
        accentColor: accents.themes,
      },
      {
        id: "themes/voiceover-broll",
        name: "Voiceover + B-roll",
        type: "file",
        summary: "Narrated visuals with thoughtful commentary",
        content:
          "### Voiceover + B-roll\n\nLetting the visuals breathe while narrating thoughts, reflections, or story arcs.",
        accentColor: accents.themes,
      },
      {
        id: "themes/camera-facing",
        name: "Camera-facing reflections",
        type: "file",
        summary: "Direct, intimate conversations with the audience",
        content:
          "### Camera-facing reflections\n\nSitting down, looking straight at the camera, and sharing what's real.",
        accentColor: accents.themes,
      },
      {
        id: "themes/photo-dumps",
        name: "Photo dumps with captions",
        type: "file",
        summary: "Visual storytelling through collected moments",
        content:
          "### Photo dumps with captions\n\nA week in photos. No pressure, just captured life with short thoughts underneath.",
        accentColor: accents.themes,
      },
    ],
  },
  {
    id: "strategies",
    name: "Recurring Series",
    type: "folder",
    children: [
      {
        id: "strategies/runs-almost-skipped",
        name: "Runs I Almost Skipped",
        type: "file",
        summary: "Repeatable ideas that build identity",
        content:
          "### Runs I Almost Skipped\n\nHonest check-ins about the runs that almost didn't happen. Very relatable, very real.",
        accentColor: accents.strategies,
      },
      {
        id: "strategies/sundays-reset",
        name: "Sundays Reset With Me",
        type: "file",
        summary: "Weekly ritual content that audiences expect",
        content:
          "### Sundays Reset With Me\n\nA calm, predictable series. Laundry, meal prep, planning the week ahead.",
        accentColor: accents.strategies,
      },
      {
        id: "strategies/quick-meals",
        name: "Meals That Took 10 Minutes",
        type: "file",
        summary: "Your recognizable show format",
        content:
          "### Meals That Took 10 Minutes\n\nSimple, fast, no-fuss recipes for busy days. Nothing fancy, just practical.",
        accentColor: accents.strategies,
      },
      {
        id: "strategies/quiet-moments",
        name: "Quiet Moments After 9PM",
        type: "file",
        summary: "Branded rituals people come back for",
        content:
          "### Quiet Moments After 9PM\n\nLate-night reflections, winding down, and finding stillness before sleep.",
        accentColor: accents.strategies,
      },
    ],
  },
  {
    id: "brand",
    name: "Brand Fit",
    type: "folder",
    children: [
      {
        id: "brand/nike",
        name: "Nike",
        type: "file",
        summary: "Fits my running journey and everyday movement content",
        content:
          "### Nike\n\nAlignment: Running, movement, and showing up even when it's hard. Authentic athlete energy.",
        accentColor: accents.brand,
      },
      {
        id: "brand/lululemon",
        name: "Lululemon",
        type: "file",
        summary: "Calm routines, wellness, lifestyle storytelling",
        content:
          "### Lululemon\n\nAlignment: Mindful movement, self-care rituals, and intentional living. Wellness-forward.",
        accentColor: accents.brand,
      },
      {
        id: "brand/apple",
        name: "Apple",
        type: "file",
        summary: "Clean visuals, productivity, creative workflows",
        content:
          "### Apple\n\nAlignment: Aesthetic consistency, productivity content, and creative process documentation.",
        accentColor: accents.brand,
      },
    ],
  },
]
