"use client";

import { useState, useRef } from "react";
import type { GroceryItem } from "@/lib/types";
import { FALLBACK_SECTION_KEY } from "@/lib/sections";

export default function Home() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addItem();
    }
  };

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

        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="text-zinc-900 dark:text-zinc-50">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
