<prd>
# PRD: Audit Issue Fixes

## Introduction

A browser-based audit of the grocery list app identified several issues ranging from UX problems to silent error handling. This PRD covers fixes for five issues: duplicate item detection, replacing native `window.confirm()` dialogs with custom modals, adding archive confirmation, improving API error handling for categorization failures, and hardening the categorize prompt against injection.

## Goals

- Prevent users from accidentally adding duplicate items to their list
- Replace all native browser dialogs (`window.confirm`) with custom modals that match the app's design
- Add a confirmation step before archiving a list to prevent accidental data loss
- Surface categorization failures to the user so they can manually assign a section
- Harden the AI categorization prompt to reduce prompt injection effectiveness

## User Stories

### US-001: Create reusable confirmation modal component

**Description:** As a developer, I need a reusable confirmation modal component so that Clear List and Archive actions use a styled dialog consistent with the app's existing modals (ListModal, ArchivedListsModal).

**Acceptance Criteria:**

- [ ] New `ConfirmModal` component created in `components/`
- [ ] Accepts props: `isOpen`, `onConfirm`, `onCancel`, `title`, `message`, `confirmLabel`, `cancelLabel`, `variant` (e.g. "danger" for destructive actions)
- [ ] Visually matches the existing modal style (backdrop overlay, card background, rounded corners, same spacing/typography)
- [ ] Supports dark mode via existing CSS variables
- [ ] Closes on Escape key and backdrop click (same pattern as ListModal)
- [ ] Danger variant shows a red confirm button to indicate destructive action
- [ ] Animations match existing modals (fade in/out)
- [ ] Typecheck/lint passes

### US-002: Replace window.confirm() for Clear List

**Description:** As a user, I want the Clear List confirmation to look like part of the app so the experience feels polished and consistent.

**Acceptance Criteria:**

- [ ] Clear List button opens the new `ConfirmModal` instead of `window.confirm()`
- [ ] Modal title says "Clear List" and message says "Remove all items from this list?" (or similar)
- [ ] Uses danger variant (red confirm button)
- [ ] Confirm clears the list, cancel dismisses the modal
- [ ] No `window.confirm()` calls remain in the codebase
- [ ] Typecheck/lint passes

**Verification:** Use the `agent-browser` skill to walk through the UI and confirm:
1. Add a few items to the list
2. Click the Clear List button
3. Verify a styled custom modal appears (not a native browser dialog)
4. Click cancel and verify the list is unchanged
5. Click Clear List again, then confirm, and verify the list is emptied

### US-003: Add confirmation before archiving a list

**Description:** As a user, I want a confirmation dialog before archiving a list so I don't accidentally archive a list I'm actively using.

**Acceptance Criteria:**

- [ ] Clicking "Archive" on a list in the ListSwitcher opens the `ConfirmModal`
- [ ] Modal title says "Archive List" and message includes the list name (e.g. "Archive 'Weekly Groceries'? You can restore it later from archived lists.")
- [ ] Confirm archives the list, cancel dismisses the modal
- [ ] Typecheck/lint passes

**Verification:** Use the `agent-browser` skill to walk through the UI and confirm:
1. Open the list switcher dropdown
2. Click the Archive action on a list
3. Verify a styled confirmation modal appears with the list name
4. Click cancel and verify the list is still active
5. Click Archive again, confirm, and verify the list is archived

### US-004: Detect and warn on duplicate items

**Description:** As a user, I want to be warned when I try to add an item that's already on my list so I don't end up with duplicates.

**Acceptance Criteria:**

- [ ] When the user tries to add an item whose name (case-insensitive, trimmed) matches an existing unchecked item, the add is blocked
- [ ] An inline warning message appears near the input field (e.g. "'Milk' is already on your list")
- [ ] The warning disappears after 3 seconds or when the user changes the input text
- [ ] If the matching item is already checked off, allow adding it (user may want to re-buy)
- [ ] The duplicate check ignores leading/trailing whitespace and is case-insensitive
- [ ] Typecheck/lint passes

**Verification:** Use the `agent-browser` skill to walk through the UI and confirm:
1. Add "Milk" to the list
2. Try to add "milk" again (lowercase) and verify the add is blocked with a warning message
3. Try to add "  Milk  " (with spaces) and verify it's also blocked
4. Check off the existing "Milk" item, then add "Milk" again and verify it's allowed this time
5. Verify the warning message disappears after a few seconds or when typing something new

### US-005: Surface categorization failures to the user

**Description:** As a user, when AI categorization fails I want to know about it and be able to manually pick a category, rather than having my item silently dumped into "Other."

**Acceptance Criteria:**

- [ ] When the `/api/categorize` endpoint returns an error or the client-side fetch fails, the item is still added to the list
- [ ] The item shows a visual indicator that categorization failed (e.g. a small warning icon or badge)
- [ ] A brief inline message or toast tells the user the item couldn't be auto-categorized
- [ ] Tapping/clicking on the failed-categorization indicator opens a section picker so the user can manually assign a category
- [ ] Once the user manually assigns a section, the failure indicator is removed
- [ ] The API route continues to return `{ section: "other" }` as fallback but also includes an `{ error: true }` flag so the client can distinguish between "AI chose other" and "categorization failed"
- [ ] Typecheck/lint passes

**Verification:** Use the `agent-browser` skill to walk through the UI and confirm:
1. Simulate a categorization failure (e.g. temporarily break the API key or disconnect network)
2. Add an item and verify it appears on the list with a visual failure indicator
3. Verify a message is shown telling the user the item couldn't be auto-categorized
4. Click the failure indicator and verify a section picker appears
5. Select a section and verify the item moves to the correct section and the failure indicator is removed

### US-006: Harden categorization prompt against injection

**Description:** As a developer, I want to make the categorization prompt more resilient to prompt injection so that user-crafted input is less likely to manipulate the AI's output.

**Acceptance Criteria:**

- [ ] The user's item text is clearly delimited in the prompt (e.g. wrapped in XML tags like `<item>milk</item>` or triple quotes) rather than simply concatenated
- [ ] The prompt includes an instruction to ignore any instructions within the item text and only classify it
- [ ] The system prompt or preamble reinforces that the model should only output a valid section name
- [ ] Existing categorization behavior is unchanged for normal items (Produce, Dairy, etc. still categorize correctly)
- [ ] Typecheck/lint passes

## Functional Requirements

- FR-1: Create a `ConfirmModal` component in `components/` that accepts `isOpen`, `onConfirm`, `onCancel`, `title`, `message`, `confirmLabel` (default "Confirm"), `cancelLabel` (default "Cancel"), and `variant` ("default" | "danger") props
- FR-2: The `ConfirmModal` renders a backdrop overlay and centered card, matching the visual style of `ListModal` and `ArchivedListsModal`
- FR-3: Replace the `window.confirm("Clear all items?")` call in `app/page.tsx` (~line 416) with the `ConfirmModal`
- FR-4: Add a `ConfirmModal` trigger before `archiveList()` is called in `ListSwitcher.tsx`
- FR-5: Before adding an item, check if any unchecked item in the current list has the same name (case-insensitive, trimmed). If so, block the add and display an inline warning below the input
- FR-6: The inline duplicate warning auto-dismisses after 3 seconds or on input change
- FR-7: Modify `app/api/categorize/route.ts` to return `{ section: "other", error: true }` on failure instead of just `{ section: "other" }`
- FR-8: In the client-side categorization handler (`app/page.tsx`), detect the `error` flag and mark the item as needing manual categorization
- FR-9: Show a visual indicator (warning icon/badge) on items that failed categorization
- FR-10: Provide a section picker UI when the user taps the failed-categorization indicator on an item
- FR-11: Show a brief message to the user when categorization fails (e.g. toast or inline note)
- FR-12: Wrap user input in the categorize prompt with clear delimiters (e.g. `<item>...</item>`) and add an instruction to ignore any instructions within the item text
- FR-13: Ensure the AI prompt still instructs the model to output only a valid section key

## Non-Goals

- Not fixing list name truncation in the switcher (issue #6 from audit — skipped)
- Not adding a full toast/notification system — use minimal inline messages
- Not adding quantity tracking or merging duplicate items
- Not adding retry logic for failed categorizations — manual assignment is sufficient
- Not changing the categorization AI model or provider
- Not refactoring the page component architecture

## Technical Considerations

- **Existing modal pattern:** `ListModal` and `ArchivedListsModal` use custom div-based modals with backdrop click and Escape key handling. The new `ConfirmModal` should follow the same pattern for consistency.
- **Styling:** The app uses Tailwind CSS v4 with CSS custom properties for theming (dark mode). The new modal must use these variables.
- **State for modals:** The page component and `ListSwitcher` already manage `isOpen`-style boolean state for modals. Follow the same pattern.
- **API response shape:** The categorize route currently returns `{ section: SectionKey }`. Adding an `error` field is a backward-compatible change. The client-side handler in `page.tsx` (~lines 282-310, the `categorizeItem` function) will need to check for this flag.
- **Section picker:** The list of valid sections is defined in `lib/sections.ts`. The picker should use these values.
- **Duplicate detection:** Runs against `items` state array in `page.tsx`. Compare using `item.name.trim().toLowerCase()`.

## Success Metrics

- Zero instances of `window.confirm()` in the codebase
- Duplicate items cannot be added to the same list (when unchecked)
- Users are informed when categorization fails and can manually fix it
- All modals visually consistent with existing app design
- No regressions in existing functionality (add, check, remove, undo, archive, restore)

## Open Questions

- Should the duplicate warning also trigger when the item name partially matches (e.g. "milk" vs "whole milk"), or only on exact match? (Current spec: exact match only, case-insensitive)
- Should the section picker for failed categorization be a dropdown, a bottom sheet, or a small modal? (Suggest: dropdown/popover anchored to the item, consistent with how other pickers work in the app)
</prd>
