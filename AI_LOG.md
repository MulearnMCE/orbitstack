# AI Usage Log

Please be honest and detailed about your AI usage. Using AI is perfectly fine and expected, but we want to understand your workflow!

## Tools Used

- Codex (GPT-5.6 Sol, high reasoning)

## How did you use AI for this assessment?

I had already gone through the challenge requirements and understood the three problem areas before using Codex for the implementation work. I mainly used Codex for repository exploration, implementation assistance, and extensive testing and verification.

**Task 1: Pricing Logic Bug**
- I used Codex to explore the relevant pricing code and help implement the fix in `computeOrderTotals`.
- The implementation keeps free shipping represented by `shippingCents = 0` without applying the same shipping benefit again through `discountCents`.
- Codex was used heavily for regression testing. Tests were added for the seeded `PROSHIP15` scenario and related combinations involving Pro/standard users, the free-shipping threshold, and normal paid shipping.

**Task 2: Dashboard Performance**
- I used Codex to explore the dashboard/order query flow and help implement the optimized Prisma query.
- The final implementation loads orders with their items/products without per-order item queries, applies the required 30-day order-history window, preserves newest-first ordering, and adds a compound `(userId, createdAt)` index.
- Codex helped create and run a focused test that verifies the query shape, history cutoff, relation loading, ordering, and that the N+1 pattern is removed.

**Task 3: Duplicate Order Feature**
- I used Codex to help implement both the API route and the client-side dashboard action.
- The API follows the existing authentication and ownership behavior, validates current product availability and stock, and preserves the existing `{ data, error }` response format.
- The client integrates with the existing Zustand cart and merges duplicate-order items into the current cart instead of replacing it.
- Codex was also used to create tests for authentication, ownership checks, successful duplication, unavailable products, and stock handling.

## Testing and Verification

Testing was the main area where I relied on Codex. It helped write the regression tests, run the project checks, inspect failures, and verify the final implementation after the changes were committed.

The final verification included:

- `npm test` — 9/9 tests passed
- `npx tsc --noEmit` — passed
- focused ESLint checks on the changed source/test files — passed
- `npx prisma validate` — passed
- `npm run build` — production build passed
- `git diff --check` — passed

## General Comments

Codex was most useful for quickly navigating the repository, assisting with implementation, and giving the changes a much more thorough testing pass. I reviewed the resulting changes and test output before keeping them.
