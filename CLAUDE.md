# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Creator Coach (Sponsorship Scout) - An AI-powered mentorship platform for TikTok creators to grow their presence and secure brand sponsorships. Currently in alpha development.

**Product Features:**
1. **Onboarding & Analysis:** TikTok creator profile analysis with AI-powered persona classification
2. **Creative Workspace (Solvi):** Content ideation suite with research, generation, and planning tools
3. **Dashboard:** Creator hub with video suggestions, sponsorship radar, and progression tracking

**Tech Stack:** Next.js 15 (App Router) + React 18 + TypeScript + Prisma + PostgreSQL (Supabase) + Google Gemini API + Tailwind CSS + shadcn/ui + Framer Motion

## Essential Commands

```bash
# Development
pnpm dev              # Start dev server with Turbopack (port 3000)

# Building
pnpm build            # Production build with Turbopack

# Code Quality
pnpm lint             # Run ESLint
npx prettier --write . # Format all files

# Database (Prisma)
npx dotenv -e .env.local -- prisma db pull    # Pull schema from Supabase
npx dotenv -e .env.local -- prisma db push    # Push schema changes to Supabase
npx dotenv -e .env.local -- prisma generate   # Regenerate Prisma client after schema changes
npx dotenv -e .env.local -- prisma studio     # Open Prisma Studio for database GUI

# Git Hooks (Husky + lint-staged)
# Pre-commit: Auto-runs ESLint --fix and Prettier on staged files
# Pre-push: Configured but currently empty
```

**Note:** This project uses **pnpm** as the package manager (v10.17.1+). Do not use npm or yarn.

## Architecture Overview

### Data Layer Architecture

**Dual Database Strategy:**
- **Prisma** (`src/lib/prisma.ts`) - Primary ORM for type-safe database access
- **Supabase Client** (`src/utils/supabase/client.ts`) - Legacy client for auth and real-time (migration to Prisma in progress, see comment: "prisma link up later")

**Database Models:**
- `User`: Creator profile with AI analysis fields stored as JSON (`content_profile`, `content_analysis`, `profile_analysis`, `element_strength`)
- `Video`: Individual video metrics with composite primary key `(id, username)` for efficient user queries

**Key Pattern:** The `Video` model uses a **composite primary key** for performance. Always query videos with both `id` and `username` when targeting a specific video.

### Prisma Client Singleton Pattern

The Prisma client uses a singleton pattern (`src/lib/prisma.ts:1-13`) to prevent multiple instances in development:

```typescript
// Reuses the same client instance across hot reloads in dev
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ['query', 'error', 'warn'] });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Always import from this file:** `import { prisma } from '@/lib/prisma'`

### Next.js App Router Structure

**Key Routing Pattern:**
- `app/[[...slug]]/` - Catch-all route that redirects root to `/welcome`
- `app/[[...slug]]/client.tsx` - Client-side entry point with `'use client'` directive, dynamically imports App component with `ssr: false`

**Critical Pages:**
- `/welcome` - Landing page (entry point)
- `/onboarding` - 4-step creator onboarding flow (TikTok profile → Top creators → Dream brands → AI processing)
- `/dashboard` - Main creator hub with persona, video suggestions, sponsorship radar, progression ladder
- `/gemini` - Experimental Google Gemini API integration for video analysis

**Creative Workspace Pages** (branded as "Solvi"):
- `/profile` - Profile workspace (placeholder, coming soon)
- `/research` - AI chat interface with vibe gallery for content research
- `/generate` - Content idea generator with vibe picker, concept feed, and thought process panel
- `/plan` - Content calendar for scheduling and tracking saved concepts

### Creative Workspace Architecture

**Overview:**
The Creative Workspace is a content creation suite for TikTok creators, allowing them to research ideas, generate concepts, and plan content schedules. All workspace pages share a unified navigation (`GeneratorNav`) and a common file tree data structure.

**Shared Data Structure** (`src/app/generate/data/file-tree.ts`):
- Hierarchical file tree with 4 main categories: Ideas, Themes, Strategies, Brand
- Each category is a folder containing individual "vibe" files
- File structure:
  ```typescript
  {
    id: string              // e.g., "ideas/day-in-life"
    name: string            // Display name
    type: "folder" | "file"
    summary?: string        // Brief description
    content?: string        // Full markdown content
    accentColor?: string    // Category color (#f97316, #6366f1, etc.)
    children?: FileNode[]   // For folders
  }
  ```
- **Color Coding:** Ideas (orange #f97316), Themes (indigo #6366f1), Strategies (emerald #10b981), Brand (cyan #06b6d4)
- **Current Content:** 3 Ideas (Day in Life, Food Map, Matcha Tasting), 3 Themes (Beach, Vlog, Camera Facing), 2 Strategies (Diversify Personal Brand, Repeat Consistency), 2 Brands (White Fox, CeraVe)
- Shared across `/generate`, `/plan`, and `/research` via `buildFileMap()` utility

**Page-Specific Functionality:**

1. **`/generate` - Content Idea Generator** (`src/app/generate/page.tsx`):
   - **Layout:** 3-column (VibePicker | ConceptFeed | ThoughtProcessPanel)
   - **VibePicker:** Browse and select vibes from file tree
   - **ConceptFeed:** Dynamically generated feed items with tags (ideas/themes/strategies)
   - **Features:** Star/favorite items, inline editing, tag filtering, load more pagination
   - **Key Files:** `types.ts`, `utils.ts` (markdown converter, file tree manipulation)

2. **`/plan` - Content Calendar** (`src/app/plan/page.tsx`):
   - **Layout:** 2-column (Calendar | Saved Concepts Panel)
   - Uses `date-fns` for date formatting
   - Drag-and-drop concept scheduling onto calendar dates
   - Tracks execution status (executed/pending)
   - `SavedConcept` type extends feed items with `plannedDate` and `executed` fields

3. **`/research` - AI Research Chat** (`src/app/research/page.tsx`):
   - **Layout:** 2-column (Collapsible Vibe Gallery | Chat Panel)
   - Insert vibes as `@mentions` into chat composer
   - Vibe gallery can collapse to 4% width for focused chat view
   - Shares file tree data with other workspace pages

**Shared Utilities** (`src/app/generate/utils.ts`):
- `buildFileMap()`: Flattens file tree into ID→FileNode lookup map
- `applyFileOverrides()`: Applies user edits to file tree (name, summary, content)
- `convertMarkdownToHtml()`: Custom markdown parser (headings, lists, bold, italic, code blocks)
- `escapeMarkdownHtml()`: HTML entity escaping

**Shared Navigation Components** (`src/components/navigation/`):
- `GeneratorNav`: Unified navigation bar for all Creative Workspace pages (Profile, Research, Generate, Plan)
- Displays "Solvi - Creative Workspace" branding with page navigation and theme toggle
- Self-contained component with no external state dependencies
- Import via: `import { GeneratorNav } from "@/components/navigation"`

**Performance Patterns:**
- Heavy use of `React.useMemo` for derived data (file maps, filtered lists)
- `React.useCallback` for event handlers to prevent re-renders
- All pages use `'use client'` directive (client-side rendering)

### Animation Architecture

**Framer Motion Integration:**
The Creative Workspace uses Framer Motion for interactive and state-driven animations while maintaining CSS-based animations for decorative effects.

**Animation Strategy:**
- **Framer Motion:** Entrance animations, edit mode transitions, interactive feedback (star toggle)
- **Tailwind CSS:** Decorative animations (float, glow, slideUp, progress)
- **Coordination:** Spring timings match design system cubic-bezier(0.4, 0, 0.2, 1)

**Key Configuration:**
```typescript
// Snappy spring (matches design system)
const snapSpring = {
  type: "spring",
  stiffness: 280,
  damping: 32,
  mass: 1
}

// Design system easing
const smoothTransition = {
  duration: 0.4,
  ease: [0.4, 0, 0.2, 1]
}
```

**ConceptFeed Animations** (`src/app/generate/components/concept-feed.tsx`):
1. **Item Entrance:** Slide up + fade (600ms spring)
2. **Edit Mode:** Cross-fade transition (300ms)
3. **Star Toggle:** Scale + rotate feedback (500ms spring)
4. **Sentinel:** Fade in (500ms)

**Performance Patterns:**
- Animate only `transform` and `opacity` properties
- Use `layout` prop for edit mode to prevent snap-point shift
- `AnimatePresence` with `mode="popLayout"` for smooth exits
- `layoutId` for coordinating layout changes across states
- Respect `prefers-reduced-motion` for accessibility
- Target 60 FPS during scroll-snap transitions

**Conflict Prevention:**
- Spring duration (0.6-0.8s) matches CSS scroll-snap timing
- Layout animations don't shift snap points
- Exit animations complete before snap behavior triggers
- Scroll container remains CSS-only (no Framer scroll control)

**Libraries:**
- `framer-motion` (^12.x) - Primary animation library
- `tailwindcss-animate` - CSS utility animations

### AI Integration Architecture

**Google Gemini API Pattern:**
- Upload video files to Gemini API
- Poll for processing status (file state must be `ACTIVE`)
- Send prompts with structured JSON schema for consistent responses
- Clean up uploaded files after processing

**JSON Storage Pattern:**
All AI-generated analysis is stored in PostgreSQL JSON columns for flexible, schema-less data:
- `User.content_profile` - Creator archetype/persona classification
- `User.content_analysis` - Content strengths and weaknesses
- `Video.ai_processed_output` - Individual video AI analysis
- `Video.video_analysis` - Detailed video breakdown

### Design System

**Custom CSS Variables** (`src/app/index.css`):
- Uses HSL color format for all colors to enable easy dark mode switching
- Design tokens defined in `:root` (light) and `.dark` (dark mode)
- Custom gradients: `--gradient-primary`, `--gradient-success`, `--gradient-hero`, `--gradient-card`
- Custom animations: `float`, `glow`, `slideUp`, `progress`, `accordion`

**Component Library:**
- 50+ shadcn/ui components in `src/components/ui/` built on Radix UI primitives
- All components are accessible by default (ARIA attributes, keyboard navigation)

### State Management

**Current Pattern:**
- Local component state with `useState` for forms (see onboarding page)
- TanStack React Query configured but not yet heavily utilized
- **TODO:** Migrate to React Hook Form + Zod for form validation (noted in `src/app/onboarding/page.tsx:12`)

## Environment Variables

Required in `.env.local`:

```bash
# Supabase (PostgreSQL)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://...          # For Prisma
DIRECT_URL=postgresql://...            # For Prisma migrations (direct connection)

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Backend API (if applicable)
BACKEND_URL_DEV=``
```

**Security Note:** Supabase uses Row Level Security (RLS) on both User and Video tables. Ensure RLS policies are configured properly in Supabase dashboard.

## Development Patterns & Conventions

### Path Aliases

TypeScript is configured with `@/*` alias pointing to `src/*`:

```typescript
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
```

### TypeScript Configuration

**Lenient Settings** (intentional for rapid development):
- `noImplicitAny: false`
- `noUnusedParameters: false`
- `noUnusedLocals: false`
- `strictNullChecks: false`

This is an alpha project prioritizing speed over strictness.

### Code Quality Automation

**Husky + lint-staged** automatically runs on git commits:
- ESLint with `--fix` flag
- Prettier formatting
- Applies to: `*.{js,jsx,ts,tsx,json,md,css,scss}`

**Manual formatting:**
```bash
npx prettier --write .
```

### Component File Patterns

**Page Components:**
- Must have `'use client'` directive if using React hooks or client-side features
- Located in `app/[route]/page.tsx`

**Reusable Components:**
- Feature components: `src/components/PersonaProfile.tsx`, `VideoCarousel.tsx`, etc.
- UI primitives: `src/components/ui/*` (shadcn/ui components)
- Workspace components: Each workspace page (`/generate`, `/plan`, `/research`) has its own `components/` subdirectory

**Workspace Component Organization:**
```
src/app/
├── generate/
│   ├── components/       # Generate-specific components
│   ├── data/            # file-tree.ts (shared data source)
│   ├── types.ts         # FileNode, FeedItem types
│   └── utils.ts         # Shared utilities
├── plan/
│   ├── components/      # Plan-specific components
│   └── types.ts         # SavedConcept type
└── research/
    └── components/      # Research-specific components
```

**Shared Components Across Workspace Pages:**
- `GeneratorNav`: Located at `src/components/navigation/generator-nav.tsx` (shared navigation for all workspace pages)
- `file-tree.ts`: Located at `src/app/generate/data/file-tree.ts` (shared data structure)
- Shared utilities: Located at `src/app/generate/utils.ts` (buildFileMap, applyFileOverrides, etc.)

### Navigation Component Pattern

Navigation components that are shared across multiple routes should be placed in `src/components/navigation/`:

```typescript
// Shared navigation components
import { GeneratorNav } from "@/components/navigation"

// Route-specific components stay in app/[route]/components/
import { VibePicker } from "./components/vibe-picker"
```

**Organizational Principle:**
- **`src/components/`** - Globally shared components used across different app sections
- **`src/components/navigation/`** - Navigation-specific shared components
- **`src/components/ui/`** - shadcn/ui primitives and base components
- **`src/app/[route]/components/`** - Route-specific components that are not reused elsewhere

### API Response Pattern

Use `SuperJSON` for API responses to handle complex types (`src/lib/api-response.ts`):

```typescript
import superjson from 'superjson';

export async function GET() {
  const data = await prisma.user.findMany();
  return new Response(superjson.stringify({ success: true, data }));
}
```

## Known Technical Debt

From code comments and analysis:

1. **Onboarding Page Refactor** (`src/app/onboarding/page.tsx:12`):
   - Comment: "Really need to clean this file up later"
   - TODO: Split step logic into separate components
   - TODO: Migrate to React Hook Form + Zod for validation (currently using manual state)

2. **Progress Bar Accuracy**:
   - Modal progress tracking needs to reflect actual AI model progress (currently hardcoded)

3. **Supabase → Prisma Migration**:
   - Comment in `src/utils/supabase/client.ts:6`: "prisma link up later"
   - Gradual migration from Supabase client to Prisma for all database operations

## Critical Workflow Notes

### Working with Prisma Schema

**After modifying `prisma/schema.prisma`:**

```bash
# Option 1: Pull from Supabase (overwrite local schema)
npx dotenv -e .env.local -- prisma db pull

# Option 2: Push local changes to Supabase
npx dotenv -e .env.local -- prisma db push

# Always regenerate client after schema changes
npx dotenv -e .env.local -- prisma generate
```

**Important:** RLS (Row Level Security) is enabled on both models. Schema comments indicate this requires additional migration setup.

### Testing Gemini API Integration

Use the `/gemini` page for testing video analysis:
1. Uploads `src/assets/testVideo.mp4` to Gemini
2. Waits for `ACTIVE` file state
3. Sends analysis prompt
4. Returns structured JSON response
5. Cleans up uploaded file

**File state polling pattern** is implemented - always wait for `file.state === 'ACTIVE'` before sending prompts.

### Building Custom shadcn/ui Components

Configuration in `components.json`:

```bash
# Add new shadcn/ui component
npx shadcn@latest add [component-name]
```

Components are added to `src/components/ui/` and use:
- Tailwind CSS with `tailwind-merge` via `cn()` utility (`src/lib/utils.ts`)
- Class Variance Authority for component variants
- Radix UI primitives for accessibility
