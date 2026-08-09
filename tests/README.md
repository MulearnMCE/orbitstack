# Tests

This directory is scaffolded for [Vitest](https://vitest.dev/) and ready to receive reviewer-authored tests.

## Running Tests

```bash
npm run test
```

The placeholder test passes out of the box so the CI scaffold works without any setup.

## Intended Test Coverage (to be added by reviewers)

Tests will be added here after candidate submissions are collected. Planned:

- **Task 1 regression:** `computeOrderTotals` with PROSHIP15 on a Pro-tier user returns correct `discountCents` and `totalCents`
- **Task 2 performance:** `listOrders` issues ≤2 DB queries and returns only the last 30 days of orders
- **Task 3 contract:** `POST /api/orders/[id]/duplicate` returns 403 for wrong-user requests, 200 with correct item list for the owning user, skips out-of-stock items
- **API envelope:** all routes return `{ data, error }` shape (no bare arrays or unwrapped objects)

## Adding Tests

Drop test files here as `*.test.ts`. Vitest auto-discovers them. The Prisma client is available via `@/lib/db/client`. For integration tests, point `DATABASE_URL` at a test database.
