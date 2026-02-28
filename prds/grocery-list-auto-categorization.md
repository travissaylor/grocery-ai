# PRD: Grocery List with Auto-Categorization

## Introduction

A grocery list app built with Next.js that lets users quickly add items to a shopping list. Items are automatically sorted into predefined store sections (e.g., Produce, Dairy, Frozen) using a free AI classification API. While shopping, users can check off items as they go. All data is stored in the browser's local storage — no account required.

## Goals

- Provide a fast, frictionless way to add grocery items (type and press enter)
- Automatically categorize each item into a store aisle/section using a free AI API
- Display items grouped by store section so users can shop efficiently
- Allow users to check off items while shopping
- Persist the list in local storage so it survives page refreshes

## User Stories

### US-001: Define store section categories

**Description:** As a developer, I need a predefined set of store sections so items can be categorized consistently.

**Acceptance Criteria:**

- [ ] Define the following sections as constants: Produce, Dairy, Meat & Seafood, Bakery, Frozen, Canned Goods, Snacks, Beverages, Condiments & Sauces, Pasta & Grains, Baking, Breakfast & Cereal, Household & Cleaning, Health & Personal Care, Other
- [ ] Each section has a display name and a stable key (e.g., `produce`, `dairy`)
- [ ] "Other" serves as the fallback category for unrecognized items
- [ ] Typecheck/lint passes

### US-002: Add grocery item via text input

**Description:** As a user, I want to type an item name and press Enter to add it to my list so I can build my grocery list quickly.

**Acceptance Criteria:**

- [ ] Text input field is visible at the top of the page
- [ ] Pressing Enter or clicking an "Add" button adds the item
- [ ] Input field clears after adding
- [ ] Input field retains focus after adding so user can keep typing
- [ ] Empty input does not add an item
- [ ] Typecheck/lint passes

### US-003: Configure environment for Gemini API

**Description:** As a developer, I need the Gemini API key configuration set up so the classification API route can access it securely.

**Acceptance Criteria:**

- [ ] Create a `.env` file with `GEMINI_API_KEY` (gitignored)
- [ ] Create a `.env.example` file with `GEMINI_API_KEY=your_api_key_here`
- [ ] `.env` is listed in `.gitignore`
- [ ] Update `next.config.ts` to validate that `GEMINI_API_KEY` is set, throwing a clear error message at build/startup if missing
- [ ] Install the `@google/generative-ai` npm package
- [ ] Typecheck/lint passes

### US-004: Auto-categorize items using Gemini API

**Description:** As a user, I want my grocery items to be automatically sorted into the correct store section so I don't have to organize them myself.

**Acceptance Criteria:**

- [ ] When an item is added, a request is made to the Google Gemini API (free tier) to classify the item into one of the predefined sections
- [ ] The API is called via a Next.js API route (server-side) to keep the Gemini API key out of the client
- [ ] If the API returns a section not in the predefined list, the item falls back to "Other"
- [ ] If the API call fails (network error, rate limit), the item is placed in "Other" and no error is shown to the user
- [ ] The item appears in the list immediately (optimistically placed in "Other" or shown as "Categorizing...") and updates when classification completes
- [ ] Typecheck/lint passes

### US-005: Display items grouped by store section

**Description:** As a user, I want to see my grocery list organized by store section so I can shop aisle by aisle.

**Acceptance Criteria:**

- [ ] Items are displayed in groups, with each group labeled by its section name
- [ ] Only sections that contain items are shown (no empty sections)
- [ ] Items within each section are displayed in the order they were added
- [ ] Typecheck/lint passes

### US-006: Check off items while shopping

**Description:** As a user, I want to check off items as I put them in my cart so I can track what I still need.

**Acceptance Criteria:**

- [ ] Each item has a checkbox next to it
- [ ] Clicking the checkbox toggles the item's checked state
- [ ] Checked items show a strikethrough style and reduced opacity
- [ ] Checked items remain in their section (not moved or hidden)
- [ ] Typecheck/lint passes

### US-007: Remove items from the list

**Description:** As a user, I want to remove items I no longer need so my list stays clean.

**Acceptance Criteria:**

- [ ] Each item has a delete/remove button (e.g., an "X" icon)
- [ ] Clicking remove deletes the item immediately (no confirmation dialog needed)
- [ ] The section heading disappears if the last item in that section is removed
- [ ] Typecheck/lint passes

### US-008: Persist list in local storage

**Description:** As a user, I want my grocery list to be saved automatically so I don't lose it when I close the browser.

**Acceptance Criteria:**

- [ ] The grocery list is saved to `localStorage` whenever it changes (items added, removed, or checked)
- [ ] On page load, the list is restored from `localStorage`
- [ ] If no saved list exists, the app starts with an empty list
- [ ] Typecheck/lint passes

### US-009: Clear entire list

**Description:** As a user, I want to clear my entire grocery list when I'm done shopping so I can start fresh next time.

**Acceptance Criteria:**

- [ ] A "Clear List" button is visible when the list has items
- [ ] Clicking it shows a confirmation prompt (e.g., "Clear all items?")
- [ ] Confirming removes all items and clears local storage
- [ ] The button is hidden when the list is empty
- [ ] Typecheck/lint passes

## Functional Requirements

- FR-1: The app displays a text input at the top of the page for adding items
- FR-2: Pressing Enter or clicking "Add" submits the item and clears the input
- FR-3: Each new item is sent to a Next.js API route that calls the Google Gemini API (free tier) to classify it into a predefined store section
- FR-4: The predefined sections are: Produce, Dairy, Meat & Seafood, Bakery, Frozen, Canned Goods, Snacks, Beverages, Condiments & Sauces, Pasta & Grains, Baking, Breakfast & Cereal, Household & Cleaning, Health & Personal Care, Other
- FR-5: Items are displayed grouped by their assigned section
- FR-6: Each item has a checkbox to mark it as checked/unchecked
- FR-7: Each item has a remove button to delete it from the list
- FR-8: The entire list is persisted in `localStorage` and restored on page load
- FR-9: A "Clear List" button removes all items after user confirmation
- FR-10: If the AI classification API fails or is unavailable, items default to the "Other" section

## Non-Goals

- No user accounts or authentication
- No database or server-side persistence
- No quantity or notes fields on items (simple name only for now)
- No manual category reassignment by the user
- No drag-and-drop reordering
- No sharing or collaboration features
- No offline/PWA support beyond local storage
- No custom or user-editable store sections

## Technical Considerations

- **Framework:** Next.js (already initialized)
- **AI Classification:** Use the Google Gemini API (free tier: 15 RPM, 1M tokens/day — more than sufficient for personal use). Install the `@google/generative-ai` npm package. The API key must be stored in an environment variable (`GEMINI_API_KEY`) and accessed only from a Next.js API route (not exposed to the client).
- **Environment Config:**
  - Store `GEMINI_API_KEY` in a `.env` file (gitignored)
  - Create a `.env.example` file with placeholder values (e.g., `GEMINI_API_KEY=your_api_key_here`) so other developers know which variables are required
  - Use `next.config.ts` to validate that required env vars are set at build/startup time (e.g., throw a clear error if `GEMINI_API_KEY` is missing)
- **Prompt Design:** The API route should send a prompt like: "Classify the following grocery item into one of these categories: [list]. Respond with only the category name. Item: [item name]"
- **Local Storage:** Use a single `localStorage` key (e.g., `grocery-list`) storing a JSON array of item objects: `{ id, name, section, checked }`
- **Styling:** Use whatever CSS approach is already configured in the Next.js app (likely Tailwind CSS based on default setup)

## Success Metrics

- User can add an item and see it categorized in under 2 seconds
- Items persist correctly across page refreshes
- AI categorization accuracy is reasonable (>80% of common grocery items land in the correct section)
- The app is usable on mobile screens

## Open Questions

- Should checked items be moved to the bottom of their section or stay in place?
- Should there be a way to "uncheck all" for reusing a list on the next shopping trip?
