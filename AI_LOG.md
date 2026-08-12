# AI Usage Log

## Tools Used

- **Antigravity (Google DeepMind)** — AI coding assistant integrated into VS Code (pair programming mode)

## How did you use AI for this assessment?

**Task 1: Pricing Logic Bug**
- Used AI to read and trace through `lib/pricing/calculator.ts` and identify the exact faulty condition on lines 38–40.
- AI explained the bug: when a Pro user already qualifies for free shipping via the tier threshold, the code still adds `STANDARD_SHIPPING_RATE` to `discountCents` if a stackable coupon is also present — producing an inflated discount.
- AI proposed the fix (tracking `proThresholdFreeShipping` as a boolean and gating the discount credit on it), which I reviewed and approved.
- AI also wrote the unit tests in `tests/pricing.test.ts` covering all 4 key combinations. The first run revealed a wrong `totalCents` assertion in 2 tests — AI corrected the math and re-ran successfully (6/6 pass).

**Task 2: Dashboard Performance**
- AI identified the N+1 pattern in `lib/orders/queries.ts` immediately from reading the code: one `OrderItem.findMany` per order inside a `Promise.all` loop.
- AI wrote the replacement query using Prisma's nested `include`, which eliminates the per-order round-trips.
- I reviewed the diff to confirm nothing else was changed.

**Task 3: Duplicate Order Feature**
- AI designed the API contract: `POST /api/orders/[id]/duplicate` returns `{ items: { product, quantity }[], skipped: { ... }[] }` — including quantities from the original order (not just product IDs) and a separate skipped list with reasons.
- AI created `app/api/orders/[id]/duplicate/route.ts` with ownership check directly in the Prisma `where` clause (no extra round-trip), stock validation requiring the full original quantity, and the `skipped` response payload.
- AI created `components/dashboard/DuplicateOrderButton.tsx` as a `'use client'` component with loading/success/error states and no auto-redirect (user decides whether to go to cart).
- AI modified `OrderCard.tsx` to import and render the button in the existing footer placeholder.
- TypeScript (`tsc --noEmit`) passed with zero errors after all changes.

## General Comments

The AI was used in a genuine pair-programming style — it read the code, explained its findings, proposed changes, and I reviewed and approved each step before it proceeded. The AI caught the test assertion error on its own (the `totalCents` formula) and self-corrected after seeing the failing test output. No fixes were needed manually beyond approving the proposed corrections.

