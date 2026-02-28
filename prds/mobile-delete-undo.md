# PRD: Mobile-Friendly Item Deletion with Undo

## Introduction

Make the delete functionality accessible on mobile devices by replacing the hover-revealed delete button with an always-visible option. Add an undo toast that appears briefly after deletion, giving users a safety net for accidental deletions without requiring a confirmation dialog.

## Goals

- Make delete button visible and accessible on touch devices (no hover dependency)
- Add undo capability for accidental deletions
- Maintain smooth, polished UX with animations
- Keep the UI clean and not cluttered

## User Stories

### US-001: Display always-visible delete button

**Description:** As a mobile user, I want to see the delete button for each item without hovering, so I can delete items on my iPhone.

**Acceptance Criteria:**

- [ ] Delete button (X icon) is visible for each item without hover
- [ ] Delete button has adequate touch target size (min 44x44px per Apple HIG)
- [ ] Delete button is positioned to avoid accidental taps (not too close to checkbox)
- [ ] Typecheck/lint passes

### US-002: Add undo toast after deletion

**Description:** As a user, I want a brief opportunity to undo an accidental deletion, so I don't lose items I didn't mean to delete.

**Acceptance Criteria:**

- [ ] Toast/snackbar appears at bottom of screen after item deletion
- [ ] Toast shows "Item deleted" message with "Undo" button
- [ ] Toast auto-dismisses after 5 seconds
- [ ] Tapping "Undo" restores the deleted item to its original position
- [ ] If undo is triggered, toast dismisses immediately
- [ ] Toast supports dark mode styling
- [ ] Typecheck/lint passes

### US-003: Animate item removal with undo support

**Description:** As a user, I want smooth animations when items are deleted or restored, so the app feels polished.

**Acceptance Criteria:**

- [ ] Deleted items animate out (fade/slide) smoothly
- [ ] If undone, item animates back in to its original position
- [ ] Animations respect `prefers-reduced-motion` setting
- [ ] Typecheck/lint passes

### US-004: Handle multiple rapid deletions

**Description:** As a user who deletes multiple items quickly, I want each deletion tracked separately so I can undo specific items.

**Acceptance Criteria:**

- [ ] Each deletion shows its own toast (or toast updates with count)
- [ ] Undo restores only the most recently deleted item
- [ ] State properly tracks pending-undo items separate from main list
- [ ] Typecheck/lint passes

## Functional Requirements

- FR-1: Delete button must be always visible (remove `group-hover` or equivalent CSS dependency)
- FR-2: Delete button touch target must be minimum 44x44px
- FR-3: Tapping delete removes item from visible list and stores in "pending deletion" state
- FR-4: Toast component displays at bottom of viewport with message and undo action
- FR-5: Undo action restores item to its original list position
- FR-6: Pending deletion items are permanently removed after 5-second timeout
- FR-7: Toast must be dismissible by tapping outside or swiping (optional enhancement)
- FR-8: Remove the hover-only delete button implementation

## Non-Goals

- No confirmation dialog before deletion (toast undo is the safety mechanism)
- No bulk delete or multi-select functionality
- No swipe-to-delete gesture (may be added later)
- No persistent "trash" or deleted items history
- No changes to the "Clear List" functionality

## Technical Considerations

- **State Management:** Add `pendingDeletion` state to track items awaiting permanent removal
- **Toast Implementation:** Can use a simple animated div or a library like `sonner` or `react-hot-toast`
- **Position Restoration:** Store the item's original index when deleting to restore accurately
- **Accessibility:** Toast must be announced to screen readers (ARIA live region)
- **Animation:** Reuse existing fade-out animation; add fade-in for undo restoration
- **Mobile Testing:** Test on actual iOS Safari and verify touch targets

## Success Metrics

- Delete button is easily tappable on mobile devices
- Users can undo accidental deletions within 5 seconds
- No regression in desktop UX (delete still works with mouse)
- App remains performant with toast animations

## Open Questions

- Should the toast stack if multiple items are deleted rapidly, or just show "3 items deleted"?
- Should there be a max number of items in pending-deletion state?
