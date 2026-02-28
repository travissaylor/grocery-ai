export type SectionKey =
  | "produce"
  | "dairy"
  | "meat-seafood"
  | "bakery"
  | "frozen"
  | "canned-goods"
  | "snacks"
  | "beverages"
  | "condiments-sauces"
  | "pasta-grains"
  | "baking"
  | "breakfast-cereal"
  | "household-cleaning"
  | "health-personal-care"
  | "other";

export type Section = {
  key: SectionKey;
  displayName: string;
};

export const SECTIONS: Section[] = [
  { key: "produce", displayName: "Produce" },
  { key: "dairy", displayName: "Dairy" },
  { key: "meat-seafood", displayName: "Meat & Seafood" },
  { key: "bakery", displayName: "Bakery" },
  { key: "frozen", displayName: "Frozen" },
  { key: "canned-goods", displayName: "Canned Goods" },
  { key: "snacks", displayName: "Snacks" },
  { key: "beverages", displayName: "Beverages" },
  { key: "condiments-sauces", displayName: "Condiments & Sauces" },
  { key: "pasta-grains", displayName: "Pasta & Grains" },
  { key: "baking", displayName: "Baking" },
  { key: "breakfast-cereal", displayName: "Breakfast & Cereal" },
  { key: "household-cleaning", displayName: "Household & Cleaning" },
  { key: "health-personal-care", displayName: "Health & Personal Care" },
  { key: "other", displayName: "Other" },
];

export const SECTION_KEYS = SECTIONS.map((section) => section.key);

export const SECTION_MAP = Object.fromEntries(
  SECTIONS.map((section) => [section.key, section])
) as Record<SectionKey, Section>;

export const FALLBACK_SECTION_KEY: SectionKey = "other";

export function isValidSectionKey(key: string): key is SectionKey {
  return key in SECTION_MAP;
}

export function getSectionByKey(key: string): Section {
  if (isValidSectionKey(key)) {
    return SECTION_MAP[key];
  }
  return SECTION_MAP[FALLBACK_SECTION_KEY];
}
