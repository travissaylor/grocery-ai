"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ShoppingList, ListsStorage, ListIcon, ListColor } from "./types";
import {
  loadListsStorage,
  saveListsStorage,
  createShoppingList,
  DEFAULT_LIST_ICON,
  DEFAULT_LIST_COLOR,
} from "./list-storage";

export type UseListsReturn = {
  lists: ShoppingList[];
  activeListId: string | null;
  activeList: ShoppingList | null;
  createList: (name: string, icon?: ListIcon, color?: ListColor) => ShoppingList;
  updateList: (id: string, updates: Partial<Pick<ShoppingList, "name" | "icon" | "color">>) => void;
  deleteList: (id: string) => void;
  archiveList: (id: string) => void;
  restoreList: (id: string) => void;
  duplicateList: (id: string) => ShoppingList | null;
  setActiveList: (id: string | null) => void;
};

/**
 * Loads and validates the initial lists storage state.
 * Ensures activeListId points to a valid non-archived list.
 */
function getInitialStorage(): ListsStorage {
  const loaded = loadListsStorage();
  if (!loaded) {
    return { lists: [], activeListId: null };
  }

  // Ensure activeListId points to a valid non-archived list
  const nonArchivedLists = loaded.lists.filter((list) => !list.isArchived);
  if (loaded.activeListId && !nonArchivedLists.some((l) => l.id === loaded.activeListId)) {
    // Active list is archived or doesn't exist, default to first non-archived
    loaded.activeListId = nonArchivedLists.length > 0 ? nonArchivedLists[0].id : null;
  } else if (!loaded.activeListId && nonArchivedLists.length > 0) {
    // No active list set, default to first non-archived
    loaded.activeListId = nonArchivedLists[0].id;
  }

  return loaded;
}

/**
 * Hook for managing multiple shopping lists.
 * Handles loading from localStorage, saving changes, and provides
 * CRUD operations for lists.
 */
export function useLists(): UseListsReturn {
  const [storage, setStorage] = useState<ListsStorage>(getInitialStorage);
  const isLoaded = useRef(false);

  // Mark as loaded after first render
  useEffect(() => {
    isLoaded.current = true;
  }, []);

  // Save to localStorage whenever storage changes (after initial load)
  useEffect(() => {
    if (isLoaded.current) {
      saveListsStorage(storage);
    }
  }, [storage]);

  // Get the active list
  const activeList =
    storage.activeListId !== null
      ? storage.lists.find((list) => list.id === storage.activeListId) ?? null
      : null;

  // Create a new list
  const createList = useCallback(
    (name: string, icon: ListIcon = DEFAULT_LIST_ICON, color: ListColor = DEFAULT_LIST_COLOR): ShoppingList => {
      const newList = createShoppingList(name.trim(), [], icon, color);
      setStorage((prev) => ({
        lists: [...prev.lists, newList],
        activeListId: newList.id,
      }));
      return newList;
    },
    []
  );

  // Update list properties (name, icon, color)
  const updateList = useCallback(
    (id: string, updates: Partial<Pick<ShoppingList, "name" | "icon" | "color">>) => {
      setStorage((prev) => ({
        ...prev,
        lists: prev.lists.map((list) =>
          list.id === id
            ? {
                ...list,
                ...updates,
                name: updates.name !== undefined ? updates.name.trim() : list.name,
                updatedAt: new Date().toISOString(),
              }
            : list
        ),
      }));
    },
    []
  );

  // Permanently delete a list
  const deleteList = useCallback((id: string) => {
    setStorage((prev) => {
      const newLists = prev.lists.filter((list) => list.id !== id);
      let newActiveListId = prev.activeListId;

      // If we deleted the active list, switch to another non-archived list
      if (prev.activeListId === id) {
        const nonArchivedLists = newLists.filter((list) => !list.isArchived);
        newActiveListId = nonArchivedLists.length > 0 ? nonArchivedLists[0].id : null;
      }

      return {
        lists: newLists,
        activeListId: newActiveListId,
      };
    });
  }, []);

  // Archive a list (hide from main view)
  const archiveList = useCallback((id: string) => {
    setStorage((prev) => {
      const newLists = prev.lists.map((list) =>
        list.id === id
          ? { ...list, isArchived: true, updatedAt: new Date().toISOString() }
          : list
      );

      // If we archived the active list, switch to another non-archived list
      let newActiveListId = prev.activeListId;
      if (prev.activeListId === id) {
        const nonArchivedLists = newLists.filter((list) => !list.isArchived);
        newActiveListId = nonArchivedLists.length > 0 ? nonArchivedLists[0].id : null;
      }

      return {
        lists: newLists,
        activeListId: newActiveListId,
      };
    });
  }, []);

  // Restore an archived list
  const restoreList = useCallback((id: string) => {
    setStorage((prev) => ({
      ...prev,
      lists: prev.lists.map((list) =>
        list.id === id
          ? { ...list, isArchived: false, updatedAt: new Date().toISOString() }
          : list
      ),
    }));
  }, []);

  // Duplicate a list with all its items
  const duplicateList = useCallback((id: string): ShoppingList | null => {
    const originalList = storage.lists.find((list) => list.id === id);
    if (!originalList) return null;

    // Create new items with new UUIDs, preserving checked state
    const duplicatedItems = originalList.items.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
    }));

    const newListName = `${originalList.name} (Copy)`;
    const newList = createShoppingList(
      newListName,
      duplicatedItems,
      originalList.icon,
      originalList.color
    );

    setStorage((prev) => ({
      lists: [...prev.lists, newList],
      activeListId: newList.id,
    }));

    return newList;
  }, [storage.lists]);

  // Set the active list
  const setActiveList = useCallback((id: string | null) => {
    setStorage((prev) => ({
      ...prev,
      activeListId: id,
    }));
  }, []);

  return {
    lists: storage.lists,
    activeListId: storage.activeListId,
    activeList,
    createList,
    updateList,
    deleteList,
    archiveList,
    restoreList,
    duplicateList,
    setActiveList,
  };
}
