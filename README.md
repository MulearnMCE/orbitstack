# OrbitStack

OrbitStack is a modern Next.js e-commerce platform built with **Next.js, TypeScript, Tailwind CSS, Prisma, and Zustand**.

This repository contains the completed implementation for the **Mufifa Initial Qualification — Repository Debugging Challenge**.

## Implemented Tasks

### 1. Pricing Logic Bug

Fixed an issue where a Pro user with a free-shipping discount code could have the standard shipping rate incorrectly added to `discountCents` even when the Pro free-shipping threshold had already made shipping free.

#### Fix
- Detect whether the Pro free-shipping threshold already applies.
- Only credit shipping savings to the discount when the discount code is responsible for making shipping free.
- Added unit tests covering the pricing combinations.

#### Tests

```bash
npx vitest run tests/pricing.test.ts
```

Result:

```text
6/6 tests passing
```

---

### 2. Dashboard Performance

The dashboard previously used an **N+1 query pattern** when loading order history.

The application first fetched all orders and then executed a separate `OrderItem.findMany()` query for every order.

#### Fix

Replaced the per-order database queries with Prisma nested relation loading:

```text
Orders
 └── Order Items
      └── Products
```

This eliminates the application-level N+1 query pattern and significantly reduces database round-trips for users with large order histories.

---

### 3. Duplicate Order

Added a **Duplicate Order** feature to the dashboard.

Users can duplicate a previous order and add its available products directly to their cart.

#### Features

* `POST /api/orders/[id]/duplicate` API endpoint
* Authentication validation
* Order ownership validation
* Product availability validation
* Stock validation against the original requested quantity
* Handles unavailable products without adding them to the cart
* Preserves the original order quantities
* Zustand cart integration
* Loading, success, and error states
* Duplicate Order button added to dashboard order cards

### Flow

```text
Past Order
    ↓
Duplicate Order
    ↓
API validation
    ↓
Ownership + Product + Stock checks
    ↓
Available items returned
    ↓
Zustand Cart Store
    ↓
Items added to cart
```

---

## Project Structure

```text
app/
├── api/
│   └── orders/
│       └── [id]/
│           └── duplicate/
│               └── route.ts
└── dashboard/

components/
└── dashboard/
    ├── DuplicateOrderButton.tsx
    └── OrderCard.tsx

lib/
├── orders/
│   └── queries.ts
└── pricing/
    └── calculator.ts

store/
└── cart.ts

tests/
└── pricing.test.ts

AI_LOG.md
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Configure the required database/environment values as needed.

### 3. Run the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Validation

The implementation was validated with:

### Pricing tests

```bash
npx vitest run tests/pricing.test.ts
```

```text
6/6 tests passing
```

### TypeScript

```bash
npx tsc --noEmit
```

```text
0 TypeScript errors
```

## Files Changed

| File                                            | Change                                          |
| ----------------------------------------------- | ----------------------------------------------- |
| `lib/pricing/calculator.ts`                     | Fixed Pro/free-shipping pricing calculation     |
| `lib/orders/queries.ts`                         | Removed N+1 order-history query pattern         |
| `app/api/orders/[id]/duplicate/route.ts`        | Added Duplicate Order API                       |
| `components/dashboard/DuplicateOrderButton.tsx` | Added client-side duplicate order functionality |
| `components/dashboard/OrderCard.tsx`            | Added Duplicate Order button                    |
| `tests/pricing.test.ts`                         | Added pricing regression tests                  |
| `AI_LOG.md`                                     | Documented AI-assisted development              |

## AI Usage

AI assistance was used during development for debugging, code analysis, implementation planning, and reviewing the changes.

Detailed AI usage is documented in [`AI_LOG.md`](./AI_LOG.md).

## Submission

This repository contains the completed implementation for the OrbitStack Repository Debugging Challenge.

A Pull Request has been submitted against the original challenge repository.
