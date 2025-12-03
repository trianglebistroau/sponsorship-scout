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
    name: "Ideas",
    type: "folder",
    children: [
      {
        id: "ideas/day-in-life",
        name: "Day in Life",
        type: "file",
        summary: "Creator documents an entire day to highlight rituals.",
        content:
          "### Day in Life rundown\n\n- Morning ritual focused on intentional hydration\n- Afternoon capture list for b-roll\n- Evening CTA to share your own anchor habits",
        accentColor: accents.ideas,
      },
      {
        id: "ideas/food-map",
        name: "Food Map",
        type: "file",
        summary: "Food tour stitched together like a local atlas.",
        content:
          "### Food Map beat sheet\n\nLayer pins + creator narration to guide followers through each stop.\n\n1. Open with the city's skyline.\n2. Use geo stickers + captions for context.\n3. Close with a poll about which spot they should visit next.",
        accentColor: accents.ideas,
      },
      {
        id: "ideas/matcha-tasting",
        name: "Matcha Tasting",
        type: "file",
        summary: "Side-by-side tasting notes for multiple matcha spots.",
        content:
          "### Matcha tasting script\n\nCompare aroma, froth, and vibe across locations. Highlight hook + CTA to share recs.",
        accentColor: accents.ideas,
      },
    ],
  },
  {
    id: "themes",
    name: "Themes",
    type: "folder",
    children: [
      {
        id: "themes/beach",
        name: "Beach",
        type: "file",
        summary: "Coastal energy with warm palettes and ambient audio.",
        content:
          "### Beach palette\n\nMix warm LUTs with analog noise. Tracklist: wave pads + soft house.",
        accentColor: accents.themes,
      },
      {
        id: "themes/vlog",
        name: "Vlog",
        type: "file",
        summary: "Handheld vlog with quick jump cuts and overlays.",
        content:
          "### Vlog pacing\n\nKeep shots < 2s, add supercut of creator laugh moments, finish with text overlay CTA.",
        accentColor: accents.themes,
      },
      {
        id: "themes/camera-facing",
        name: "Camera Facing",
        type: "file",
        summary: "Direct-to-camera delivery for intimate storytelling.",
        content:
          "### Camera facing notes\n\nUse tighter crop and add subtitle styling for clarity.",
        accentColor: accents.themes,
      },
    ],
  },
  {
    id: "strategies",
    name: "Strategies",
    type: "folder",
    children: [
      {
        id: "strategies/diversify-personal-brand",
        name: "Diversify Personal Brand",
        type: "file",
        summary: "Blend life, work, and hobbies to broaden reach.",
        content:
          "### Diversify talking points\n\nShare 3 slices of life > work > community. Tie back to brand promise.",
        accentColor: accents.strategies,
      },
      {
        id: "strategies/repeat-consistency",
        name: "Repeat Consistency",
        type: "file",
        summary: "Schedule recurring anchors to train the algorithm.",
        content:
          "### Consistency prompt\n\nPlot recurring series days and remind audience what to expect each drop.",
        accentColor: accents.strategies,
      },
    ],
  },
  {
    id: "brand",
    name: "Brand",
    type: "folder",
    children: [
      {
        id: "brand/white-fox",
        name: "White Fox",
        type: "file",
        summary: "White Fox brand cues and styling inspo.",
        content:
          "### White Fox reference\n\nFocus on bold neutrals, hero product framing, and mention the loyalty perks.",
        accentColor: accents.brand,
      },
      {
        id: "brand/cerave",
        name: "CeraVe",
        type: "file",
        summary: "CeraVe ingredient language and hero claims.",
        content:
          "### CeraVe cheat sheet\n\nBalance derm language with friendly tone. Mention ceramides + barrier repair CTA.",
        accentColor: accents.brand,
      },
    ],
  },
]
