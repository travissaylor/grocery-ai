# PRD: Item Quantities on Grocery Lists

## Introduction

Add optional quantity and unit tracking to grocery list items. Users can associate a quantity (e.g., "2") and unit (e.g., "lbs") with any item, visible inline on the list. Quantities are stored separately from the item name to preserve AI categorization accuracy. The app also auto-parses common quantity patterns from the add-item input (e.g., "2 lbs chicken" becomes qty: 2, unit: "lbs", name: "chicken"). Items without a quantity continue to work exactly as they do today.

## Goals

- Allow users to optionally set a quantity and unit on any grocery item
- Display quantities inline on the list when present, without cluttering items that have none
- Provide auto-parsing of quantity from the add-item input for common patterns
- Provide a hybrid unit input with autocomplete suggestions from common units plus freeform text
- Keep the item name clean and separate from quantity data to preserve AI categorization accuracy
- Require zero migration — existing items simply have no quantity

## User Stories

### US-001: Add quantity and unit fields to the data model

**Description:** As a developer, I need to store quantity and unit separately from the item name so that quantity data persists and doesn't interfere with AI categorization.

**Acceptance Criteria:**

- [ ] `GroceryItem` type gains optional `quantity` field (number | null)
- [ ] `GroceryItem` type gains optional `unit` field (string | null)
- [ ] Existing items without these fields load and display correctly (backward compatible)
- [ ] Quantities persist in localStorage across page reloads
- [ ] When duplicating a list, quantity and unit copy to the new list
- [ ] Typecheck passes

### US-002: Display quantity inline on list items

**Description:** As a user, I want to see item quantities at a glance on the list so I know how much to buy without tapping into the item.

**Acceptance Criteria:**

- [ ] Items with quantity + unit display as: `Item Name · 2 lbs`
- [ ] Items with quantity only (no unit) display as: `Item Name · 3`
- [ ] Items with no quantity display as today: just the name, no separator or empty space
- [ ] Quantity display uses a muted/secondary text style to visually distinguish it from the item name
- [ ] Checked items retain and display their quantity
- [ ] Typecheck passes

### US-003: Add quantity and unit inputs to the add-item area

**Description:** As a user, I want to specify a quantity when adding a new item so I can capture amounts at the moment I think of them.

**Acceptance Criteria:**

- [ ] Small quantity (number) input field appears near the existing item name input
- [ ] Small unit input field with autocomplete suggestions from common units (lbs, oz, gallons, cups, bags, boxes, cans, bunches, heads, dozen, each)
- [ ] Unit input allows freeform text in addition to autocomplete suggestions
- [ ] Quantity and unit fields are optional — leaving them blank adds item with no quantity (same as today)
- [ ] Quantity field only accepts positive numbers (integer or decimal)
- [ ] Pressing Enter in any of the three fields (name, qty, unit) submits the item
- [ ] After adding an item, all three fields clear
- [ ] Typecheck passes

### US-004: Auto-parse quantity from item name input

**Description:** As a user, I want to type "2 lbs chicken" in the name field and have the app automatically extract the quantity so I don't have to use separate fields.

**Acceptance Criteria:**

- [ ] Parser recognizes patterns like: `2 lbs chicken`, `3 avocados`, `1.5 oz butter`, `12 eggs`
- [ ] On successful parse, the quantity and unit fields auto-populate and the item name field shows only the extracted name
- [ ] Parser is conservative — ambiguous inputs like "7up", "half and half", "100 grand bar" are treated as item names with no quantity extracted
- [ ] Parsing happens on submit (Enter key or add button), not as the user types
- [ ] User can override parsed values by manually editing the qty/unit fields before submitting
- [ ] If qty/unit fields are already filled when user submits, the manual values take precedence over any parsed values
- [ ] Only the item name (without quantity) is sent to the AI categorization API
- [ ] Typecheck passes

### US-005: Edit quantity on existing items

**Description:** As a user, I want to change the quantity on an item already on my list so I can update amounts without removing and re-adding the item.

**Acceptance Criteria:**

- [ ] Tapping/clicking on an item's quantity area opens an inline edit for quantity and unit
- [ ] If item has no quantity, tapping the item name area (or a dedicated "add qty" affordance) opens the quantity editor
- [ ] Edited quantity saves immediately (no separate save button needed)
- [ ] User can clear quantity to return the item to a "no quantity" state
- [ ] Tapping outside the edit area or pressing Enter closes the editor
- [ ] Works on both checked and unchecked items
- [ ] Typecheck passes

### US-006: Quantity does not affect duplicate detection

**Description:** As a user, if I try to add "milk" when "milk" is already on my list (even with a different quantity), I should see the existing duplicate warning and edit the existing item's quantity instead.

**Acceptance Criteria:**

- [ ] Duplicate detection uses item name only, ignoring quantity and unit
- [ ] Duplicate warning message still shows as today: `'milk' is already on your list`
- [ ] Auto-parsed names are used for duplicate detection (e.g., typing "2 lbs chicken" checks for "chicken", not "2 lbs chicken")
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Add optional `quantity` (number | null) and `unit` (string | null) fields to the `GroceryItem` type in `lib/types.ts`
- FR-2: Display quantity inline after the item name with a `·` separator when present (e.g., `Chicken breast · 2 lbs`). Use muted text styling for quantity.
- FR-3: Add a numeric quantity input and a unit text input with autocomplete near the existing item name input. Both fields are optional.
- FR-4: Provide a predefined list of common units for autocomplete: lbs, oz, gallons, cups, bags, boxes, cans, bunches, heads, dozen, each. Allow freeform text entry for custom units.
- FR-5: On item submission, if the quantity/unit fields are empty, attempt to parse quantity from the item name using conservative pattern matching (e.g., `<number> <unit> <name>` or `<number> <name>`).
- FR-6: The quantity parser must not extract quantity from known product names containing numbers (e.g., "7up", "V8"). Maintain a small exclusion list or use heuristics to avoid false positives.
- FR-7: Send only the clean item name (without quantity/unit) to the `/api/categorize` endpoint.
- FR-8: Allow inline editing of quantity and unit on existing list items by tapping/clicking the item row.
- FR-9: Duplicate detection continues to use item name only (case-insensitive, unchecked items), ignoring quantity and unit.
- FR-10: Checked items retain their quantity and unit values.
- FR-11: When duplicating a list via `duplicateList()`, copy quantity and unit to the new items.
- FR-12: Existing items in localStorage that lack quantity/unit fields should load without errors and display as items with no quantity.

## Non-Goals

- No unit conversion (e.g., won't convert 16 oz to 1 lb)
- No quantity arithmetic or merging when adding duplicates
- No quantity suggestions based on recipes or history
- No changes to the AI categorization prompt or model
- No quantity-aware autocomplete suggestions (autocomplete remains name-based only)
- No quantity field on the common items database in `autocomplete.ts`
- No real-time parsing preview as the user types — parsing only triggers on submit

## Technical Considerations

- **Data model change**: Adding optional fields to `GroceryItem` is backward compatible since TypeScript optional fields default to `undefined`. No migration needed — existing localStorage data loads as-is.
- **Parser module**: Create a dedicated `lib/parse-quantity.ts` module to keep parsing logic testable and isolated from the UI. This module should export a function like `parseQuantity(input: string): { quantity: number | null, unit: string | null, name: string }`.
- **Common units list**: Define in a shared constant (e.g., in `lib/units.ts` or alongside sections) so both the autocomplete and the parser reference the same list.
- **Categorization**: The `categorizeItem` function already receives `itemName` as a separate argument. No changes needed to the API route — just ensure the caller passes the clean name.
- **Item frequency / autocomplete**: The frequency system tracks by item name. Since names are now cleaned of quantities, autocomplete quality should improve.
- **Layout**: The add-item input area will become wider or need to stack on mobile. Consider responsive layout — quantity/unit fields may collapse below the name field on narrow screens.

## Success Metrics

- Users can add an item with quantity in a single input action (via auto-parse) or via explicit fields
- Items with quantities display clearly without visual clutter
- Items without quantities display exactly as they do today — no visual regression
- AI categorization accuracy is maintained or improved (names no longer contain quantity text)
- No increase in localStorage data size beyond the minimal quantity/unit fields

## Open Questions

- What is the exact responsive layout for the quantity/unit fields on mobile screens? Should they appear below the name input or inline?
- Should the unit autocomplete dropdown appear on focus or only after the user starts typing?
- Should the parser handle pluralization (e.g., "1 lb" vs "2 lbs" both mapping to the same unit)?
