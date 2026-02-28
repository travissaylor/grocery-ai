"use client";

import { useState, useRef, useMemo } from "react";
import type { GroceryItem } from "@/lib/types";
import { FALLBACK_SECTION_KEY, SECTIONS, type SectionKey } from "@/lib/sections";

export default function Home() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const categorizeItem = async (itemId: string, itemName: string) => {
    try {
      const response = await fetch("/api/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: itemName }),
      });

      const data = await response.json();
      const section: SectionKey = data.section || FALLBACK_SECTION_KEY;

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, section } : item
        )
      );
    } catch {
      // On error, item remains in "other" section
    }
  };

  const addItem = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    const newItem: GroceryItem = {
      id: crypto.randomUUID(),
      name: trimmedValue,
      section: FALLBACK_SECTION_KEY,
      checked: false,
    };

    setItems((prev) => [...prev, newItem]);
    setInputValue("");
    inputRef.current?.focus();

    // Categorize the item asynchronously
    categorizeItem(newItem.id, trimmedValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addItem();
    }
  };

  const toggleChecked = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  // Group items by section, maintaining the order defined in SECTIONS
  // and the order items were added within each section
  const groupedItems = useMemo(() => {
    const groups = new Map<SectionKey, GroceryItem[]>();

    // Initialize groups for all sections that have items
    for (const item of items) {
      const sectionItems = groups.get(item.section) || [];
      sectionItems.push(item);
      groups.set(item.section, sectionItems);
    }

    // Return sections in the predefined order, only those with items
    return SECTIONS
      .filter((section) => groups.has(section.key))
      .map((section) => ({
        section,
        items: groups.get(section.key) || [],
      }));
  }, [items]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Grocery List
        </h1>

        <div className="mb-6 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add an item..."
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
            autoFocus
          />
          <button
            onClick={addItem}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add
          </button>
        </div>

        <div className="space-y-6">
          {groupedItems.map(({ section, items }) => (
            <div key={section.key}>
              <h2 className="mb-2 text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                {section.displayName}
              </h2>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleChecked(item.id)}
                      className="h-5 w-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span
                      className={`text-zinc-900 dark:text-zinc-50 ${
                        item.checked
                          ? "text-decoration-line opacity-50"
                          : ""
                      }`}
                      style={item.checked ? { textDecoration: "line-through" } : {}}
                    >
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
