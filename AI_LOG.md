# AI Usage Log

## Tools Used
*GitHub Copilot, Opencode, ChatGPT*

- *Github Copilot - For understanding the challenge, Logic errors and missing features*
- *ChatGPT - For taking assistant with the errors in git*
- *Opencode - For completing each Task*


## Logs:

**Task 1: Pricing Logic Bug**
- *Did you use AI to find the bug? If so, what prompt did you use?* <br>
    Yes, I use Github Copilot to find the bug, the bug was on the calculator.ts file. 
- *Did you use AI to write the fix?* <br>
    Yes, With Opencode I changed the logic, when a Pro user also has a stackable free-shipping code, the shipping rate gets added into discountCents, inflating the discount. Free shipping is already handled by setting shippingCents = 0. I'll remove the offending block so shipping stays a separate value.

**Task 2: Dashboard Performance**
- *How did you use AI here? Did you use it to identify the N+1 issue, or just to write the optimized query?* <br>

**Task 3: Duplicate Order Feature**
- *Did you use AI to write the API route, the client component, or both?* <br>
- *Did AI make any mistakes you had to fix manually?* <br>

## General Comments

**Comment 1**<br>

- *When I first saw `docker-compose.yml`, I thought of installing something in Docker. When I opened it, I saw the PostgreSQL username, password, and database, so I thought I needed to initialize Docker. For confirmation, I asked GitHub Copilot, "Do I need to initialize Docker for PostgreSQL?" But it reminded me of Prisma, so I left it and copied the DB URL from `env.example`.*

- *But when I clicked the "Shop Now" button, it triggered an error: "Prisma couldn't connect to the database." I was shocked and asked OpenCode for a fix. It told me to start a local PostgreSQL 16 instance matching the repo's `docker-compose.yml` credentials using rootless Podman.*

**Comment 2**<br>

I added a back button and logout button.

- *Logout — `components/dashboard/LogoutButton.tsx` added to the Order History page.*
- *Back arrow — `components/layout/BackButton.tsx` rendered in the root layout on the Orders and Shop pages.*