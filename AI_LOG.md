# AI Usage Log

## AI Tool Used
Claude (Anthropic) — used via chat to analyze the repo, locate bugs, and implement fixes.

## Task 1: Pricing Logic Bug
Asked Claude to inspect the pricing computation logic. It found that in
lib/pricing/calculator.ts, when a Pro-tier user already qualified for free
shipping (subtotal over threshold) AND also applied a discount code marked
stackableWithFreeShipping, the code was zeroing shippingCents AND separately
adding STANDARD_SHIPPING_RATE to discountCents — double-counting the shipping
value and driving the total artificially low. Claude removed the redundant
discount addition since shippingCents=0 already reflects free shipping.
Verified with new unit tests in tests/pricing.test.ts covering standard
shipping, Pro + stackable code over/under threshold, and percentage discount
combined with free shipping — all pass.

## Task 2: Dashboard Performance
Asked Claude to find the bottleneck in the /dashboard order history load. It
identified an N+1 query in lib/orders/queries.ts: listOrders() fetched all
orders in one query, then ran a separate orderItem.findMany() per order
inside Promise.all — scaling linearly with order count. Claude replaced this
with a single prisma.order.findMany() call using nested include for items
and product, matching the pattern already used correctly in getOrderById.

## Task 3: Duplicate Order Feature
Asked Claude to design and implement a "Duplicate Order" button. It added:
- POST /api/orders/[id]/duplicate — validates session/ownership of the
  order, re-checks current stock/availability for each product using the
  live join already provided by getOrderById (avoiding an extra query),
  skips inactive or out-of-stock items, clamps quantity to available stock,
  and returns items to add plus a list of skipped items with reasons.
- components/dashboard/DuplicateOrderButton.tsx — client component that
  calls the endpoint and pushes returned items into the existing Zustand
  cart store via addItem(), with inline error/skipped-item messaging.
- Wired the button into the previously empty slot in OrderCard.tsx.

## Remaining / Known Limitations
- Pre-existing lint issues in files unrelated to the three tasks (e.g.
  setState-in-effect warnings in CartDrawer.tsx, Header.tsx, and
  no-html-link-for-pages in a couple of pages) were left untouched, as
  they were out of scope for this assignment.
- Verified locally with `npm run test` and `npm run lint`, and manually
  confirmed all three fixes (pricing calculation, single-query dashboard
  load, and end-to-end duplicate-order flow) via the dev server.
