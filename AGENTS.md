# Repository Guidelines

## Project Structure & Module Organization
- `src/app` contains Next.js routes, layouts, and server actions; scope page-specific state inside this tree.
- `src/components` hosts reusable UI primitives and feature composites, with shared prop schemas in `src/lib`.
- `src/lib` centralizes data services (e.g., Supabase, LangChain) and pure helpers; `src/utils` keeps client-side utilities.
- `llm/` stores workflow graphs, prompt templates, and integration scripts—update its README whenever interfaces change.
- Build outputs live in `.next/` and `dist/`; never commit them.

## Build, Test, and Development Commands
- `pnpm install` — install dependencies with the pinned pnpm version.
- `vercel dev` — run the local dev server with Vercel parity (preferred over `pnpm dev`).
- `pnpm build` — produce a production bundle with Turbopack; set required env vars first.
- `pnpm start` — serve the compiled build for smoke tests.
- `pnpm lint` — run ESLint + Prettier formatting fixes.

## Coding Style & Naming Conventions
- TypeScript everywhere; `.tsx` for React components, `.ts` for pure logic.
- Follow ESLint + Prettier output (no manual formatting); run `pnpm lint` before commits.
- Components/classes use PascalCase, hooks use `useCamelCase`, utilities stay camelCase, file names prefer kebab-case.
- Co-locate helpers with their feature unless they are broadly reusable.

## Testing Guidelines
- Automated harness not yet configured; document manual QA steps in PRs.
- When adding tests, colocate as `<module>.test.ts[x]` using the shared TS config.
- Always run `pnpm lint` and verify critical flows via `vercel dev` before review.

## Commit & Pull Request Guidelines
- Use short imperative subjects, optionally with type prefixes (e.g., `Feat: switch to LangGraph`).
- Reference related issues in the body and call out Supabase schema or config changes explicitly.
- Attach screenshots or short videos for UI changes and list manual test commands executed.
- Keep `.env.local` synced with Vercel secrets and never commit it; document any new env vars in the PR description.
