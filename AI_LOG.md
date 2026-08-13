# AI Usage Log

Please be honest and detailed about your AI usage. Using AI is perfectly fine and expected, but we want to understand your workflow!

## Tools Used

- ChatGPT (GPT-5.6 Sol)
- GitHub and terminal tools exposed through ChatGPT for repository inspection, editing, and verification

## How did you use AI for this assessment?

**Task 1: Pricing Logic Bug**
- I asked ChatGPT to inspect the repository and compare the existing implementation with other submitted approaches before making changes.
- ChatGPT traced `computeOrderTotals` and identified that free shipping was already represented by `shippingCents = 0`, but a later branch also added the standard shipping rate to `discountCents` for Pro users with a stackable free-shipping code. This applied the shipping benefit twice.
- ChatGPT removed the redundant monetary shipping credit and added regression tests for the seeded `PROSHIP15` case plus related tier/shipping combinations.

**Task 2: Dashboard Performance**
- ChatGPT traced the dashboard data path and identified the N+1 pattern in `listOrders`: one query fetched orders and then one additional order-item query ran for every returned order.
- ChatGPT also inspected `tests/README.md`, which states that reviewer tests expect the dashboard query to return only the last 30 days of orders and use at most two database queries.
- The implementation now performs one Prisma query with nested item/product loading, applies the 30-day cutoff, keeps newest-first ordering, and adds a compound `(userId, createdAt)` index for that access pattern.

**Task 3: Duplicate Order Feature**
- ChatGPT implemented both the API route and client-side dashboard action.
- The API follows the existing authentication/ownership pattern, including a `403` response for another user's order. It checks the current product state, skips inactive products and products without enough stock for the original quantity, and returns the remaining products using the existing `{ data, error }` API envelope.
- The client uses a new batched Zustand `addItems` action so duplicate-order items are merged into the existing persisted cart in a single immutable state update rather than replacing the cart.

## General Comments

AI was used for repository exploration, comparison with existing pull requests, implementation, test design, and verification. The changes were intentionally kept focused on the three requested tasks. No pull request was created as part of the implementation step.
