# AI Usage Log

## Tools Used
- Github Copilot
- ChatGPT

## How did you use AI for this assessment?

**Task 1: Pricing Logic Bug**
-Bug discovery: Yes, I used AI to help locate the bug.
Prompt used: “There’s a bug in my pricing logic where discounts aren’t applied correctly. Can you help me trace the issue in this function?”

Fix: I asked AI to propose a corrected version of the function. It generated a fix, which I adapted slightly to match the project’s coding style and variable naming.

**Task 2: Dashboard Performance**
- Usage: I leaned on AI to confirm the presence of an N+1 query issue after suspecting it from slow load times.

Optimized query: AI suggested a more efficient query using eager loading. I directly implemented this, with minor adjustments to fit the ORM conventions in the project.
**Task 3: Duplicate Order Feature**
- API route: AI drafted the initial Express.js route for duplicating an order.

Client component: I also used AI to scaffold the React component logic.

Corrections: AI’s first draft missed some validation checks and had a small bug in handling nested order items. I manually fixed those before finalizing.
## General Comments
AI was extremely helpful for speeding up repetitive coding tasks and confirming suspicions (like the N+1 issue). However, I noticed that AI sometimes produced code that didn’t fully align with the project’s conventions or missed edge cases. I had to carefully review and adjust outputs rather than copy them blindly. Overall, AI acted as a strong accelerator but not a complete replacement for debugging and critical thinking.
