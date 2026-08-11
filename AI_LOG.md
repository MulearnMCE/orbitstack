# AI Usage Log

Please be honest and detailed about your AI usage. Using AI is perfectly fine and expected, but we want to understand your workflow!

## AI Tools Used

- Antigravity (Google DeepMind Agentic AI Coding Assistant running Gemini 3.6 Flash)

## Development and Testing Tools

- Vitest
- Next.js CLI
- TypeScript Compiler

## How did you use AI for this assessment?

### Task 1: Pricing Logic Bug

**Did you use AI to find the bug? If so, what prompt did you use?**

Yes. AI was used to inspect `lib/pricing/calculator.ts` and analyze the shipping discount calculation. It identified that the following logic was incorrectly adding `STANDARD_SHIPPING_RATE` to `discountCents` when shipping had already been set to zero:

`if (userTier === PRO_TIER && discountCode?.stackableWithFreeShipping)`

This resulted in shipping being effectively discounted twice for the affected case.

**Did you use AI to write the fix?**

Yes. AI was used to propose and implement the targeted fix by removing the redundant shipping discount addition while preserving the existing subtotal discount calculation. AI also helped create `tests/pricing.test.ts` to verify the pricing behavior.

I reviewed the implementation and verified it using the project's test suite and TypeScript checks.

### Task 2: Dashboard Performance

**How did you use AI here? Did you use it to identify the N+1 issue, or just to write the optimized query?**

AI was used for both analysis and implementation. It inspected `lib/orders/queries.ts` and the dashboard code and identified the N+1 query pattern caused by fetching order items separately for every order.

AI then proposed and implemented a Prisma relation query using nested `include` statements, along with the required 30-day order-history filter.

The implementation was reviewed and verified using the project's tests, TypeScript compiler, and production build.

### Task 3: Duplicate Order Feature

**Did you use AI to write the API route, the client component, or both?**

AI was used to implement both the API route at `app/api/orders/[id]/duplicate/route.ts` and the client component at `components/dashboard/DuplicateOrderButton.tsx`.

The implementation includes authentication and ownership checks, stock/inactive-product filtering, quantity handling, and integration with the existing Zustand cart store.

AI also helped create the associated tests.

I reviewed the implementation and verified it through the project's automated tests, TypeScript checks, and production build.

## General Comments

AI was used throughout the assessment for repository discovery, debugging, implementation assistance, test creation, and code review.

The workflow was:

1. Inspect the repository and understand the existing architecture.
2. Identify the problems related to each assessment task.
3. Use AI to propose targeted fixes.
4. Review the generated changes against the existing codebase and requirements.
5. Run automated tests and static checks.
6. Run the production build and review the final changes before submission.

All AI-generated changes were reviewed before being included in the submission.