# DESIGN.md — TipidTech UI rules

The look today is **minimal, clean, mobile-first**: white cards on a light gray page, a mint-green brand accent, dark ink text, lucide icons (moving to Material Symbols in the redesign, §13). New features should feel like they were always there.

**A UI redesign is planned** from the Stitch references in `docs/design/stitch/` (see §13). Until its decisions are approved and recorded in §13, the rules below still describe the app. Once the redesign lands, the **Light (default) theme is the redesigned look**, and the other themes (§9) build on it. (This replaces "default looks identical to today" in handoff 2.3.)

## 1. Tokens

### Current (in `tipidtech/src/index.css` → `@theme`)

| Token | Value | Tailwind class | Used for |
|---|---|---|---|
| `--color-brand` | `#80ed99` | `bg-brand`, `border-brand` | primary buttons, active nav, selected options |
| `--color-brand-dark` | `#57cc99` | `bg-brand-dark` | hover/pressed on brand |
| `--color-page` | `#f9fafb` | `bg-page` | page background, segmented control track |
| `--color-ink` | `#111827` | `text-ink` | main text, text on brand |
| `--color-muted` | `#6b7280` | `text-muted` | secondary text, descriptions |
| `--breakpoint-xs` | `25rem` (400px) | `xs:` | between phone and `sm:` |

Also used directly: `bg-white` (cards), `border-gray-200` / `border-gray-100` (borders, dividers), `bg-gray-50` (hover), `text-red-600` / `bg-red-50` / `border-red-200` (errors, destructive).

### Semantic tokens (introduced in handoff 2.3 step 1)

Theming works by swapping CSS variables, so screens must stop hard-coding `bg-white`, `border-gray-200`, etc. Step 1 adds these tokens with **default values equal to today's colors**, then replaces classes across every screen. Mapping:

| Today | Becomes | Default value |
|---|---|---|
| `bg-page` | `bg-page` (now themeable) | `#f9fafb` |
| `bg-white` (cards, inputs, sheets) | `bg-surface` | `#ffffff` |
| `bg-gray-50` / `bg-gray-100` | `bg-surface-muted` | `#f9fafb` / `#f3f4f6` |
| `border-gray-200` | `border-line` | `#e5e7eb` |
| `border-gray-100` | `border-line-soft` | `#f3f4f6` |
| `text-ink` | `text-ink` | `#111827` |
| `text-muted` | `text-muted` | `#6b7280` |
| `bg-brand`, `border-brand` | `bg-accent`, `border-accent` | `#80ed99` |
| `bg-brand-dark` | `bg-accent-strong` | `#57cc99` |
| `text-ink` on brand | `text-on-accent` | `#111827` |
| focus ring `ring-brand/15` | `ring-accent/15` | — |

Implementation pattern: declare the tokens in `@theme` pointing at CSS variables, set default values on `:root`, override per theme on `html[data-theme="<key>"]`. Keep `--color-brand` as an alias of `--color-accent` until every usage is migrated, so nothing breaks mid-way.

**Before 2.3 lands:** new code may use today's classes, but prefer the current named tokens (`bg-page`, `text-ink`, `text-muted`, `bg-brand`) over raw grays where one exists. Don't add new hex values in JSX.

## 2. Typography

- Root font size is fluid and multiplied by the user's text size (`index.css`): `calc(clamp(1rem, 0.95rem + 0.15vw, 1.0625rem) * var(--text-scale))`. Scales: Normal ×1, Large ×1.125, XL ×1.25.
- **Use rem-based Tailwind classes only** (`text-xs` … `text-2xl`, rem padding/gap). No `px` font sizes, no `text-[13px]`. Everything then scales with the setting for free.
- Inputs/selects/textareas are forced to `max(1rem, 16px)` so iOS doesn't zoom. Don't override that.
- Hierarchy in use: page title `text-2xl font-bold text-ink` · section/card heading `text-sm font-semibold` · body `text-sm` · helper/meta `text-xs text-muted` · stat label `text-xs uppercase`.
- Chart labels (recharts) take px numbers. Derive them from the root size (e.g. read `getComputedStyle(document.documentElement).fontSize`) so they scale too. Check them at XL.
- Approved for the redesign: **Plus Jakarta Sans** (UI font) and **Material Symbols Outlined** (icons), §13. Any other new web font needs asking (§5 in AGENTS.md). A theme font must be checked for license, weight, and small-size readability.

## 3. Status system (fixed, never themed)

| Status | Key | Icon (lucide) | Word | Color |
|---|---|---|---|---|
| Green | `STATUS.GREEN` | `CheckCircle2` | **On track** | `text-green-600`, `border-green-200` |
| Yellow | `STATUS.YELLOW` | `AlertTriangle` | **Careful** | `text-amber-600` (`#d97706`), `border-amber-200` |
| Red | `STATUS.RED` | `XCircle` | **At risk** | `text-red-600`, `border-red-200` |
| Ended | `STATUS.ENDED` | `CalendarDays` | **Period ended** | `text-muted` |

Rules:
- Always show **icon + word + color** together. Never color alone. (`StatusBadge.jsx` currently shows icon + heading sentence; when touching it, add the short word as a label.)
- Status colors, warnings, and errors **do not change between themes**. Define them as their own tokens (`--color-status-ok`, `--color-status-warn`, `--color-status-risk`) outside the theme overrides.
- Never use status green/amber/red decoratively, as a category color, as a chart series color, or as a theme accent.
- The **brand mint** is not "status green". Don't use the brand color to mean "good".
- Red-status copy is kind and supportive, never scolding ("Kaya pa 'yan, bantayan lang natin", not "You're overspending").

## 4. Categories and charts

- Categories, labels, and emojis come from `CATEGORIES` / `EXPENSE_CATEGORIES` in `constants.js`. Category icons via `CategoryIcon.jsx`. Don't redefine them.
- **Known issue:** `ExpensePieChart.jsx` `CATEGORY_COLORS` uses greens and a red-orange that look like status colors. When doing 2.3 or 2.4, move category colors to one shared map (e.g. `CATEGORY_COLORS` in `constants.js`) and pick hues that avoid status green/amber/red (blues, purples, teals, pinks, slate). Ask before changing how the pie looks.
- Every chart must be readable **without color**: text labels on bars/slices or a list beside it, plus a text alternative (the History day strip is the text alternative for the bar chart).
- Charts use **recharts** (already installed). Simple horizontal bars (History "By category") can be plain HTML/CSS divs.
- Bars/lines use the **theme accent**, not status colors. Y-axis starts at 0 with round ticks; short labels on small screens (`1.2k`). Positive peso amounts only. Zero days show as zero, future days show nothing.
- Money is always formatted with `formatPeso()` from `calculations.js`.

## 5. Layout and spacing

- **Mobile first.** Design at 320px, then widen. Breakpoints: base (phone) → `xs` 400px → `sm` 640px → `md` → `lg`.
- Shell (`AppLayout.jsx`): desktop has a fixed 240px left sidebar; mobile has a hamburger → overlay drawer. Both share `SidebarContent` (nav + text size control + logout). New global controls (Appearance, How it works, Learn, About, bell) go there too, in both places.
- Wrap every screen in `PageContainer`.
- Never put title + description + action in one row on mobile. Use `SectionHeader`.
- Tap targets ≥ 44px (`min-h-[2.75rem]` / `min-h-11`).
- Add `min-w-0` on flex/grid children that hold text, so long peso amounts or names wrap instead of overflowing.
- Rounded corners: cards and sheets `rounded-2xl`, buttons and inputs `rounded-lg`, nav items `rounded-xl`, pills `rounded-full`.
- Shadows: `shadow-sm` on cards only.

## 6. Shared components — use these, don't re-roll

| Component | Use for |
|---|---|
| `ui/PageContainer` | every page wrapper (padding + max width) |
| `ui/SectionHeader` | page/section title + description + optional action; `as="h1"` for page titles. **1.4 feature-label subtitles go in its `description`.** |
| `ui/Card` | any card surface (`variant="flush"` for lists with own padding) |
| `ui/StatCard` | metric: label, value, helper, icon |
| `ui/Modal` | every dialog. Bottom sheet on mobile, centered on `sm+`; Escape/backdrop close; scroll lock |
| `ui/SegmentedControl` | 2–4 way toggles (Week/Month, Read/Practice tabs). Full-width on mobile, arrow keys work |
| `ui/OptionGroup` | radio tiles (period type, theme picker can follow its pattern) |
| `ExpenseRow` | any single expense line |
| `StatusBadge` | the status card |

If a new pattern is needed in 2+ places, make it a `ui/` component and document its props in a header comment like the existing ones.

## 7. Buttons and form patterns (copy these exactly)

- **Primary:** `w-full cursor-pointer rounded-lg bg-brand px-5 py-3 font-semibold text-ink transition-colors duration-150 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-45`
- **Secondary:** same shape, `border border-gray-200 bg-white text-ink hover:bg-gray-50`
- **Destructive:** same shape, `border border-red-200 bg-white text-red-600 hover:bg-red-50`
- **Input:** `w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-base text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15`
- **Error box:** `rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600`
- **Inline error:** `text-sm text-red-600`
- Full-width buttons on mobile; `sm:w-auto` where a full-width button looks odd on desktop.

(After 2.3, swap `bg-white`→`bg-surface`, `border-gray-200`→`border-line`, `bg-brand`→`bg-accent`, etc.)

## 8. Pop-ups, notifications, reminders

- **Bell (2.1):** top bar + mobile menu. Unread state shows a dot **and** a count/label, e.g. `aria-label="Notifications, 2 new"`. Opening marks read. Max 1–2 new messages per local day, ≥3 variants per situation, never the same one twice in a row. Original copy only. Messages carry an emoticon.
- **Reminder card (2.2):** small card, title + message + icon + up to two buttons ("On it!" / "Already did!"). Uses theme palette. Dismissible, non-blocking (no backdrop, no focus trap), one at a time, never on Add Expense, hidden for the rest of the day after "Already did!".
- The **overspend warning stays inside Add Expense** and never moves to the bell.
- Both work only while the app is open. They are not phone notifications.

## 9. Themes (2.3)

Gallery at **Menu → Appearance**: grid of small preview cards, tap to apply instantly, "Reset to default" always visible. Saved under `tipidtech-theme` in localStorage, applied via `data-theme` on `<html>` by a pre-paint script in `index.html` (same pattern as text size), so there's no flash.

| Key | Name | Direction |
|---|---|---|
| `light` | Light | Today's look, exactly. Default. |
| `dark` | Dark | Dark gray surfaces, light text, mint accent toned for dark backgrounds |
| `pink-pop` | Pink Pop | Pinks and soft blush, white cards, hearts/stars/sparkles icons, very rounded corners. Dark text on light pink; white text only on deep pink. |
| `hero-comic` | Hero Comic | Bold navy, thick comic borders, dotted halftone background (CSS only), lightning/star icons, punchy headings. Its red and gold must look clearly different from status red/amber. |
| `glow-forest` | Glow Forest | Deep teal and blue-green with purple highlights, soft glow accents, leaf/spark icons, calm dark look |

Rules:
- Original names only, never franchise names or look-alike logos/characters/fonts.
- Gradients and patterns are plain CSS, behind content. Text always sits on solid cards.
- No animated themes.
- Status colors, warnings, errors unchanged in every theme (§3).
- **Contrast ≥ 4.5:1** for normal text in every theme, at all three text sizes, on a 320px phone. Check `text-muted` on `bg-surface` and `text-on-accent` on `bg-accent` especially.
- Decorative theme icons are `aria-hidden` and never replace a meaningful icon.

## 10. QA checklist (run before saying done)

- [ ] `npm run build` passes
- [ ] Widths **320, 360, 390** and a tablet (768): nothing cut off, overlapping, or scrolling sideways
- [ ] Text size **Normal, Large, XL** on each of those widths (XL at 320 is the hardest case)
- [ ] Every theme that exists at that point (after 2.3)
- [ ] Tapping an input on iPhone doesn't zoom the page
- [ ] Keyboard: everything reachable with Tab, visible focus, Escape closes modals
- [ ] Status shows icon + word + color; nothing relies on color alone
- [ ] No pop-up appears on Add Expense; saving an expense is never blocked
- [ ] Preferences survive refresh and logout; no flash of default look on load
- [ ] Real phone check flagged for the user (Vercel preview) when layout changed

## 11. Copy and tone

- Casual, friendly, short. English with natural Taglish where it fits the moment (encouragement messages), never forced.
- Plain words over finance jargon. "Allowance", "spent", "left", "per day".
- Anywhere showing status meaning, thresholds, suggested percentages, or learning content: include a short note that it's **general guidance, not professional financial advice**.
- No fake claims ("proven", "bank-level security").

## 12. Landing page (public)

- Purpose: explain TipidTech to a first-time visitor on a phone, then get them to Get started or Log in.
- Same brand as the app: mint accent, ink text, logo. It may be more spacious and expressive than app screens, but logging in must not feel like a different product.
- Hero: one-line value statement, short subline, Get started + Log in buttons visible without scrolling at 320–390px.
- Show the real product: small previews built from existing components with clearly example data. No stock photos, no AI-generated people, no franchise imagery.
- Status shown on the landing page follows §3 (icon + word + color, labelled as prototype guides).
- Motion: subtle CSS only (fades, small translate), max ~300ms, disabled under prefers-reduced-motion. No scroll-jacking, parallax, or animation libraries.
- Logged-in users visiting / go straight to /dashboard.

## 13. Stitch redesign references

**Current scope: desktop references only** (`docs/design/stitch/desktop/`). The `*-mobile` folders are for a later pass. Until then, phone widths just stack the desktop layout into one column and must still pass §10 at 320–390px.

Files: `docs/design/stitch/<screen>/` (`code.html`, `screen.png`, Stitch's own `DESIGN.md`), user notes in `docs/design/stitch/notes.md`. Every Stitch `DESIGN.md` is the same "Warm Student Mint" system.

**How to use them**
- Take **layout, hierarchy, spacing, card structure, and component shapes** from them. Where `notes.md` says "copy everything", that means the full layout and every visual element, still subject to the filters below.
- Never paste Stitch HTML into the app. Rebuild with `ui/` primitives, Tailwind classes and `@theme` tokens. New shared patterns become `ui/` components (§6).
- This file wins over Stitch's `DESIGN.md`. Its token values are proposals until approved and copied into §1.
- Stitch renders are mock-ups: overlapping text, serif fallback fonts and wrapped labels in the screenshots are render bugs, not intent.

**Filter every reference through these before building**
1. **Data fidelity (AGENTS.md §6a):** every field, number and action must exist in the DB or existing logic. Mock names ("Juan D."), counts ("Baon Period 1"), projections, and features that don't exist are flagged, not built.
2. **Honesty (AGENTS.md §7.11–12):** drop or rewrite claims that aren't true: "encrypted on your device", "offline-ready / offline cache / auto-synced", ".edu.ph verified", "compliant with RA 10173", "Security Center", invented money rules and savings figures.
3. **Category labels** come from `CATEGORIES` (`constants.js`), all 6 + Other. No renamed categories ("Food & Dining", "Buffer & Meds"), and never label the Savings category as a Savings Goal (§7.3).
4. **Status** stays icon + word + color with the words in §3 ("On track", "Careful", "At risk", "Period ended"). No "DANGER", "Budget depleted", or scolding copy.
5. **Add Expense stays 3 fields and one tap to save** (§7.2). Visual extras (quick-add chips, category tiles) are fine; extra steps or confirmations are not. Opening it as a sheet/dialog over the Dashboard is fine.
6. **Fonts and icons:** Stitch uses Plus Jakarta Sans and Material Symbols. Both are new dependencies (AGENTS.md §5). Map icons to lucide unless approved otherwise.

**Decisions (user, 2026-11-14).** Numbers match the assessment flags; AGENTS.md §9 has the full list.
- **Font:** Plus Jakarta Sans (approved dependency). Load from Google Fonts in `index.html` with only the weights used (400–800). Keep rem sizes so text size scaling still works (§2).
- **Icons:** Material Symbols Outlined (approved dependency). Load from Google Fonts with `&icon_names=` listing only the icons used, so the file stays small. Wrap it in one small icon component; decorative icons `aria-hidden`. Status icons: `check_circle` (On track), `warning` (Careful), `cancel` (At risk), `calendar_today` (Period ended). Don't uninstall `lucide-react` without asking; remove it only after nothing imports it.
- **Category colors:** Stitch palette (§13 refs) except **Emergency**, which gets a new hue that isn't red, amber, or green (pick one, check 4.5:1, flag the value). One shared `CATEGORY_COLORS` map in `constants.js`, also used by the pie chart.
- **Status amber:** `#d97706` (amber-600) replaces amber-500. Status pills follow Stitch's schema (icon + word, tinted background) with the §3 words.
- **Category labels:** always `CATEGORIES` labels; the budget's Savings category is labeled "Savings".
- **Amounts:** transaction lists may show spending as `−₱189.00` (outflow). Totals, remaining, charts, and inputs stay positive.
- **Shown now, wired later** (user-approved exception to AGENTS.md §6a): theme switcher in the sidebar, notification bell, "Forgot password?" link on login, budget-split "adjust/add money" UI. Mark each in code with `TODO(later): <what it needs>` and list them in AGENTS.md §9. They must not pretend to do something: no fake success messages or fake data.
