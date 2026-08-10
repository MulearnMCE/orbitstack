# AI Usage Log

Please be honest and detailed about your AI usage. Using AI is perfectly fine and expected, but we want to understand your workflow!

## Tools Used
*(e.g., GitHub Copilot, ChatGPT, Claude, Cursor, etc.)*

- ChatGPT Codex (GPT-5.6)
- Command-line tools: Git, npm, Vitest, ESLint, TypeScript, Prisma and Next.js

## How did you use AI for this assessment?

**Task 1: Pricing Logic Bug**
- I gave ChatGPT Codex the full challenge brief and repository URL. It inspected the pricing calculator and identified that the Pro/free-shipping branch incorrectly added the standard shipping rate to `discountCents` after shipping was already zeroed.
- AI wrote the small fix and regression tests. I reviewed the expected totals for Pro, standard, and non-free-shipping cases.

**Task 2: Dashboard Performance**
- AI identified the N+1 database pattern: one query loaded all orders and then one additional query ran for every order. It replaced this with one Prisma `findMany` query using a nested `include`, and added a compound `(userId, createdAt DESC)` index matching the dashboard filter and sort.

**Task 3: Duplicate Order Feature**
- AI implemented both the authenticated API route and client component, plus a bulk cart-store action. The endpoint verifies order ownership and current product activity/stock, returns only fully available order lines, and reports skipped products.
- The implementation was validated with TypeScript, ESLint, Vitest, Prisma validation, and a Next.js production build. The initial npm install required changing the cache directory because the default cache was unavailable in the execution environment; this was an environment issue, not an application-code issue.

## General Comments
*(Any other thoughts on how AI helped or hindered you during this assessment?)*

AI accelerated repository exploration, implementation, test design, and documentation. I used the generated changes as a starting point and relied on automated checks to verify that the final code remained type-safe and buildable.
