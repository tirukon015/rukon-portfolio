<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Working on this portfolio

The current code plus `docs/` is the source of truth. Do **not** run a full-site
audit for ordinary changes.

## Before a change
1. Read the relevant docs: `docs/PROJECT_SPEC.md` (behaviour and constraints),
   `docs/COMPONENT_MAP.md` (where things live), `docs/DESIGN_SYSTEM.md` (tokens,
   primitives), `docs/ARCHITECTURE.md` (structure, server/client rules).
2. Decide: which files and components are affected, what existing behaviour
   could be impacted, whether a new reusable component is really needed (prefer
   extending `src/components/ui/*`), and whether the change alters the design
   system or the architecture.
3. Inspect only the affected code and its direct dependencies.

## While changing
- Preserve the design system: existing tokens, type scale, spacing, radii,
  buttons, motion. No second design system and no parallel components.
- Don't rewrite or redesign unrelated sections.
- Content rules: no invented metrics or features; status states must be honest
  (`implemented` = live); screenshots are of the real app; confidential work
  uses synthetic data only.
- Next.js 16: check `node_modules/next/dist/docs/` for any API you use.

## After a change: the smallest sufficient check
- Small UI change: `npx tsc --noEmit`, `npm run lint`, visual check of the
  affected page (desktop + mobile, dark + light).
- Functional change: the above, plus exercising the feature (API responses, states).
- Major change (routing, layout, shared components, dependencies):
  `npm run build` plus a broader visual pass.

## Always
- Update `docs/` when a feature, component, route, integration, architecture or
  design-system rule changes (FEATURES and COMPONENT_MAP most often).
- Add a dated entry to `docs/CHANGELOG.md`.

A full audit is only warranted when explicitly requested, for a global design or
architecture change, a framework migration, a redesign of several unrelated
sections, or when the docs are found to be seriously out of date.
