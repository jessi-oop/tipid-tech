# TipidTech Project Rules

## PROJECT RULES

- Warn, never block. A warning can say an expense will push the user to Yellow, but the user can always still save it.

- The budget's Savings category and Savings Goals are separate. Never connect them.

- Reports follow the calendar (Monday to Sunday). Budgets follow the allowance period. Never mix the two.

- The Green/Yellow/Red cutoffs (80% and 50%) and suggested category percentages are prototype guesses. Never describe them as validated financial advice.

- Budget math lives in src/utils/calculations.js. Database calls live in src/utils/storage.js. Components live in src/components/.

- The browser talks directly to Supabase, so every new table needs correct RLS before it is used.

- Expense logging must stay low-friction. Do not add steps to it.

## DESIGN RULES

- Green/Yellow/Red status colors stay fixed in every theme. Never use them decoratively or as category colors. Always show status with an icon AND a word (On track, Careful, At risk) as well as color.

- Normal text needs a contrast ratio of at least 4.5:1 in every theme and at every text size.

- No franchise material anywhere (code, assets, menus, copy): no names, logos, character art, or distinctive fonts from Barbie, Marvel, Avatar, or similar. Reference screenshots are layout inspiration only, never copy colors, icons, fonts, or branding.

- Pop-ups and reminders are always dismissible, never block the screen, and never appear on the Add Expense screen.

- Learning and status content is general guidance, not professional financial advice. Say so where it appears.

- Use rem units for text, not fixed pixels.

- Rows that show text and an amount: amount is shrink-0 and whitespace-nowrap on the right, text is min-w-0 flex-1 on the left. Date chips and pills never go in a row with an amount on mobile. After layout work, check for overlap visually, since the console overflow check only catches elements past the screen edge.

## PROCESS RULES

- Before building anything, inspect the repo. Do not assume something is missing just because it isn't listed.

- FLAG before adding any new table, column, route, or dependency. Stop and ask me first.

- The default look must stay exactly the same as today until a user picks a different theme.

- Check results against hand-calculated examples where math is involved (calculations.js has no automated tests).
