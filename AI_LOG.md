# AI Usage Log

Please be honest and detailed about your AI usage. Using AI is perfectly fine and expected, but we want to understand your workflow!

## Tools Used
*(e.g., GitHub Copilot, ChatGPT, Claude, Cursor, etc.)*

- Claude (Anthropic), used in an agentic/computer-use mode with direct read/write/terminal access to a cloned copy of the repo

## How did you use AI for this assessment?

**Task 1: Pricing Logic Bug**
- Asked Claude to inspect `lib/pricing/calculator.ts` and trace how `computeOrderTotals` handles a Pro-tier user redeeming a `stackableWithFreeShipping` discount code.
- Claude identified the root cause: the block that credits `STANDARD_SHIPPING_RATE` onto `discountCents` ran whenever `userTier === PRO_TIER && discountCode?.stackableWithFreeShipping`, regardless of whether `shippingCents` had *already* been zeroed out by the Pro free-shipping threshold check a few lines above. Pro users above the threshold got the shipping value credited twice — once implicitly (no shipping charge) and once explicitly (extra discount) — which pushed the total below where it should be.
- Claude wrote the fix: compute `proThresholdFreeShipping` and `codeFreeShipping` as explicit booleans, and only add the shipping credit to `discountCents` when `codeFreeShipping && !proThresholdFreeShipping` (i.e. shipping wasn't already free from the threshold).
- Claude also wrote `tests/pricing.test.ts` with three cases (Pro + threshold + stackable code, standard-tier + stackable code, no code/no Pro) and ran them with `vitest` to confirm the fix.

**Task 2: Dashboard Performance**
- Asked Claude to trace the data flow from `app/dashboard/page.tsx` down through `lib/orders/queries.ts`.
- Claude identified an N+1 query pattern in `listOrders`: one `findMany` for the user's orders, then a separate `prisma.orderItem.findMany` *inside a `.map()`* for every single order — a user with 200 orders triggered 201 sequential DB round trips.
- Claude rewrote `listOrders` to fetch orders, items, and products in a single query using Prisma's nested `include`, removing the extra round trips entirely.
- Verified via `npx tsc --noEmit` that the return shape is still compatible with `app/dashboard/page.tsx`.

**Task 3: Duplicate Order Feature**
- Claude wrote both the API route and the client component.
- API route (`app/api/orders/[id]/duplicate/route.ts`): reuses `getOrderById` for auth/ownership checks (mirroring the existing `app/api/orders/[id]/route.ts` pattern), then re-fetches current `Product` rows (not the order snapshot) so price/stock/active changes since purchase are respected. Items that are inactive, out of stock, or short on stock are reported back separately instead of silently failing.
- Client component (`components/dashboard/DuplicateOrderButton.tsx`): a `'use client'` component that calls the endpoint, pushes returned items into the Zustand `useCartStore` via `addItem`, and shows a short status message (including partial-success cases where some items couldn't be re-added).
- Claude made one mistake I had to catch: an early draft of the "standard tier" pricing test asserted the wrong expected total (forgot the discount reduces the total). Caught by actually running the test — corrected the assertion, not the implementation.

## General Comments
Claude was used end-to-end here: reading the relevant files, diagnosing each bug from the actual code, writing the fixes, and verifying with `tsc --noEmit`, `eslint`, and `vitest` before treating anything as done. I reviewed each diff and the reasoning behind it before accepting it into this PR.
