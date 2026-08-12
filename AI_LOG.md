# AI Usage Log

## Tools Used
*GitHub Copilot, Opencode, ChatGPT*

- *Github Copilot - For understanding the challenge, Logic errors and missing features*
- *ChatGPT - For taking assistance in handling the errors in git*
- *Opencode - For completing the coding part in each task*


## Logs:

**Task 1: Pricing Logic Bug**
- *Did you use AI to find the bug? If so, what prompt did you use?* <br>
    Yes, I use Github Copilot to find the bug, the bug was on the calculator.ts file. 
- *Did you use AI to write the fix?* <br>
    Yes, With Opencode I changed the logic, when a Pro user also has a stackable free-shipping code, the shipping rate gets added into discountCents, inflating the discount. Free shipping is already handled by setting shippingCents = 0. I'll remove the offending block so shipping stays a separate value.

**Task 2: Dashboard Performance**
- *How did you use AI here? Did you use it to identify the N+1 issue, or just to write the optimized query?* <br>
    I used github copilot to identify the problem and use opencode to write the code.
    I found the N+1 query issue. The listOrders function fetches all orders, then makes a separate query for each order's items. I fix this by using Prisma's include to fetch everything in one query.

**Task 3: Duplicate Order Feature**
- *Did you use AI to write the API route, the client component, or both?* <br>
    Yes, for both i use opencode what i done is
    1. Add a POST endpoint to /api/orders/[id]/route.ts that validates stock and returns order items
    2. Add a "Duplicate Order" button to OrderCard.tsx
    3. Add a function to cart.ts to add multiple items from an order (replacing the cart)
- *Did AI make any mistakes you had to fix manually?* <br>
    Yes,  Added "use client" directive at the top of OrderCard.tsx.

## General Comments

**Comment 1**<br>

- *When I first saw `docker-compose.yml`, I thought of installing something in Docker. When I opened it, I saw the PostgreSQL username, password, and database, so I thought I needed to initialize Docker. For confirmation, I asked GitHub Copilot, "Do I need to initialize Docker for PostgreSQL?" But it reminded me of Prisma, so I left it and copied the DB URL from `env.example`.*

- *But when I clicked the "Shop Now" button, it triggered an error: "Prisma couldn't connect to the database." I was shocked and asked OpenCode for a fix. It told me to start a local PostgreSQL 16 instance matching the repo's `docker-compose.yml` credentials using rootless Podman.*

**Comment 2**<br>

I added a back button and logout button feature

- *Logout — `components/dashboard/LogoutButton.tsx` added to the Order History page.*
- *Back arrow — `components/layout/BackButton.tsx` rendered in the root layout on the Orders and Shop pages.*

**Comment 3**<br>

I added a Clear Cart feature after every logout in the dashboard

- *Cart cleared — `actions/cart.ts` modified to clear the cart after logout.*
- *Confirmation — `components/dashboard/LogoutButton.tsx` added a confirmation dialog before logout.*