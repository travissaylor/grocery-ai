# PRD: Item Name Autocomplete

## Introduction

Add an autocomplete dropdown to the item name input field that suggests items as the user types. Suggestions combine a built-in list of common grocery items with the user's personal history, prioritized by frequency of use. This reduces typing effort and speeds up list creation.

## Goals

- Reduce time to add items by minimizing keystrokes
- Surface frequently purchased items for quick selection
- Provide helpful suggestions even for first-time users via a built-in common items list
- Support offline usage with locally-stored suggestions
- Maintain the existing simple, clean UI

## User Stories

### US-001: Create autocomplete data source

**Description:** As a developer, I need a combined data source of common grocery items and user history with frequency tracking for the autocomplete feature.

**Acceptance Criteria:**

- [ ] Create `lib/autocomplete.ts` with a predefined list of 100-200 common grocery items
- [ ] Each item has: `name` (string), `category` (optional SectionKey for future use)
- [ ] Common items are bundled with the app (no network request needed)
- [ ] Typecheck passes

### US-002: Track item usage frequency in localStorage

**Description:** As a developer, I need to track how often each item is added so we can prioritize frequently used items in suggestions.

**Acceptance Criteria:**

- [ ] Create `ITEM_FREQUENCY_KEY` localStorage key to store item frequency map
- [ ] Map structure: `{ [itemName: string]: number }` where number is usage count
- [ ] Load frequency map on app init via `loadItemFrequency()` function
- [ ] Save frequency map on changes via `saveItemFrequency()` function
- [ ] Increment frequency count when user adds an item (case-insensitive normalization)
- [ ] Typecheck passes

### US-003: Build autocomplete suggestion engine

**Description:** As a developer, I need a function that returns filtered, ranked suggestions based on user input.

**Acceptance Criteria:**

- [ ] Create `getSuggestions(input: string, frequency: ItemFrequency): string[]` function
- [ ] Returns empty array if input length < 2 characters
- [ ] Filters items where item name starts with input (case-insensitive)
- [ ] Combines common items + user history items (deduplicated)
- [ ] Sorts by: (1) frequency descending, (2) alphabetically for ties
- [ ] Returns max 8 suggestions
- [ ] Typecheck passes

### US-004: Add autocomplete dropdown UI component

**Description:** As a user, I want to see a dropdown of matching items as I type so I can quickly select what I need.

**Acceptance Criteria:**

- [ ] Dropdown appears below input field when 2+ characters typed and matches exist
- [ ] Dropdown is absolutely positioned, scrolling if needed (max-height ~250px)
- [ ] Each suggestion shows the item name
- [ ] Highlighted suggestion has distinct background color
- [ ] Dropdown hidden when input is empty or no matches
- [ ] Matches existing app styling (rounded corners, shadows, colors)
- [ ] Typecheck passes

### US-005: Implement keyboard navigation

**Description:** As a user, I want to use keyboard arrows and Enter to navigate and select suggestions without touching the mouse.

**Acceptance Criteria:**

- [ ] Pressing Down arrow moves highlight to next suggestion (or first if none selected)
- [ ] Pressing Up arrow moves highlight to previous suggestion (or last if at top)
- [ ] Pressing Enter with a highlighted suggestion selects it and adds the item
- [ ] Pressing Enter without highlight uses typed input (existing behavior)
- [ ] Pressing Escape closes dropdown without selecting
- [ ] Typecheck passes

### US-006: Implement mouse/touch selection

**Description:** As a user, I want to click or tap a suggestion to select it.

**Acceptance Criteria:**

- [ ] Clicking a suggestion fills input with that item name
- [ ] Clicking also immediately adds the item (same as pressing Enter)
- [ ] Hovering a suggestion highlights it
- [ ] Dropdown closes after selection
- [ ] Typecheck passes

### US-007: Handle focus and click-outside behavior

**Description:** As a user, I want the dropdown to close when I click elsewhere or leave the input field.

**Acceptance Criteria:**

- [ ] Clicking outside the dropdown/input closes the dropdown
- [ ] Tabbing away from input closes dropdown
- [ ] Dropdown reopens if user refocuses and types matching input
- [ ] Typecheck passes

## Functional Requirements

- FR-1: System must show autocomplete suggestions when user types 2+ characters in the item input field
- FR-2: Suggestions must be drawn from both common grocery items and user's previously added items
- FR-3: Suggestions must be ranked by frequency (most-used first), then alphabetically
- FR-4: System must track and persist item usage frequency in localStorage
- FR-5: Dropdown must support keyboard navigation (Up/Down arrows, Enter to select, Escape to close)
- FR-6: Dropdown must support mouse/touch interaction (click to select, hover to highlight)
- FR-7: System must close dropdown when user clicks outside, tabs away, or presses Escape
- FR-8: Maximum of 8 suggestions shown at once
- FR-9: All data must be stored locally (no network requests for autocomplete)
- FR-10: Item names must be normalized to lowercase for frequency tracking (case-insensitive)

## Non-Goals

- No autocomplete for category/section field (only item name)
- No fuzzy matching (only prefix matching: "mil" matches "Milk", not "Almond Milk")
- No server-side storage or sync of autocomplete data
- No ability to delete items from suggestion history
- No multi-word search (e.g., "peanut butter" only matches items starting with "peanut")
- No item editing or renaming suggestions

## Technical Considerations

- **Performance:** Suggestion filtering runs on every keystroke; keep common items list lean (~150 items)
- **LocalStorage:** Add new key `grocery-list-item-frequency` alongside existing `grocery-list` key
- **Accessibility:** Ensure dropdown is screen-reader friendly with appropriate ARIA attributes
- **Mobile:** Ensure touch targets are large enough (min 44px height per suggestion)
- **Existing patterns:** Follow the app's CSS variable conventions (`var(--color-primary)`, `var(--card-bg)`, etc.)
- **React refs:** Use `useRef` for tracking highlighted index and `useCallback` for stable event handlers
- **Item normalization:** Store common items in singular form only (e.g., "Apple" not "Apples"); normalize to lowercase for deduplication
- **Frequency persistence:** Usage frequency persists indefinitely (no expiration/reset)
