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

### Task 1: Pricing Logic Bug [100% completed]
A user reported an issue where applying a free shipping discount code to a Pro account results in a negative discount calculation (instead of ) for the shipping cost. 
- The pricing computation logic was fixed so that shipping is calculated correctly when multiple shipping discounts/free tiers stack.

### Task 2: Dashboard Performance [100% completed]
The /dashboard page is loading extremely slowly for users who have a large order history.
- The performance bottleneck when loading the order history was identified.
- The data fetching was optimized so the dashboard loads quickly regardless of how many orders the user has.

### Task 3: "Duplicate Order" Feature [100% completed]
A "Duplicate Order" button was added to the past orders displayed on the dashboard.
- Clicking the button adds the same items from the past order directly into the user's cart (provided they are still in stock).
- The API endpoint and the client-side logic to update the cart store was built.



## Additional Features Added
1. I added a back button and logout button feature

- *Logout — `components/dashboard/LogoutButton.tsx` added to the Order History page.*
- *Back arrow — `components/layout/BackButton.tsx` rendered in the root layout on the Orders and Shop pages.*

2. I also added a Clear Cart feature after every logout in the dashboard

- *Cart cleared — `actions/cart.ts` modified to clear the cart after logout.*
- *Confirmation — `components/dashboard/LogoutButton.tsx` added a confirmation dialog before logout.*


