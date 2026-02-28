"use client";

import { useState, useRef, useMemo, useEffect } from "react";

const LOCAL_STORAGE_KEY = "grocery-list";
import type { GroceryItem } from "@/lib/types";
import { FALLBACK_SECTION_KEY, SECTIONS, type SectionKey } from "@/lib/sections";

function loadItemsFromStorage(): GroceryItem[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved) as GroceryItem[];
    } catch {
      return [];
    }
  }
  return [];
}

export default function Home() {
  const [items, setItems] = useState<GroceryItem[]>(loadItemsFromStorage);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Save items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

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

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearList = () => {
    if (window.confirm("Clear all items?")) {
      setItems([]);
    }
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
    <div className="min-h-screen bg-[var(--background)]">
      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Header with brand identity */}
        <header className="mb-10 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            {/* Brand icon - abstract geometric shape */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] shadow-brand-md">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <rect x="2" y="2" width="6" height="6" rx="1" fill="currentColor" opacity="0.9" />
                <rect x="12" y="2" width="6" height="6" rx="1" fill="currentColor" opacity="0.7" />
                <rect x="2" y="12" width="6" height="6" rx="1" fill="currentColor" opacity="0.7" />
                <rect x="12" y="12" width="6" height="6" rx="1" fill="currentColor" opacity="0.9" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Grocery AI
            </h1>
          </div>
          <p className="text-base text-[var(--color-neutral-500)]">
            Smart shopping lists
          </p>
          {/* Gradient accent line */}
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-40" />
        </header>

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

        {items.length > 0 && (
          <button
            onClick={clearList}
            className="mb-6 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Clear List
          </button>
        )}

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
                      className={`flex-1 text-zinc-900 dark:text-zinc-50 ${
                        item.checked
                          ? "text-decoration-line opacity-50"
                          : ""
                      }`}
                      style={item.checked ? { textDecoration: "line-through" } : {}}
                    >
                      {item.name}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                      aria-label="Remove item"
                    >
                      ✕
                    </button>
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
