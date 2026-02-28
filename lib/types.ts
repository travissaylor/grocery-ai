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
