# OrbitStack

Welcome to OrbitStack! This is a modern, Next.js-based e-commerce platform built with Tailwind CSS, Prisma, and Zustand. 

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   The project connects to a shared testing database. Simply copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. **Run the Development Server**
   ```bash
   npm run dev
   ```

## The Challenge [Finished]

There are three tasks to complete. Please review the codebase and implement the fixes and features described below.

### Task 1: Pricing Logic Bug [100% completed]
A user reported an issue where applying a free shipping discount code to a Pro account results in a negative discount calculation (instead of ) for the shipping cost. 
- You need to locate the pricing computation logic and fix the bug so that shipping is calculated correctly when multiple shipping discounts/free tiers stack.

### Task 2: Dashboard Performance [100% completed]
The /dashboard page is loading extremely slowly for users who have a large order history.
- Identify the performance bottleneck when loading the order history.
- Optimize the data fetching so the dashboard loads quickly regardless of how many orders the user has.

### Task 3: "Duplicate Order" Feature [100% completed]
Add a new "Duplicate Order" button to the past orders displayed on the dashboard.
- Clicking the button should add the same items from the past order directly into the user's cart (provided they are still in stock).
- You will need to build the API endpoint and the client-side logic to update the cart store.

Good luck!

## Submission [Done]

When you are finished, please submit a pull request with your changes. 
**IMPORTANT:** You must fill out the AI_LOG.md file included in this repository. Please describe which AI tools you used and how you used them to complete the tasks.
