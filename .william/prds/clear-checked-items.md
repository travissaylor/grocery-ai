# PRD: Clear Checked Items

## Introduction

Add a "Clear Checked" button that removes only the checked-off (purchased) items from the current grocery list. Currently, the app only offers a "Clear List" button that removes all items. Users who have checked off items as they shop need a way to clean up their list without losing unchecked items they still need to buy.

## Goals

- Allow users to remove all checked items from the active list in a single action
- Require confirmation before clearing to prevent accidental data loss
- Keep the existing "Clear List" (clear all) functionality intact
- Maintain consistency with existing UI patterns and animations

## User Stories

### US-001: Clear checked items button

**Description:** As a user, I want a "Clear Checked" button so that I can remove purchased items without losing items I still need to buy.

**Acceptance Criteria:**

- [ ] A "Clear Checked" button appears alongside the existing "Clear List" button
- [ ] The button is only visible when at least one item is checked
- [ ] Clicking the button opens a confirmation modal (danger variant) asking "Remove all checked items from this list?"
- [ ] On confirmation, all checked items are removed from the list
- [ ] Unchecked items remain in the list, unchanged
- [ ] Items are removed with the existing fade-out animation
- [ ] The list persists the updated items to localStorage
- [ ] Typecheck passes

### US-002: Button disabled/hidden states

**Description:** As a user, I want the "Clear Checked" button to only appear when relevant so the UI stays clean.

**Acceptance Criteria:**

- [ ] The "Clear Checked" button is hidden when no items are checked
- [ ] The "Clear Checked" button is hidden when the list is empty
- [ ] The "Clear List" button continues to appear whenever the list has any items (existing behavior unchanged)
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Add a "Clear Checked" button next to the existing "Clear List" button in the list controls area
- FR-2: The "Clear Checked" button must only be visible when at least one item has `checked: true`
- FR-3: Clicking "Clear Checked" must open a `ConfirmModal` with variant "danger", title "Clear Checked Items", and message "Remove all checked items from this list?"
- FR-4: On confirmation, remove all items where `checked === true` from the `items` state array
- FR-5: Apply the existing fade-out removal animation to cleared items before removing them from state
- FR-6: Updated items array must be persisted to localStorage via `updateListItems()`
- FR-7: The existing "Clear List" button and its behavior must remain unchanged

## Non-Goals

- No undo/toast support for this action — confirmation modal is sufficient
- No changes to autocomplete frequency tracking — frequency is already recorded on item add
- No special empty-state message after clearing — existing empty-list behavior applies
- No batch undo (restoring all cleared items at once)
- No changes to the "Clear List" button behavior or placement

## Technical Considerations

- Reuse the existing `ConfirmModal` component with `variant="danger"`
- Use the existing `removingItems` state and fade-out animation pattern from `removeItem()` for visual consistency
- The checked item count can be derived from `items.filter(i => i.checked).length` — no new state needed for button visibility
- All changes are confined to `app/page.tsx` — no new components or API routes required

## Success Metrics

- Users can clear checked items in 2 clicks (button + confirm)
- No regression in existing "Clear List" functionality
- No regression in list persistence or item animations

## Open Questions

- None at this time.
