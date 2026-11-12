# TipidTech Prototype: Revision Handoff

> Converted from the team's `TipidTech Prototype Revision Handoff.odt` (Nov 2026). Content unchanged except formatting.
> **Status update (2026-11-12):** the team approved every item. 1.3, 1.4, 1.5 and 3.1 moved from Proposed to Confirmed.
> **Section 6 (Open decisions) is referenced below but was missing from the source doc.** Ask the user before deciding anything that points to it.

## 1. Read this first

- This document lists the changes the team agreed to (or proposes) for the TipidTech prototype, in build order, with what each should do and how to tell it is finished.
- It was written from the project context document (PROJECT_CONTEXT.md) and the team's discussion, not from the code. Check the repo before building each item: don't assume something is missing just because it isn't listed. File names below (App.jsx, storage.js, calculations.js, constants.js) are the likely places, so confirm them.
- Each item is marked **Confirmed** (the team decided it). As of 2026-11-12 every item is Confirmed; there are no Proposed items left.
- Open decisions are listed in Section 6, each with a recommended default. Use a default only if the team has not answered.
- **Flag, don't slip in:** any new table, column, route, or dependency must be raised for review before it goes in.

## 2. What participants asked for

- Bigger or adjustable font: P06 to P09, P11, P12
- Instructions for first-time users: P06 to P10
- Motivation (emoticons, quotes): P06 to P09
- Less boring design (icons, avatar, custom theme): P11, P12
- More visual graphs: P11, P12
- Clearer distinction between features: P11, P12 (exact meaning not yet confirmed)
- Phone notifications: P11, P12
- Credibility shown on the interface: P12

## 3. Rules that apply to every change

Project rules:
- Warn, never block. A warning can say an expense will push the user to Yellow, but the user can still save it.
- The budget's Savings category and Savings Goals are separate things. Never connect them.
- Reports follow the calendar (Monday to Sunday). Budgets follow the allowance period. Don't mix the two.
- The Green/Yellow/Red cutoffs (80% and 50%) and the suggested category percentages are prototype guesses. Never describe them as validated financial advice.
- Budget math lives in calculations.js. Database calls live in storage.js.
- The browser talks directly to Supabase, so every new table needs correct RLS before it is used.
- Expense logging must stay low-friction. Don't add steps to it.

Rules added in team discussion:
- Green/Yellow/Red status colors stay fixed in every theme. Never use them decoratively or as category colors. Always show status with an icon and a word as well as color (for example: On track, Careful, At risk).
- Normal text needs a contrast ratio of at least 4.5:1 in every theme and at every text size.
- No franchise material anywhere (code, assets, menus, promotion): no names, logos, character art, or distinctive fonts from Barbie, Marvel, Avatar, or similar.
- Reference screenshots from other apps are layout inspiration only. Don't copy their colors, icons, fonts, or branding.
- Pop-ups and reminders are always dismissible, never block the screen, and never appear on the Add Expense screen while someone is logging.
- Learning and status content is general guidance, not professional financial advice. Say so where it appears.
- Use relative units (rem) for text, not fixed pixels.

## 4. Build order

- **Release 1, Quick wins:** logo fix, font scaling and text size setting, first-time guide, clearer feature labels, About page, reading list.
- **Release 2, Engagement:** notification bell with encouraging messages, themed reminder card, theme system with 5 themes, History bar chart.
- **Later or parked:** phone push notifications, payments and premium, custom backgrounds, preset avatars.

Why this order: the small items cover the feedback most people gave, the engagement items make the app feel alive, and the risky database work comes after the app is polished.

## 5. Feature specs

### Release 1: Quick wins

#### 1.1 Logo fix (bug) — Confirmed
- Problem: the logo stretches on small-screen phones.
- Likely cause: both a width and a height are forced on it.
- Fix: let one dimension follow the other (height: auto), keep the aspect ratio (object-fit: contain), cap the max width. If SVG, check its aspect ratio setting. Consider a smaller variant for narrow headers.
- **Done when:** the logo keeps its shape at 320, 360, and 390 px wide, on a tablet, and on a real phone.
- Size: Small.

#### 1.2 Automatic font scaling and text size setting — Confirmed
- Behavior: text sizes follow the screen automatically (a bit smaller on small phones, larger on wider screens). On top of that, the user picks Normal, Large, or Extra Large in the menu. Final size = automatic size × the user's choice.
- Rules: rem units; body text around 16px equivalent or larger; inputs at 16px or larger so iPhones don't zoom; confirm the viewport tag; check chart labels and any fixed-pixel text separately.
- Layouts must not break at Extra Large on a 320 px phone (cards, buttons, menu).
- Storage: device first. Saving to the account needs a new profiles column (flag it).
- **Done when:** readable at 320, 360, 390 px and on a tablet; all three sizes work on every main screen with nothing cut off or overlapping; tapping an input on iPhone doesn't zoom; choice survives refresh and logout.
- Size: Small to Medium.

#### 1.3 First-time guide — Confirmed
- Behavior: after the first budget setup, show 3–4 skippable cards: (1) Plan, Track, Understand; (2) what Green, Yellow, and Red mean, stated as guides and not professional advice; (3) Savings category versus Savings Goals; (4) how to add your first expense. A "How it works" link in the menu reopens it.
- Buttons: Next, Skip, Done.
- "Seen" flag: device first.
- **Done when:** a new user sees it once, can skip it, and can reopen it; readable on mobile.
- Size: Small to Medium.

#### 1.4 Clearer feature labels — Confirmed
- Behavior: a one-line subtitle under each page title and clear menu labels. Examples: History — see everything you've spent; Reports — daily and weekly totals by calendar day; Savings Goals — save toward something specific. *(Source doc has a stray "(bar chart breakdown)" here; meaning unclear.)*
- Before building, confirm with P11 and P12 what "distinction of features" meant.
- **Done when:** a new user can say what each page is for.
- Size: Small.

#### 1.5 About and credibility page — Confirmed
- Content: who made TipidTech and why; a plain-language note on what data is stored and who can see it; an honest note that the suggested percentages and color thresholds are prototype guides; a contact or feedback link.
- Only claim what is true. No "bank-level security" or "proven" wording unless it can be backed up.
- New public route (flag it). Link from the login screen and the menu.
- **Done when:** reachable before login and from the menu, readable on mobile.
- Size: Small.

#### 1.6 Learn section: reading list — Confirmed
- Behavior: a Learn page with a "Read" tab listing budgeting books and free resources. Each entry: title, author, a short summary in the team's own words, a one-line reason it helps a student, and a legal link.
- Don't upload or copy book text or PDFs. Prefer free, legitimate sources (public libraries, official financial-education pages). Verify every link; check Philippine-specific sources are current.
- Learn is a new route (flag it) shared with the scenario challenge (2.5), using tabs "Read" and "Practice". *(No 2.5 spec in the source doc.)*
- Data: a static data file. No database changes.
- **Icon must be a book.**
- **Done when:** at least 5 entries with working links, readable on mobile, with a note that it is general learning material.
- Size: Small.

### Release 2: Engagement

#### 2.1 Notification bell with encouraging messages — Confirmed
- Behavior: bell icon in the top bar (and mobile menu) with an unread dot. Tapping opens a list of short friendly messages with an emoticon, newest first. Opening marks them read; a clear option removes them.
- When messages appear: after saving an expense that changes status (Green→Yellow, back to Green); after staying Green for a stretch of days; after a savings contribution and when a goal is completed; when the period is nearly over or ended; when the balance reaches zero.
- How it works: messages are worked out from the user's current numbers when they use the app, so no new table. Read state saved on the device. Message text in constants.js, choosing logic in calculations.js.
- Rules: red-status messages are kind and supportive, never scolding (e.g. "Kaya pa 'yan, bantayan lang natin", not "You're overspending"); at least 3 messages per situation, rotated; no same message back to back; at most one or two new messages a day by the user's local day; original messages only; the expense warning stays in the add-expense flow and does not move to the bell.
- The bell works only while the app is open. It is not a phone notification.
- Accessibility: readable label such as "Notifications, 2 new", keyboard friendly, unread state not by color alone.
- Option (Section 6): one extra line on the dashboard showing the latest message.
- **Done when:** each status change produces a fitting message; nothing repeats back to back; read state survives refresh; works on a small phone and with a keyboard.
- Size: Small to Medium.

#### 2.2 Themed reminder card — Confirmed
- Behavior: a small pop-up card with title, message, icon, and two buttons (e.g. "On it!" and "Already did!"). Uses the theme palette.
- Buttons: "Did you log today's expenses?" → On it opens Add Expense, Already did closes for today. "Your period ends in 2 days" → On it opens the dashboard, Already did closes. "You're close to your goal!" → On it opens Savings Goals, Already did closes.
- Encouragement messages (the bell) use a single friendly button such as "Thanks!" or none. The bell keeps a copy of each reminder.
- Rules: dismissible, never blocks, one card at a time, not shown on Add Expense, only while the app is open, not shown again that day after "Already did!".
- **Done when:** the card appears for each reminder type and both buttons work as described; works in at least two themes; text readable in every theme at the large text size; never blocks adding an expense.
- Size: Medium (mostly the theme setup).

#### 2.3 Theme system — Confirmed
Covers the whole website, in the style of a Messenger-like theme gallery.
- **Step 1, palette foundation:** replace hard-coded colors (e.g. bg-white, text-gray-900) with shared palette variables used by every screen. The default theme must look exactly like today. Tailwind v4 supports theme variables.
- **Step 2, gallery:** Menu → Appearance. Grid of small preview cards. Tap applies instantly. "Reset to default" always visible.
- Starting themes (5, all original): Light, Dark, and three "inspired-by" themes with generic names:
  - **Pink Pop:** pinks and soft blush, white cards, hearts/stars/sparkles, very rounded corners, bubbly friendly font. Dark text on light pink; white text only on deep pink.
  - **Hero Comic:** bold navy, thick comic-style borders, dotted halftone pattern, lightning bolt and star icons, punchy headings. Its red and gold accents must stay clearly different from status Red and Yellow.
  - **Glow Forest:** deep teal and blue-green with purple highlights, glowing accents, leaf and light-spark icons, calm dark look.
- Never name a theme after a franchise.
- Rules: gradients are plain CSS (no image files) behind content; text on solid cards; no animated themes; status colors, warnings, errors never change; chart categories distinguishable without color; contrast ≥ 4.5:1 in every theme at all three text sizes on a 320 px phone; if a retro/pixel font is used, check license, loading weight, small-size readability.
- Apply the saved theme before first paint (no flash of default).
- Storage: device first. Account storage needs a new profiles column (flag it).
- Later options: custom accent color with auto readable text and low-contrast warning; preset avatars (no photo uploads); theme per shared space; custom background photo kept only on device.
- **Done when:** default looks identical to today; 5 themes work on every main screen; status colors and warnings clear in every theme; contrast passes in every theme at all sizes on a small phone; choice survives refresh and logout with no flash; Reset works.
- Size: Medium to Large, mostly the color cleanup.

#### 2.4 History bar chart (expense flow) — Confirmed (chart style still open, Section 6)
Layout comes from a screenshot of another expense app. Take the layout only, not its look.
- Layout, top to bottom: header with back arrow, range label, forward arrow (e.g. Oct 6 – Oct 12) plus Week/Month toggle; summary row with Spent and Daily average; dropdown for chart view ("Spending over time" or "By category"); the chart; a day-by-day strip; the History list.
- Day strip (week view): Monday to Sunday, each with date and the day's amount. Exact numbers without tapping; the text alternative to the chart. Month view: small calendar grid or a row of weekly totals.
- Tapping a bar, point, or day shows its amount and filters the list below to that day. Tapping again clears.
- "By category" view: horizontal bars, category name left, peso amount and share of total right, largest first, for the selected week/month. Plain HTML/CSS bars are fine. Tapping a bar filters the list to that category.
- Rules: weeks Mon–Sun, calendar months, matching Reports. Partial weeks/months labeled ("so far"). Zero-spend days show zero. Future days show nothing. Positive peso amounts (don't copy the reference's negative numbers / flipped axis). Y-axis starts at zero, round numbers, short labels on small screens (1.2k). Group by user's local date. Update immediately after add/edit/delete. Include "Other" in totals.
- No budget line on calendar weeks/months. A per-category budget comparison may appear only on the This Period view, and only if the team asks (Section 6).
- Use the theme accent for bars/line, not status red/green. Category colors consistent and labeled.
- Chart library: reuse the one the dashboard pie chart uses (recharts). No new dependency without flagging.
- Data: no new table/column. Use the existing expense fetch in storage.js; grouping math in calculations.js.
- **Done when:** chart and day strip show the same correct totals, checked against hand-added examples; arrows move correctly across month and year boundaries; tapping filters the list; zero, future, and today days behave as described; Month view works; works at 320 px, all three text sizes, every theme.
- Size: Medium.

### Release 3: Core change

#### 3.1 Add money mid-period — Confirmed
- Why: P10's allowance isn't fixed; current setup assumes one allowance per period.
- Flow: from the dashboard tap "Add money", enter amount, date, optional note. Balance and daily amount update right away. Top-up history shown and included in the period summary.
- Recommended design: top-ups as separate records (editable/deletable). Balance = allowance + top-ups − expenses. Decide explicitly how the planned daily amount and the Green/Yellow/Red ratio are calculated after a top-up.
- Separate from the Savings category and Savings Goals.
- Data: new table such as `budget_topups` (user, budget, amount, note, date) with RLS. Flag it. Check what the period reset does so top-ups aren't orphaned.
- Risk: touches calculations.js, which has no automated tests. Check against hand-calculated examples.
- **Done when:** balance and daily amounts correct after a top-up, an edit, and a delete; match hand-calculated examples; other users can't see the top-ups.
- Size: Medium.

### Later or parked
- Real phone push notifications (needs installable app setup and a way to send alerts).
- Payments and premium (payment provider, plan flag, rules for what is locked).
- "Over time" view stacked by category in History.
- Preset avatars, custom background photos, a theme per shared space.

## 6. Open decisions

*Missing from the source document.* Known open questions referenced above:
- History chart style (2.4)
- Dashboard line showing the latest bell message (2.1)
- Per-category budget comparison on the This Period view (2.4)

## Reminders
- Check the repo before assuming something is missing or present.
- Flag every new table, route, and dependency before adding it: the Learn page, the About page, the top-ups table, any chart or font library.
- The default look must stay exactly the same until a user picks a new theme.
- Keep expense logging fast and never block a save.
- Don't present the status thresholds or suggested percentages as financial advice.
- No franchise names, logos, character art, or distinctive fonts; don't copy other apps' designs.
- Status is always icon + word + color, never color alone.
