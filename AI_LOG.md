# AI Usage Log

## Tools Used
*GitHub Copilot, Opencode, ChatGPT*

- *Github Copilot - For understanding the challenge, Logic errors and missing features*
- *ChatGPT - For taking assistant with the errors in git*
- *Opencode - For completing each Task*


## Logs:

**Task 1: Pricing Logic Bug**
- *Did you use AI to find the bug? If so, what prompt did you use?*
    Yes, I use Github Copilot to find the bug, the bug was on the calculator.ts file. 
- *Did you use AI to write the fix?*
    Yes, With Opencode I changed the logic, when a Pro user also has a stackable free-shipping code, the shipping rate gets added into discountCents, inflating the discount. Free shipping is already handled by setting shippingCents = 0. I'll remove the offending block so shipping stays a separate value.

**Task 2: Dashboard Performance**
- *How did you use AI here? Did you use it to identify the N+1 issue, or just to write the optimized query?*

**Task 3: Duplicate Order Feature**
- *Did you use AI to write the API route, the client component, or both?*
- *Did AI make any mistakes you had to fix manually?*

## General Comments
*(Any other thoughts on how AI helped or hindered you during this assessment?)*
    When i first see docker-compose.yml I thought of installing something in docker when i opened i got to see postgressql user,password and db then i thought i need to initialise docker, for confirmation i ask github copilot "do i need to initialise docker for postgressql" but it remember me of prisma. so i leave it and copy the db url from env.example
    But when i click 'shop now' button it trigger me an error "Prisma couldn't connect to the database." i shocked and asked opencode for the fix and it tell me to started a local Postgres 16 matching the repo's docker-compose.yml creds using rootless podman.
