import type { SectionKey } from "./sections";

export type GroceryItem = {
  id: string;
  name: string;
  section: SectionKey;
  checked: boolean;
};
