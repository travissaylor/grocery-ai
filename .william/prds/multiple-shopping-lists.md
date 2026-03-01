# PRD: Multiple Shopping Lists

## Introduction

Add support for multiple shopping lists so users can separate shopping contexts (e.g., weekly groceries, Costco runs, party planning, camping trips). Each list can be visually identified with icons and colors, switched between quickly, archived for future reference, and duplicated as a starting point for new lists.

## Goals

- Allow users to create unlimited named shopping lists
- Provide visual differentiation via icons and colors for each list
- Enable quick switching between active lists via dropdown
- Support archiving lists to keep them for reference or later reactivation
- Allow duplicating existing lists to reuse as templates
- Maintain backward compatibility with existing single-list data

## User Stories

### US-001: Add list model and migrate data

**Description:** As a developer, I need to update the data model to support multiple lists and migrate existing single-list data so current users don't lose their items.

**Acceptance Criteria:**

- [ ] Create `ShoppingList` type with: `id`, `name`, `icon`, `color`, `items: GroceryItem[]`, `isArchived`, `createdAt`, `updatedAt`
- [ ] Create `LIST_STORAGE_KEY` constant for the new storage format
- [ ] Write migration function that converts old `grocery-list` format to new format with default "My List"
- [ ] Migration runs on first load when old format detected but new format doesn't exist
- [ ] Typecheck/lint passes

### US-002: Create list management store/hook

**Description:** As a developer, I need a centralized way to manage list state so components can access and modify lists consistently.

**Acceptance Criteria:**

- [ ] Create `useLists` hook or context with: `lists`, `activeListId`, `activeList`
- [ ] Provide functions: `createList`, `updateList`, `deleteList`, `archiveList`, `restoreList`, `duplicateList`, `setActiveList`
- [ ] Load lists from localStorage on mount
- [ ] Save lists to localStorage on any change
- [ ] Default to first non-archived list if `activeListId` not set
- [ ] Typecheck/lint passes

### US-003: Display list switcher dropdown in header

**Description:** As a user, I want to see which list I'm viewing and quickly switch to other lists from the header.

**Acceptance Criteria:**

- [ ] Add list switcher dropdown to header (left of or below app title)
- [ ] Dropdown shows current list name with icon and color indicator
- [ ] Clicking opens menu showing all non-archived lists
- [ ] Each list in menu shows icon, name, and item count
- [ ] Clicking a list switches to it immediately
- [ ] Dropdown includes "Create new list" and "View archived" options
- [ ] Active list persists in localStorage (survives page refresh)
- [ ] Typecheck/lint passes

### US-004: Create new list modal

**Description:** As a user, I want to create a new list with a name, icon, and color so I can organize my shopping by context.

**Acceptance Criteria:**

- [ ] "Create new list" opens modal with name input, icon picker, and color picker
- [ ] Name input: required, max 50 characters, trims whitespace
- [ ] Icon picker: grid of 20 predefined icons (e.g., cart, store, party, home, star, heart, etc.)
- [ ] Color picker: row of 10 predefined colors (visually distinct)
- [ ] Default values: icon=cart, color=first color, name=empty (must enter)
- [ ] "Create" button disabled until name entered
- [ ] On create: add list, set as active, close modal
- [ ] Typecheck/lint passes

### US-005: Edit list details

**Description:** As a user, I want to rename a list or change its icon/color to better identify it.

**Acceptance Criteria:**

- [ ] Add "Edit list" option in list switcher dropdown (for active list)
- [ ] Opens modal pre-filled with current name, icon, color
- [ ] Same UI as create modal but with "Save" and "Delete" buttons
- [ ] Changes save immediately on "Save" click
- [ ] Typecheck/lint passes

### US-006: Archive and restore lists

**Description:** As a user, I want to archive a completed list to hide it from the main view, and restore it later if needed.

**Acceptance Criteria:**

- [ ] "Archive list" option in list switcher dropdown (for active list)
- [ ] Archiving: sets `isArchived: true`, automatically switches to next available list
- [ ] If no non-archived lists remain, shows empty state with "Create a list" prompt
- [ ] "View archived" in dropdown opens archived lists view/modal
- [ ] Archived view shows all archived lists with date archived
- [ ] Each archived list has "Restore" and "Delete permanently" buttons
- [ ] Restore: sets `isArchived: false`, optionally switches to it
- [ ] Typecheck/lint passes

### US-007: Permanently delete archived lists

**Description:** As a user, I want to permanently delete an archived list I no longer need.

**Acceptance Criteria:**

- [ ] "Delete permanently" button on each archived list
- [ ] Clicking shows confirmation dialog: "Permanently delete '[list name]'? This cannot be undone."
- [ ] Confirm removes list entirely from storage
- [ ] Cancel closes dialog without action
- [ ] Typecheck/lint passes

### US-008: Duplicate an existing list

**Description:** As a user, I want to duplicate a list (e.g., "Weekly Groceries Template") as a starting point for a new shopping trip.

**Acceptance Criteria:**

- [ ] "Duplicate" option in list switcher dropdown (for active list)
- [ ] Creates new list with: same items (preserving checked/unchecked state), same icon/color
- [ ] New list name: "[Original Name] (Copy)"
- [ ] New list is set as active after creation
- [ ] Typecheck/lint passes

### US-009: Update autocomplete to be list-aware

**Description:** As a user, I want autocomplete suggestions to be based on items across all my lists, not just the current one.

**Acceptance Criteria:**

- [ ] Update `loadItemFrequency`/`saveItemFrequency` to aggregate items from all lists
- [ ] Autocomplete shows suggestions based on all historical items
- [ ] Typecheck/lint passes

## Functional Requirements

- FR-1: The system must store multiple shopping lists in localStorage with structure: `{ lists: ShoppingList[], activeListId: string | null }`
- FR-2: Each list must have: id (UUID), name (string), icon (predefined key), color (predefined key), items (array), isArchived (boolean), timestamps
- FR-3: On first load with legacy data, the system must migrate existing items to a default list named "My List" with default icon/color
- FR-4: The system must display a list switcher in the header showing the active list name with visual indicators
- FR-5: The list switcher must allow selecting any non-archived list to make it active
- FR-6: The system must provide a modal to create new lists with name, icon, and color selection
- FR-7: The system must allow editing list name, icon, and color
- FR-8: The system must allow archiving lists (hiding from main view while preserving data)
- FR-9: The system must provide a view of archived lists with restore and delete options
- FR-10: The system must allow permanent deletion of archived lists with confirmation
- FR-11: The system must allow duplicating a list, preserving all item states (checked/unchecked)
- FR-12: Duplicated list names must append "(Copy)" to the original name
- FR-13: The system must persist the active list ID across sessions
- FR-14: Autocomplete suggestions must aggregate item frequency across all lists

## Non-Goals (Out of Scope)

- No sharing or collaboration features (single-user only)
- No custom icon uploads or arbitrary color selection (predefined options only)
- No list sorting/reordering in the dropdown
- No automatic list cleanup or expiration
- No cloud sync or cross-device support
- No list categories or folders
- No bulk operations across multiple lists

## Technical Considerations

### Data Model Changes

New types in `lib/types.ts`:

```typescript
export type ListIcon =
  | "cart" | "store" | "home" | "party" | "star" | "heart"
  | "camping" | "work" | "gift" | "restaurant" | "coffee"
  | "plane" | "car" | "fitness" | "pet" | "baby" | "garden"
  | "book" | "music" | "celebration";

export type ListColor =
  | "blue" | "green" | "purple" | "orange" | "pink"
  | "teal" | "red" | "yellow" | "indigo" | "gray";

export type ShoppingList = {
  id: string;
  name: string;
  icon: ListIcon;
  color: ListColor;
  items: GroceryItem[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ListsStorage = {
  lists: ShoppingList[];
  activeListId: string | null;
};
```

### Migration Strategy

1. Check for existence of new storage key (`grocery-lists-v2`)
2. If not present, check for old key (`grocery-list`)
3. If old data exists, create new storage with single "My List" containing migrated items
4. Old data remains until explicitly cleared (defensive approach)

### Icon/Color Definitions

Create `lib/list-assets.ts` with:
- `LIST_ICONS: { key: string; svg: ReactNode }[]`
- `LIST_COLORS: { key: string; hex: string; tailwind: string }[]`

### Storage Keys

- Lists data: `grocery-lists-v2`
- Item frequency (autocomplete): `grocery-item-frequency` (existing, update logic)
- Legacy: `grocery-list` (read-only for migration)

### Component Structure

- `components/ListSwitcher.tsx` - Dropdown in header
- `components/ListModal.tsx` - Create/edit list modal
- `components/ArchivedListsModal.tsx` - View/restore/delete archived
- `lib/useLists.ts` - Hook for list state management

## Success Metrics

- Users can switch between lists in under 2 clicks
- All existing user data preserved after migration
- No performance regression when managing 20+ lists
- Archived lists clearly distinguished from active lists

## Open Questions

1. Should there be a limit on the number of active (non-archived) lists displayed? (Current assumption: no limit)
2. Should duplicated list items have new UUIDs or preserve original IDs? (Current assumption: new UUIDs for clean slate)
3. Should the autocomplete frequency data persist when a list is permanently deleted? (Current assumption: yes, frequency is historical)
