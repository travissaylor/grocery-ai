import type { SectionKey } from "./sections";

export type GroceryItem = {
  id: string;
  name: string;
  section: SectionKey;
  checked: boolean;
  pendingCategorization?: boolean;
};

export type PendingCategorization = {
  itemId: string;
  itemName: string;
};

export type PendingDeletion = {
  item: GroceryItem;
  originalIndex: number;
};

// Multiple shopping lists types
export type ListIcon =
  | "cart"
  | "store"
  | "home"
  | "party"
  | "star"
  | "heart"
  | "camping"
  | "work"
  | "gift"
  | "restaurant"
  | "coffee"
  | "plane"
  | "car"
  | "fitness"
  | "pet"
  | "baby"
  | "garden"
  | "book"
  | "music"
  | "celebration";

export type ListColor =
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "pink"
  | "teal"
  | "red"
  | "yellow"
  | "indigo"
  | "gray";

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
