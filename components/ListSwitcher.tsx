"use client";

import { useState, useRef, useEffect } from "react";
import type { ShoppingList, ListIcon, ListColor } from "@/lib/types";
import { getListIcon, getListColor } from "@/lib/list-assets";

type ListSwitcherProps = {
  lists: ShoppingList[];
  activeListId: string | null;
  activeList: ShoppingList | null;
  setActiveList: (id: string | null) => void;
  onCreateNewList: () => void;
  onEditList: () => void;
  onArchiveList: () => void;
  onDuplicateList: () => void;
  onViewArchived: () => void;
};

// Icon component for list icons
function ListIconSVG({ icon, className = "" }: { icon: ListIcon; className?: string }) {
  const iconData = getListIcon(icon);
  return (
    <svg
      className={className}
      viewBox={iconData.viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={iconData.path} />
    </svg>
  );
}

export function ListSwitcher({
  lists,
  activeListId,
  activeList,
  setActiveList,
  onCreateNewList,
  onEditList,
  onArchiveList,
  onDuplicateList,
  onViewArchived,
}: ListSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get non-archived lists
  const nonArchivedLists = lists.filter((list) => !list.isArchived);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle list selection
  const handleSelectList = (listId: string) => {
    setActiveList(listId);
    setIsOpen(false);
  };

  // Get background color class for color indicator
  const getColorClass = (color: ListColor) => {
    return getListColor(color).tailwind;
  };

  // If no active list or no non-archived lists
  if (!activeList && nonArchivedLists.length === 0) {
    return (
      <button
        onClick={onCreateNewList}
        className="flex items-center gap-2 rounded-lg border border-[var(--color-neutral-300)] bg-[var(--card-bg)] px-3 py-2 text-sm font-medium text-[var(--foreground)] shadow-brand-sm transition-all duration-150 hover:bg-[var(--color-neutral-100)] dark:border-[var(--color-neutral-600)] dark:hover:bg-[var(--color-neutral-200)]"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Create a list</span>
      </button>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Dropdown trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-[var(--color-neutral-300)] bg-[var(--card-bg)] px-3 py-2 text-sm font-medium text-[var(--foreground)] shadow-brand-sm transition-all duration-150 hover:bg-[var(--color-neutral-100)] dark:border-[var(--color-neutral-600)] dark:hover:bg-[var(--color-neutral-200)]"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {activeList && (
          <>
            {/* Color indicator */}
            <span className={`h-3 w-3 rounded-full ${getColorClass(activeList.color)}`} />
            {/* Icon */}
            <ListIconSVG icon={activeList.icon} className="h-4 w-4" />
            {/* List name */}
            <span className="max-w-[120px] truncate">{activeList.name}</span>
            {/* Item count */}
            <span className="text-xs text-[var(--color-neutral-500)]">
              ({activeList.items.length})
            </span>
          </>
        )}
        {/* Dropdown arrow */}
        <svg
          className={`h-4 w-4 text-[var(--color-neutral-500)] transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute left-0 z-50 mt-2 w-64 rounded-xl border border-[var(--color-neutral-300)] bg-[var(--card-bg)] py-2 shadow-brand-lg dark:border-[var(--color-neutral-600)]"
          role="listbox"
          aria-label="Select a list"
        >
          {/* List of non-archived lists */}
          {nonArchivedLists.map((list) => (
            <button
              key={list.id}
              onClick={() => handleSelectList(list.id)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-200)] ${
                list.id === activeListId ? "bg-[var(--color-primary-lightest)]" : ""
              }`}
              role="option"
              aria-selected={list.id === activeListId}
            >
              {/* Color indicator */}
              <span className={`h-3 w-3 flex-shrink-0 rounded-full ${getColorClass(list.color)}`} />
              {/* Icon */}
              <ListIconSVG icon={list.icon} className="h-4 w-4 flex-shrink-0" />
              {/* List name */}
              <span className="flex-1 truncate">{list.name}</span>
              {/* Item count */}
              <span className="text-xs text-[var(--color-neutral-500)]">
                {list.items.length}
              </span>
            </button>
          ))}

          {/* Divider */}
          {nonArchivedLists.length > 0 && (
            <div className="my-2 h-px bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-600)]" />
          )}

          {/* Edit active list option */}
          {activeList && (
            <button
              onClick={() => {
                setIsOpen(false);
                onEditList();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--color-neutral-600)] transition-colors duration-150 hover:bg-[var(--color-neutral-100)] dark:text-[var(--color-neutral-400)] dark:hover:bg-[var(--color-neutral-200)]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Edit list</span>
            </button>
          )}

          {/* Archive active list option */}
          {activeList && (
            <button
              onClick={() => {
                setIsOpen(false);
                onArchiveList();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--color-neutral-600)] transition-colors duration-150 hover:bg-[var(--color-neutral-100)] dark:text-[var(--color-neutral-400)] dark:hover:bg-[var(--color-neutral-200)]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10H3M21 6H3M21 14H3M21 18H3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Archive list</span>
            </button>
          )}

          {/* Duplicate active list option */}
          {activeList && (
            <button
              onClick={() => {
                setIsOpen(false);
                onDuplicateList();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--color-neutral-600)] transition-colors duration-150 hover:bg-[var(--color-neutral-100)] dark:text-[var(--color-neutral-400)] dark:hover:bg-[var(--color-neutral-200)]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="8" y="8" width="12" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Duplicate list</span>
            </button>
          )}

          {/* Create new list option */}
          <button
            onClick={() => {
              setIsOpen(false);
              onCreateNewList();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--color-primary)] transition-colors duration-150 hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-200)]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Create new list</span>
          </button>

          {/* View archived option */}
          <button
            onClick={() => {
              setIsOpen(false);
              onViewArchived();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--color-neutral-600)] transition-colors duration-150 hover:bg-[var(--color-neutral-100)] dark:text-[var(--color-neutral-400)] dark:hover:bg-[var(--color-neutral-200)]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10H3M21 6H3M21 14H3M21 18H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>View archived</span>
          </button>
        </div>
      )}
    </div>
  );
}
