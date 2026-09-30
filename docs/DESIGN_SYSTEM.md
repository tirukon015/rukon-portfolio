# Design system

The established visual language. New work must use these tokens and
primitives, not new values. Source of truth: `src/app/globals.css` (tokens) and
`src/components/ui/*` (primitives).

## 1. Principles

- **Dark first.** Dark is the foundation theme (`:root`); light is opted into
  with `:root[data-theme="light"]`. Design and check both.
- **Editorial, not template.** Lists and rows over grids of identical cards;
  hierarchy through type and spacing rather than decoration.
- **Evidence as visuals.** Real screenshots and diagrams, never stock
  illustration or mock UI.
- **One accent.** A single blue accent; everything else is neutral.

## 2. Colour tokens

Use the Tailwind utilities (`bg-bg`, `text-text-muted`, `border-border-strong`,
`bg-accent`, …), which map to these variables through `@theme inline`.

| Token | Dark | Light | Use |
| --- | --- | --- | --- |
| `bg` | `#05070a` | `#f6f7f9` | page background |
| `bg-elevated` | `#0b0f14` | `#ffffff` | cards, panels, figures |
| `bg-elevated-2` | `#10151c` | `#eef1f4` | nested surfaces |
| `border` | `rgba(233,240,244,.09)` | `rgba(16,22,28,.09)` | default borders (applied to `*`) |
| `border-strong` | `rgba(233,240,244,.16)` | `rgba(16,22,28,.18)` | chips, hover, emphasis |
| `text` | `#edf1f4` | `#10161c` | headings, primary text |
| `text-muted` | `#99a3ad` | `#4b5661` | body copy |
| `text-faint` | `#626b74` | `#7c8790` | captions, meta, eyebrows |
| `accent` | `#4fb2e0` | `#1c85b8` | links, eyebrows, focus, primary button |
| `accent-strong` | `#7ecbee` | `#12658c` | hover states |
| `accent-soft` | `rgba(79,178,224,.12)` | `rgba(28,133,184,.10)` | glows, selection, tinted backgrounds |
| `accent-contrast` | `#04121a` | `#ffffff` | text on accent |

Special palettes (scoped, do not reuse elsewhere): heatmap `--heat-0…4`
(greens), and the grid `--grid-line-rgb` / `--grid-glow-rgb` for the hero cursor grid.

Shadows: `shadow-[var(--shadow-card)]` for cards and figures,
`var(--shadow-lift)` for raised hover. Selection uses accent-soft/accent-strong.

## 3. Typography

- **Fonts:** Geist (`font-sans`) and Geist Mono (`font-mono`) via
  `next/font/google` in `src/app/layout.tsx`. No other families.
- **Display sizes** (fluid tokens):
  - `text-display`: `clamp(2.5rem, 1.3rem + 3.6vw, 4rem)`, line-height 1.02, tracking −0.03em (hero h1)
  - `text-display-sm`: `clamp(2rem, 1.2rem + 3vw, 3.5rem)`, line-height 1.06, tracking −0.025em (section h2, flagship name)
- **Scale in use:**
  - section h2 `text-3xl sm:text-4xl font-semibold tracking-tight`
  - case-study h2 `text-2xl sm:text-3xl font-bold`
  - body `text-base sm:text-lg leading-relaxed text-text-muted`
  - small body `text-sm`
- **Eyebrow / meta pattern:** `font-mono text-xs uppercase tracking-[0.18em] text-accent`
  for section eyebrows; `font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint`
  for meta labels (Role, Built with, dates). Captions use
  `font-mono text-xs leading-relaxed text-text-faint`.
- **Weights:** 400 body, 500 buttons and links, 600 headings, 700 case-study
  headings and h1 on project pages.

## 4. Layout and spacing

- **Container** (`components/ui/container.tsx`): `mx-auto w-full px-6 md:px-8`,
  default `max-w-6xl` (1152 px). Passing any `max-w-*` in `className`
  replaces the default. Long-form reading columns use `max-w-3xl` (768 px).
- **Section rhythm:** `py-20 sm:py-24 lg:py-28` (homepage sections; Selected Work
  goes to `lg:py-32`), separated by `border-b border-border`.
- **Grid:** 12 columns from `lg`; common splits 6/6, 4/8, 3/6/3.
- **Breakpoints:** Tailwind defaults: `sm` 640, `md` 768, `lg` 1024, `xl` 1280.
  Navigation collapses below `md`; the hero goes two-column at `lg`.

## 5. Shape

| Element | Radius |
| --- | --- |
| Buttons, chips (`Tag`), pills | `rounded-full` |
| Homepage panels and figures | `rounded-lg` |
| Project cards, case-study figures, callouts | `rounded-2xl` |
| CTA banners | `rounded-3xl` |
| Small badges | `rounded-md` / `rounded-lg` |

## 6. Components (use these, don't restyle ad hoc)

- **Buttons** (`ui/button.tsx`): `Button` / `ButtonLink`, variants `primary`
  (accent fill), `secondary` (strong border, accent on hover), `ghost` (muted
  text). Base: `rounded-full px-6 py-3 text-sm font-medium`. External links
  pass `external`.
- **Text links:** `text-sm text-text-muted hover:text-text` or `font-medium
  text-text hover:text-accent-strong`, with a lucide `ArrowRight` (internal) or
  `ArrowUpRight` (external) at 13–15 px.
- **Tag** (`ui/tag.tsx`): mono xs chip for technologies.
- **SectionHeading** (`ui/section-heading.tsx`): eyebrow + h2 + optional description.
- **Cards:** `rounded-2xl border border-border bg-bg-elevated shadow-[var(--shadow-card)]`,
  `hover:border-border-strong`.
- **Status pills** (case study): `rounded-full border font-mono text-[11px] uppercase`,
  accent for Implemented, muted for "Built, not live", faint for "Not connected".
- **Figures:** image inside `rounded-2xl border bg-bg-elevated shadow-card`,
  caption in mono xs faint below. Screenshots link to the full-size image.

## 7. Icons

`lucide-react` only, stroke style, 11–18 px, inheriting text colour. Custom
brand icons live in `components/icons.tsx`. No emoji in UI.

## 8. Imagery

- Project screenshots: 1440 × 900 PNG captures of the real app, stored under
  `public/images/<slug>/`, kebab-case names. Diagrams: SVG sources rendered to
  PNG at about 1.5×, light background, legend current / planned / external.
- Social images: 1200 × 630 (`shareImage`).
- Marks: `image.src` + optional `srcDark`; opaque logos swap with the
  `.theme-light-only` / `.theme-dark-only` classes (CSS, first-paint safe).
- Always `next/image` with width/height and a `sizes` hint; alt text describes
  what a sighted reader would learn, and captions say what is shown.

## 9. Motion

- Easing: `var(--ease-out)` = `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Reveal on scroll** (`ui/reveal.tsx`): fade + 14 px rise over 0.7 s,
  triggered once by IntersectionObserver; stagger with `delayMs` (≤120 ms).
- Hover: colour transitions (~200 ms); image scale ≤ 1.015 over 500 ms.
- Hero: cursor grid and portrait spotlight (rAF-driven, no React state per move;
  rests at a soft glimpse, full reveal near the pointer, tap toggle on touch).
- **`prefers-reduced-motion`** disables all of it globally (`globals.css`).
  Any new animation must respect it.

## 10. Accessibility baseline

`:focus-visible` outline 2 px accent with 3 px offset; semantic landmarks and
headings; `aria-label` on icon-only controls; decorative images `alt=""` +
`aria-hidden`; colour pairs above are chosen for contrast in both themes.
