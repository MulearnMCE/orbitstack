# AI Usage Log

Please be honest and detailed about your AI usage. Using AI is perfectly fine and expected, but we want to understand your workflow!

## Tools Used
*(e.g., GitHub Copilot, ChatGPT, Claude, Cursor, etc.)*

- OpenAI Codex (GPT-5), used as a coding assistant in the repository workspace.
- Codex terminal tools: `rg`/`sed` for code inspection, `apply_patch` for edits, and npm/TypeScript commands for verification.

## How did you use AI for this assessment?

**Task 1: Pricing Logic Bug**
- I asked Codex to trace the cart/checkout pricing path, fix the free-shipping discount calculation, and run relevant checks.
- Codex located the issue in `lib/pricing/calculator.ts`: when a Pro-tier free-shipping benefit and a free-shipping discount code were both present, the code set shipping to zero and then incorrectly added the standard shipping amount to `discountCents`.
- Codex removed that extra shipping-rate addition and added Vitest regression tests for stacked free-shipping benefits, code-only free shipping, and ordinary paid shipping.
- Verification performed: `npm test` passed (4 tests) and `npx tsc --noEmit` passed. The repository-wide lint command has unrelated existing UI errors; the production build could not fetch its Google Fonts in this environment.

**Task 2: Dashboard Performance**
- I asked Codex to inspect the dashboard order-loading path and optimize the data access for large order histories.
- Codex identified an N+1 query pattern in `listOrders`: it fetched all of a user's orders, then ran a separate item/product query for every order.
- Codex replaced this with one Prisma relation query, scoped the dashboard history to the most recent 30 days, selected only fields rendered by the dashboard, and added a composite `(userId, createdAt)` index to support the filtered history query.
- Verification performed: `npm test` passed (4 tests) and `npx tsc --noEmit` passed.

**Task 3: Duplicate Order Feature**
- Not started in this session.

## General Comments
*(Any other thoughts on how AI helped or hindered you during this assessment?)*

Codex accelerated repository navigation, implementation, and focused test creation. I reviewed the identified pricing behavior and kept the change limited to Task 1. No external submission website actions were performed.
