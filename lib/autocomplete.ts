import type { SectionKey } from "./sections";
import type { ShoppingList } from "./types";

export type AutocompleteItem = {
  name: string;
  category?: SectionKey;
};

export type ItemFrequency = Record<string, number>;

export const ITEM_FREQUENCY_KEY = "grocery-list-item-frequency";

/**
 * Loads item frequency from localStorage (historical data).
 * This is the legacy frequency data stored independently of lists.
 */
export function loadItemFrequency(): ItemFrequency {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const stored = localStorage.getItem(ITEM_FREQUENCY_KEY);
    if (stored) {
      return JSON.parse(stored) as ItemFrequency;
    }
  } catch {
    // Invalid data, return empty
  }
  return {};
}

/**
 * Builds item frequency from all shopping lists (active and archived).
 * Each item name is counted once per list it appears in.
 */
export function buildFrequencyFromLists(lists: ShoppingList[]): ItemFrequency {
  const frequency: ItemFrequency = {};

  for (const list of lists) {
    // Use a set per list to count each item only once per list
    const seenInList = new Set<string>();

    for (const item of list.items) {
      const normalizedName = item.name.toLowerCase().trim();
      if (!seenInList.has(normalizedName)) {
        seenInList.add(normalizedName);
        frequency[normalizedName] = (frequency[normalizedName] ?? 0) + 1;
      }
    }
  }

  return frequency;
}

/**
 * Aggregates item frequency from all lists and historical data.
 * This provides autocomplete suggestions based on all items across
 * all lists, not just the current active list.
 */
export function aggregateItemFrequency(lists: ShoppingList[]): ItemFrequency {
  // Get stored historical frequency
  const storedFrequency = loadItemFrequency();

  // Build frequency from all lists
  const listsFrequency = buildFrequencyFromLists(lists);

  // Merge: use the higher count for each item
  const aggregated: ItemFrequency = { ...storedFrequency };

  for (const [itemName, count] of Object.entries(listsFrequency)) {
    // Take the maximum of stored and lists-based frequency
    aggregated[itemName] = Math.max(aggregated[itemName] ?? 0, count);
  }

  return aggregated;
}

export function saveItemFrequency(frequency: ItemFrequency): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(ITEM_FREQUENCY_KEY, JSON.stringify(frequency));
}

export function incrementItemFrequency(
  itemName: string,
  frequency: ItemFrequency
): ItemFrequency {
  const normalizedName = itemName.toLowerCase().trim();
  const newFrequency = { ...frequency };
  newFrequency[normalizedName] = (newFrequency[normalizedName] ?? 0) + 1;
  return newFrequency;
}

export function getSuggestions(
  input: string,
  frequency: ItemFrequency
): string[] {
  const normalizedInput = input.toLowerCase().trim();

  // Return empty array if input length < 2 characters
  if (normalizedInput.length < 2) {
    return [];
  }

  // Build set of all unique item names from common items and user history
  const allItems = new Set<string>();

  // Add common items (preserve original case for display)
  for (const item of COMMON_ITEMS) {
    allItems.add(item.name);
  }

  // Add user history items (keys are stored lowercase, but we need original case)
  // Since frequency keys are lowercase, we need to check common items for original case
  // For items not in common items, we'll use the lowercase version
  const commonItemsLowerToOriginal = new Map<string, string>();
  for (const item of COMMON_ITEMS) {
    commonItemsLowerToOriginal.set(item.name.toLowerCase(), item.name);
  }

  for (const itemName of Object.keys(frequency)) {
    // Use original case if it's a common item, otherwise use as-is (lowercase)
    const originalCase = commonItemsLowerToOriginal.get(itemName);
    if (originalCase) {
      allItems.add(originalCase);
    } else {
      // For custom items, capitalize first letter for display
      const capitalized = itemName.charAt(0).toUpperCase() + itemName.slice(1);
      allItems.add(capitalized);
    }
  }

  // Filter items that start with input (case-insensitive)
  const matchingItems = Array.from(allItems).filter((item) =>
    item.toLowerCase().startsWith(normalizedInput)
  );

  // Sort by: (1) frequency descending, (2) alphabetically for ties
  matchingItems.sort((a, b) => {
    const freqA = frequency[a.toLowerCase()] ?? 0;
    const freqB = frequency[b.toLowerCase()] ?? 0;

    if (freqB !== freqA) {
      return freqB - freqA; // Higher frequency first
    }
    return a.localeCompare(b); // Alphabetical for ties
  });

  // Return max 8 suggestions
  return matchingItems.slice(0, 8);
}

export const COMMON_ITEMS: AutocompleteItem[] = [
  // Produce
  { name: "Apple", category: "produce" },
  { name: "Banana", category: "produce" },
  { name: "Orange", category: "produce" },
  { name: "Lemon", category: "produce" },
  { name: "Lime", category: "produce" },
  { name: "Grapefruit", category: "produce" },
  { name: "Grape", category: "produce" },
  { name: "Strawberry", category: "produce" },
  { name: "Blueberry", category: "produce" },
  { name: "Raspberry", category: "produce" },
  { name: "Blackberry", category: "produce" },
  { name: "Watermelon", category: "produce" },
  { name: "Cantaloupe", category: "produce" },
  { name: "Honeydew", category: "produce" },
  { name: "Peach", category: "produce" },
  { name: "Nectarine", category: "produce" },
  { name: "Plum", category: "produce" },
  { name: "Pear", category: "produce" },
  { name: "Cherry", category: "produce" },
  { name: "Mango", category: "produce" },
  { name: "Pineapple", category: "produce" },
  { name: "Kiwi", category: "produce" },
  { name: "Avocado", category: "produce" },
  { name: "Tomato", category: "produce" },
  { name: "Cucumber", category: "produce" },
  { name: "Carrot", category: "produce" },
  { name: "Celery", category: "produce" },
  { name: "Lettuce", category: "produce" },
  { name: "Spinach", category: "produce" },
  { name: "Kale", category: "produce" },
  { name: "Broccoli", category: "produce" },
  { name: "Cauliflower", category: "produce" },
  { name: "Bell pepper", category: "produce" },
  { name: "Onion", category: "produce" },
  { name: "Garlic", category: "produce" },
  { name: "Potato", category: "produce" },
  { name: "Sweet potato", category: "produce" },
  { name: "Mushroom", category: "produce" },
  { name: "Zucchini", category: "produce" },
  { name: "Squash", category: "produce" },
  { name: "Eggplant", category: "produce" },
  { name: "Asparagus", category: "produce" },
  { name: "Green bean", category: "produce" },
  { name: "Corn", category: "produce" },
  { name: "Cabbage", category: "produce" },
  { name: "Radish", category: "produce" },
  { name: "Beet", category: "produce" },
  { name: "Ginger", category: "produce" },
  { name: "Cilantro", category: "produce" },
  { name: "Basil", category: "produce" },
  { name: "Parsley", category: "produce" },

  // Dairy
  { name: "Milk", category: "dairy" },
  { name: "Butter", category: "dairy" },
  { name: "Cheese", category: "dairy" },
  { name: "Cheddar cheese", category: "dairy" },
  { name: "Mozzarella cheese", category: "dairy" },
  { name: "Parmesan cheese", category: "dairy" },
  { name: "Cream cheese", category: "dairy" },
  { name: "Sour cream", category: "dairy" },
  { name: "Yogurt", category: "dairy" },
  { name: "Greek yogurt", category: "dairy" },
  { name: "Cottage cheese", category: "dairy" },
  { name: "Heavy cream", category: "dairy" },
  { name: "Half and half", category: "dairy" },
  { name: "Egg", category: "dairy" },

  // Meat & Seafood
  { name: "Chicken breast", category: "meat-seafood" },
  { name: "Chicken thigh", category: "meat-seafood" },
  { name: "Ground beef", category: "meat-seafood" },
  { name: "Ground turkey", category: "meat-seafood" },
  { name: "Steak", category: "meat-seafood" },
  { name: "Pork chop", category: "meat-seafood" },
  { name: "Bacon", category: "meat-seafood" },
  { name: "Sausage", category: "meat-seafood" },
  { name: "Hot dog", category: "meat-seafood" },
  { name: "Ham", category: "meat-seafood" },
  { name: "Deli turkey", category: "meat-seafood" },
  { name: "Deli ham", category: "meat-seafood" },
  { name: "Salmon", category: "meat-seafood" },
  { name: "Tuna", category: "meat-seafood" },
  { name: "Shrimp", category: "meat-seafood" },
  { name: "Tilapia", category: "meat-seafood" },
  { name: "Cod", category: "meat-seafood" },

  // Bakery
  { name: "Bread", category: "bakery" },
  { name: "Whole wheat bread", category: "bakery" },
  { name: "Sourdough bread", category: "bakery" },
  { name: "Bagel", category: "bakery" },
  { name: "English muffin", category: "bakery" },
  { name: "Tortilla", category: "bakery" },
  { name: "Pita bread", category: "bakery" },
  { name: "Croissant", category: "bakery" },
  { name: "Roll", category: "bakery" },
  { name: "Baguette", category: "bakery" },
  { name: "Muffin", category: "bakery" },
  { name: "Donut", category: "bakery" },
  { name: "Cookie", category: "bakery" },
  { name: "Brownie", category: "bakery" },
  { name: "Cake", category: "bakery" },
  { name: "Pie", category: "bakery" },

  // Frozen
  { name: "Frozen pizza", category: "frozen" },
  { name: "Frozen vegetable", category: "frozen" },
  { name: "Frozen fruit", category: "frozen" },
  { name: "Ice cream", category: "frozen" },
  { name: "Frozen waffle", category: "frozen" },
  { name: "Frozen meal", category: "frozen" },
  { name: "Frozen chicken nugget", category: "frozen" },
  { name: "Frozen fish fillet", category: "frozen" },
  { name: "Popsicle", category: "frozen" },

  // Canned Goods
  { name: "Canned tomato", category: "canned-goods" },
  { name: "Canned bean", category: "canned-goods" },
  { name: "Canned corn", category: "canned-goods" },
  { name: "Canned tuna", category: "canned-goods" },
  { name: "Canned soup", category: "canned-goods" },
  { name: "Canned chicken", category: "canned-goods" },
  { name: "Canned fruit", category: "canned-goods" },
  { name: "Canned vegetable", category: "canned-goods" },
  { name: "Canned salmon", category: "canned-goods" },
  { name: "Canned chili", category: "canned-goods" },

  // Snacks
  { name: "Chips", category: "snacks" },
  { name: "Potato chip", category: "snacks" },
  { name: "Tortilla chip", category: "snacks" },
  { name: "Popcorn", category: "snacks" },
  { name: "Pretzel", category: "snacks" },
  { name: "Cracker", category: "snacks" },
  { name: "Granola bar", category: "snacks" },
  { name: "Protein bar", category: "snacks" },
  { name: "Trail mix", category: "snacks" },
  { name: "Nut", category: "snacks" },
  { name: "Almond", category: "snacks" },
  { name: "Peanut", category: "snacks" },
  { name: "Cashew", category: "snacks" },
  { name: "Walnut", category: "snacks" },
  { name: "Peanut butter", category: "snacks" },
  { name: "Dried fruit", category: "snacks" },
  { name: "Raisin", category: "snacks" },
  { name: "Candy", category: "snacks" },
  { name: "Chocolate", category: "snacks" },

  // Beverages
  { name: "Coffee", category: "beverages" },
  { name: "Ground coffee", category: "beverages" },
  { name: "Coffee pod", category: "beverages" },
  { name: "Tea", category: "beverages" },
  { name: "Green tea", category: "beverages" },
  { name: "Black tea", category: "beverages" },
  { name: "Herbal tea", category: "beverages" },
  { name: "Orange juice", category: "beverages" },
  { name: "Apple juice", category: "beverages" },
  { name: "Cranberry juice", category: "beverages" },
  { name: "Lemonade", category: "beverages" },
  { name: "Soda", category: "beverages" },
  { name: "Sparkling water", category: "beverages" },
  { name: "Bottled water", category: "beverages" },
  { name: "Sports drink", category: "beverages" },
  { name: "Energy drink", category: "beverages" },
  { name: "Almond milk", category: "beverages" },
  { name: "Oat milk", category: "beverages" },
  { name: "Soy milk", category: "beverages" },

  // Condiments & Sauces
  { name: "Ketchup", category: "condiments-sauces" },
  { name: "Mustard", category: "condiments-sauces" },
  { name: "Mayonnaise", category: "condiments-sauces" },
  { name: "Relish", category: "condiments-sauces" },
  { name: "Salsa", category: "condiments-sauces" },
  { name: "Hot sauce", category: "condiments-sauces" },
  { name: "Soy sauce", category: "condiments-sauces" },
  { name: "Teriyaki sauce", category: "condiments-sauces" },
  { name: "BBQ sauce", category: "condiments-sauces" },
  { name: "Salad dressing", category: "condiments-sauces" },
  { name: "Ranch dressing", category: "condiments-sauces" },
  { name: "Italian dressing", category: "condiments-sauces" },
  { name: "Olive oil", category: "condiments-sauces" },
  { name: "Vegetable oil", category: "condiments-sauces" },
  { name: "Canola oil", category: "condiments-sauces" },
  { name: "Vinegar", category: "condiments-sauces" },
  { name: "Balsamic vinegar", category: "condiments-sauces" },
  { name: "Honey", category: "condiments-sauces" },
  { name: "Maple syrup", category: "condiments-sauces" },
  { name: "Pasta sauce", category: "condiments-sauces" },
  { name: "Marinara sauce", category: "condiments-sauces" },

  // Pasta & Grains
  { name: "Pasta", category: "pasta-grains" },
  { name: "Spaghetti", category: "pasta-grains" },
  { name: "Penne pasta", category: "pasta-grains" },
  { name: "Macaroni", category: "pasta-grains" },
  { name: "Lasagna noodle", category: "pasta-grains" },
  { name: "Rice", category: "pasta-grains" },
  { name: "White rice", category: "pasta-grains" },
  { name: "Brown rice", category: "pasta-grains" },
  { name: "Jasmine rice", category: "pasta-grains" },
  { name: "Quinoa", category: "pasta-grains" },
  { name: "Oatmeal", category: "pasta-grains" },
  { name: "Couscous", category: "pasta-grains" },

  // Baking
  { name: "Flour", category: "baking" },
  { name: "All-purpose flour", category: "baking" },
  { name: "Whole wheat flour", category: "baking" },
  { name: "Sugar", category: "baking" },
  { name: "Brown sugar", category: "baking" },
  { name: "Powdered sugar", category: "baking" },
  { name: "Baking powder", category: "baking" },
  { name: "Baking soda", category: "baking" },
  { name: "Vanilla extract", category: "baking" },
  { name: "Yeast", category: "baking" },
  { name: "Cornstarch", category: "baking" },
  { name: "Chocolate chip", category: "baking" },
  { name: "Cocoa powder", category: "baking" },

  // Breakfast & Cereal
  { name: "Cereal", category: "breakfast-cereal" },
  { name: "Oat cereal", category: "breakfast-cereal" },
  { name: "Corn flakes", category: "breakfast-cereal" },
  { name: "Granola", category: "breakfast-cereal" },
  { name: "Pancake mix", category: "breakfast-cereal" },
  { name: "Syrup", category: "breakfast-cereal" },

  // Household & Cleaning
  { name: "Paper towel", category: "household-cleaning" },
  { name: "Toilet paper", category: "household-cleaning" },
  { name: "Tissue", category: "household-cleaning" },
  { name: "Dish soap", category: "household-cleaning" },
  { name: "Laundry detergent", category: "household-cleaning" },
  { name: "Fabric softener", category: "household-cleaning" },
  { name: "Trash bag", category: "household-cleaning" },
  { name: "All-purpose cleaner", category: "household-cleaning" },
  { name: "Glass cleaner", category: "household-cleaning" },
  { name: "Disinfectant wipe", category: "household-cleaning" },
  { name: "Sponge", category: "household-cleaning" },
  { name: "Aluminum foil", category: "household-cleaning" },
  { name: "Plastic wrap", category: "household-cleaning" },
  { name: "Ziploc bag", category: "household-cleaning" },

  // Health & Personal Care
  { name: "Toothpaste", category: "health-personal-care" },
  { name: "Toothbrush", category: "health-personal-care" },
  { name: "Dental floss", category: "health-personal-care" },
  { name: "Shampoo", category: "health-personal-care" },
  { name: "Conditioner", category: "health-personal-care" },
  { name: "Body wash", category: "health-personal-care" },
  { name: "Bar soap", category: "health-personal-care" },
  { name: "Deodorant", category: "health-personal-care" },
  { name: "Razor", category: "health-personal-care" },
  { name: "Shaving cream", category: "health-personal-care" },
  { name: "Sunscreen", category: "health-personal-care" },
  { name: "Lotion", category: "health-personal-care" },
  { name: "Band-aid", category: "health-personal-care" },
  { name: "Vitamin", category: "health-personal-care" },
  { name: "Pain reliever", category: "health-personal-care" },
];
