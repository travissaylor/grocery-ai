import type { GroceryItem, ListsStorage, ShoppingList } from "./types";

// Storage keys
export const LIST_STORAGE_KEY = "grocery-lists-v2";
export const LEGACY_STORAGE_KEY = "grocery-list";

// Default values for new lists
export const DEFAULT_LIST_ICON = "cart";
export const DEFAULT_LIST_COLOR = "blue";
export const DEFAULT_LIST_NAME = "My List";

/**
 * Creates a new ShoppingList with the given parameters
 */
export function createShoppingList(
  name: string,
  items: GroceryItem[] = [],
  icon: ShoppingList["icon"] = DEFAULT_LIST_ICON,
  color: ShoppingList["color"] = DEFAULT_LIST_COLOR,
  isArchived = false
): ShoppingList {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    icon,
    color,
    items,
    isArchived,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Checks if the legacy storage format exists
 */
function legacyStorageExists(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LEGACY_STORAGE_KEY) !== null;
}

/**
 * Checks if the new storage format exists
 */
function newStorageExists(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LIST_STORAGE_KEY) !== null;
}

/**
 * Loads items from the legacy storage format
 */
function loadLegacyItems(): GroceryItem[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved) as GroceryItem[];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Migrates legacy single-list format to the new multi-list format.
 * Returns the new ListsStorage structure if migration occurred, null otherwise.
 *
 * Migration only runs when:
 * - Old format (grocery-list) exists
 * - New format (grocery-lists-v2) does NOT exist
 */
export function migrateToListStorage(): ListsStorage | null {
  // Only run in browser
  if (typeof window === "undefined") return null;

  // Check if migration is needed
  if (!legacyStorageExists() || newStorageExists()) {
    return null;
  }

  // Load legacy items
  const legacyItems = loadLegacyItems();

  // Create new storage structure with a default list
  const defaultList = createShoppingList(
    DEFAULT_LIST_NAME,
    legacyItems,
    DEFAULT_LIST_ICON,
    DEFAULT_LIST_COLOR
  );

  const newStorage: ListsStorage = {
    lists: [defaultList],
    activeListId: defaultList.id,
  };

  // Save the new format (old data is preserved in legacy key for safety)
  localStorage.setItem(LIST_STORAGE_KEY, JSON.stringify(newStorage));

  return newStorage;
}

/**
 * Loads the lists storage, running migration if needed
 */
export function loadListsStorage(): ListsStorage | null {
  if (typeof window === "undefined") return null;

  // Try migration first
  const migrated = migrateToListStorage();
  if (migrated) {
    return migrated;
  }

  // Load existing new format
  const saved = localStorage.getItem(LIST_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved) as ListsStorage;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Saves the lists storage to localStorage
 */
export function saveListsStorage(storage: ListsStorage): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LIST_STORAGE_KEY, JSON.stringify(storage));
}
