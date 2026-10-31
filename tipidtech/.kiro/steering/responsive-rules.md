# Responsive Design Rules

These rules apply to every UI change in TipidTech without exception.

## TARGETS

- Design mobile-first, starting at 320 px. Test at 320, 360, 390, 768, 1024, and 1280 px wide.
- Test every screen at Normal, Large, and Extra Large text sizes. Extra Large at 320 px is the worst case — design for it.
- Breakpoints: base = phone, xs = 25rem (400 px), sm = 40rem (640 px), md = 48 rem (768 px), lg = 64rem (1024 px). The xs breakpoint is defined in the Tailwind @theme block as `--breakpoint-xs: 25rem`.

## HARD RULES

- No horizontal scrolling at any width. Never fix overflow with `overflow-x: hidden` on html or body. Find and fix the element that causes it.
- Every flex or grid child that holds text gets `min-w-0`. Long words and amounts use `break-words`.
- Never put a title, a description, and an action button in one horizontal row on mobile. Use the SectionHeader pattern: title and description stacked, action below on mobile, beside the title from sm up.
- Descriptions and helper text are `text-sm` and sit directly below the title, full width of their container.
- No fixed pixel widths on text containers. Use `w-full`, `max-w-*`, and rem.
- Padding: page `px-4 sm:px-6 lg:px-8`. Cards `p-4 sm:p-6`. Gaps `gap-3` or `gap-4` on mobile.
- Tap targets are at least 44×44 px. Buttons never get cut off or wrap their label awkwardly. Primary actions are full width on mobile.
- Option/radio groups are 1 column on phones and 2 columns from sm up. Never a rigid 2-column grid on narrow screens.
- Modals: bottom sheet on mobile (`max-h-[90dvh]`, scrollable body, sticky footer for the primary button, respect safe-area insets), centered dialog from sm up.
- Use `dvh` instead of `vh` for full-height layouts.
- Inputs stay at 16 px or larger.
- Use the shared layout components in `src/components/ui/` (PageContainer, Card, SectionHeader, OptionGroup, Modal, StatCard) instead of ad-hoc wrappers. If a screen needs a new layout pattern, add it to the shared components rather than inlining it.
- All new UI is built from the shared components in the ui folder (Card, SectionHeader, StatCard, OptionGroup, SegmentedControl, Modal, ExpenseRow). Don't create ad-hoc card wrappers, section headers, toggles, modals, or expense rows. If a new pattern is needed, add it to the shared components and tell me.
- Rows that show text and an amount: amount is shrink-0 and whitespace-nowrap on the right, text is min-w-0 flex-1 on the left. Date chips and pills never share a row with an amount on mobile.
- After layout work, check for overlap visually. The console overflow check only catches elements past the screen edge.
- Every feature prompt finishes with this check at 320px and 360px, at Normal and Extra Large text, on each screen it touched (open any modals first): [...document.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > document.documentElement.clientWidth).map(e => e.tagName + '.' + String(e.className).slice(0,80)). Expected: Array [].
- Text sizes: body 1rem, descriptions text-sm, nothing under 0.6875rem.

## CHECK BEFORE FINISHING ANY UI TASK

Open DevTools at 320 and 360 px, set text size to Extra Large, and confirm:
- No horizontal scrollbar
- Nothing cut off
- Nothing overlapping
