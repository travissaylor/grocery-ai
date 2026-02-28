"use client";

import { useMemo } from "react";
import { getSuggestions, type ItemFrequency } from "./autocomplete";

type AutocompleteDropdownProps = {
  inputValue: string;
  frequency: ItemFrequency;
  highlightedIndex: number;
  isOpen: boolean;
  onSelect: (suggestion: string) => void;
  onHighlight: (index: number) => void;
};

export function AutocompleteDropdown({
  inputValue,
  frequency,
  highlightedIndex,
  isOpen,
  onSelect,
  onHighlight,
}: AutocompleteDropdownProps) {
  const suggestions = useMemo(
    () => getSuggestions(inputValue, frequency),
    [inputValue, frequency]
  );

  // Don't show dropdown if closed or no suggestions
  if (!isOpen || suggestions.length === 0) {
    return null;
  }

  return (
    <div
      className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[250px] overflow-y-auto rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-brand-lg"
      role="listbox"
      aria-label="Item suggestions"
    >
      {suggestions.map((suggestion, index) => (
        <button
          key={suggestion}
          type="button"
          role="option"
          aria-selected={index === highlightedIndex}
          onClick={() => onSelect(suggestion)}
          onMouseEnter={() => onHighlight(index)}
          className={`w-full px-5 py-3 text-left text-base transition-colors duration-75 first:rounded-t-xl last:rounded-b-xl ${
            index === highlightedIndex
              ? "bg-[var(--color-primary-lightest)] text-[var(--color-primary)]"
              : "text-[var(--foreground)] hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-200)]"
          }`}
          style={{ minHeight: "44px" }} // Ensure touch targets are large enough
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
