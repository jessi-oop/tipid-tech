---
name: Warm Student Mint
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#3e4a3f'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#6e7a6e'
  outline-variant: '#bdcabb'
  surface-tint: '#006d32'
  primary: '#006d32'
  on-primary: '#ffffff'
  primary-container: '#80ed99'
  on-primary-container: '#006c31'
  inverse-primary: '#70dc8a'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#82f6bf'
  on-secondary-container: '#00714d'
  tertiary: '#00696b'
  on-tertiary: '#ffffff'
  tertiary-container: '#82e6e8'
  on-tertiary-container: '#006769'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#8cf9a4'
  primary-fixed-dim: '#70dc8a'
  on-primary-fixed: '#00210b'
  on-primary-fixed-variant: '#005224'
  secondary-fixed: '#85f8c2'
  secondary-fixed-dim: '#67dca7'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#8ff3f4'
  tertiary-fixed-dim: '#72d6d8'
  on-tertiary-fixed: '#002020'
  on-tertiary-fixed-variant: '#004f51'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  currency-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  currency-display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 34px
    letterSpacing: -0.02em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system crafts an inviting, non-judgmental financial environment tailored directly to the everyday realities of Filipino college students. Moving away from the intimidating, cold, and ledger-heavy aesthetic of legacy corporate banking, this system establishes a supportive financial companion. It balances playful optimism with strict functional clarity to reduce financial anxiety.

The visual style blends soft modernism with card-based modularity. Generous whitespace, rounded surfaces, and clear visual hierarchies ensure budgeting tasks (tracking *baon*, project allowances, group meals, and jeepney commutes) feel frictionless, legible, and encouraging. The emotional tone is supportive, clear, and reassuring—never punitive when budgets tighten.

## Colors

The palette revolves around a vibrant, life-affirming mint green accented by grounded dark ink typography and carefully segregated functional colors.

### Core Swatches
- **Primary Accent (`#80ed99`)**: Used exclusively for primary interactive affordances, key focal call-to-actions, and active navigation indicators.
- **Primary Hover/Pressed (`#57cc99`)**: Darker mint for interactive hover, active states, and focus rings.
- **Deep Accent (`#38a3a5`)**: Anchoring teal for subtle progress bars and supplementary visual accents.
- **Text Primary (`#111827`)**: Deep ink for high-contrast, effortless readability across all lighting conditions.
- **Text Muted (`#6b7280`)**: Secondary metadata, timestamps, and placeholder labels.
- **Canvas (`#f9fafb`)**: Soft off-white wash creating comfortable contrast against pure white cards (`#ffffff`).

### Strict Status Indicators
Status colors communicate operational states only and are strictly forbidden from being used for generic decoration or expense categories:
- **On Track**: `#16a34a` (with `check-circle`)
- **Careful**: `#f59e0b` (with `alert-triangle`)
- **At Risk**: `#dc2626` (with `x-circle`)
- **Period Ended**: `#9ca3af` (with `calendar`)

### Dedicated Category Palette
Expense tags use dedicated pastel-backed tint palettes to maintain complete visual distinction from operational statuses:
- **Food & Rice (🍚)**: Deep Blue (`#2563eb`) on `#dbeafe`
- **Transportation & Commute (🚌)**: Rich Indigo (`#4f46e5`) on `#e0e7ff`
- **School & Books (📚)**: Bright Purple (`#7c3aed`) on `#ede9fe`
- **Personal Care (🧴)**: Vivid Pink (`#db2777`) on `#fce7f3`
- **Savings (💰)**: Emerald Teal (`#0d9488`) on `#ccfbf1`
- **Emergency / Medical (🏥)**: Rose Slate (`#e11d48`) on `#ffe4e6`
- **Other / Miscellany (📌)**: Neutral Slate (`#475569`) on `#f1f5f9`

## Typography

Plus Jakarta Sans powers the entire typographic hierarchy, chosen for its friendly geometric curves, high x-height, and exceptional legibility on small handheld screens.

### Numerical Formats & Currency
- The Philippine Peso symbol (`₱`) must always match the font family and weight of its associated numeric string.
- Financial balance headers leverage `currency-display` with tabular numerical figures to prevent layout shifts when counters update.
- Always include a space or clear tracking between `₱` and digits in conversational text (e.g., `₱ 150.00`), while card totals can keep standard tracking (`₱150.00`).

## Layout & Spacing

The layout is built mobile-first, targeting single-handed phone usage during fast transit or food stall checkouts. 

### Touch Ergonomics
- All interactive elements adhere to an uncompromising minimum hit boundary of 44×44px.
- Key navigation buttons and fast-log floating triggers sit in the lower third of the display viewport (the natural thumb arc).

### Responsive Breakpoints
- **Mobile (< 640px)**: 4-column fluid layout with `1rem` outer margins and `1rem` gutters. Primary action bars pin to the bottom of the screen.
- **Tablet (640px – 1024px)**: 8-column layout with `2rem` outer margins. Bottom sheets transform into centered modal dialogs.
- **Desktop (> 1024px)**: 12-column layout maxing out at `1200px` content width with `3rem` margins. Navigation moves to an anchored left-side rail.

## Elevation & Depth

Visual hierarchy relies on clean surface layering rather than heavy, drop-shadow treatments. The goal is an airy, crisp paper-card feel.

### Surface Tiers
- **Tier 0 (Base Canvas)**: Flat `#f9fafb` background.
- **Tier 1 (Surface Containers & Cards)**: Pure `#ffffff` surfaces bordered by an ultra-subtle perimeter border (`1px solid rgba(17, 24, 39, 0.05)`).
- **Tier 2 (Floating Action & Overlays)**: Pure `#ffffff` cards supported by an ambient low-opacity shadow tinted with dark neutral: `0 8px 24px -4px rgba(17, 24, 39, 0.06), 0 4px 8px -2px rgba(17, 24, 39, 0.04)`.
- **Tier 3 (Modals & Sheets)**: Full dark overlay (`rgba(17, 24, 39, 0.4)`) with backdrop blur of `4px` to focus user attention strictly on quick financial inputs.

## Shapes

The interface embraces approachable curvature. Cards and containers adopt a distinct `rounded-2xl` (1rem to 1.5rem) shape to create a non-institutional, welcoming appearance.

- **Primary Cards & Containers**: `1rem` (`16px`) to `1.5rem` (`24px`).
- **Input Fields & Buttons**: `0.75rem` (`12px`) for comfortable hand-held feel without collapsing into full pills.
- **Badges & Meta Chips**: Fully rounded pill shapes (`9999px`) to distinguish them from actionable containers.
- **Icon Enclosures**: Soft rounded squares (`12px` border radius) housing line icons centered within 40×40px or 48×48px boundary boxes.

## Components

### Buttons
- **Primary**: Solid mint background (`#80ed99`), bold dark ink text (`#111827`), min-height 48px, rounded `12px`. Hover/active shifts to `#57cc99`.
- **Secondary**: Pure white card style with a `1px solid rgba(17, 24, 39, 0.1)` border and `#111827` text.
- **Ghost/Tertiary**: Transparent background, text colored with `#6b7280`, active highlight using `rgba(128, 237, 153, 0.15)`.

### Cards
- **Budget & Metric Cards**: White background, `rounded-2xl` (16px), 16px to 20px internal padding. Subtly outlined with a 1px border (`#f3f4f6`).
- **Progress Trackers**: Integrated horizontal track in `#e5e7eb` (height 8px, pill-curved) with progress filled using category colors or status indicators.

### Status Badges (Strict Schema)
Always rendered as a pill chip featuring a 16px Lucide-style line icon, a short text label, and explicit tone pairing:
- **On track**: `check-circle` icon + "On Track" text; `#16a34a` foreground on `#dcfce7` background.
- **Careful**: `alert-triangle` icon + "Careful" text; `#d97706` foreground on `#fef3c7` background.
- **At risk**: `x-circle` icon + "At Risk" text; `#dc2626` foreground on `#fee2e2` background.
- **Period ended**: `calendar` icon + "Period Ended" text; `#4b5563` foreground on `#f3f4f6` background.

### Category Tags
Category badges combine an emoji/icon prefix with high-contrast text. Never use red or amber as base fills to avoid confusion with the status system.
- Pill badges (`height: 28px`, `padding: 0 10px`, `rounded-full`, `font-size: 13px`).

### Form Inputs
- **Currency Field**: Prominent text input with fixed leading `₱` marker. Height 56px, `font-size: 24px`, bold font weight.
- **Standard Inputs**: Bordered with `1.5px solid #e5e7eb`, focusing cleanly into a `#57cc99` stroke with a `3px` diffuse mint glow (`rgba(128, 237, 153, 0.35)`). Placeholder set in `#9ca3af`.

### Quick-Log Floating Action Button (FAB)
- Fixed at the bottom-right or center-bottom mobile thumb dock.
- 56×56px circle or squircle filled with `#80ed99`, sporting a bold plus (`+`) line icon in `#111827`, elevated with Tier 2 ambient shadow.