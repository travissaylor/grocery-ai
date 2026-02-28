"use client";

import { useState, useRef, useMemo, useEffect, useCallback, useSyncExternalStore } from "react";

// Custom hook to track online/offline status
function useOnlineStatus(): boolean {
  const subscribe = (callback: () => void) => {
    window.addEventListener("online", callback);
    window.addEventListener("offline", callback);
    return () => {
      window.removeEventListener("online", callback);
      window.removeEventListener("offline", callback);
    };
  };

  const getSnapshot = () => navigator.onLine;
  const getServerSnapshot = () => true; // Assume online during SSR

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const LOCAL_STORAGE_KEY = "grocery-list";
const PENDING_CATEGORIZATION_KEY = "grocery-list-pending-categorization";
import type { GroceryItem, PendingCategorization, PendingDeletion } from "@/lib/types";
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

function loadPendingCategorizations(): PendingCategorization[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(PENDING_CATEGORIZATION_KEY);
  if (saved) {
    try {
      return JSON.parse(saved) as PendingCategorization[];
    } catch {
      return [];
    }
  }
  return [];
}

function savePendingCategorizations(pending: PendingCategorization[]): void {
  if (typeof window === "undefined") return;
  if (pending.length === 0) {
    localStorage.removeItem(PENDING_CATEGORIZATION_KEY);
  } else {
    localStorage.setItem(PENDING_CATEGORIZATION_KEY, JSON.stringify(pending));
  }
}

// Register service worker for PWA offline support (production only)
function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  if (process.env.NODE_ENV !== "production") return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registered with scope:", registration.scope);

        // Handle updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                console.log("Service Worker updated and ready");
              } else {
                console.log("Service Worker installed for the first time");
              }
            }
          };
        };
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}

// Initialize service worker registration
registerServiceWorker();

export default function Home() {
  const [items, setItems] = useState<GroceryItem[]>(loadItemsFromStorage);
  const [inputValue, setInputValue] = useState("");
  const [categorizingItems, setCategorizingItems] = useState<Set<string>>(new Set());
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [newItems, setNewItems] = useState<Set<string>>(new Set());
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [pendingCategorizations, setPendingCategorizations] = useState<PendingCategorization[]>(loadPendingCategorizations);
  const [isRetryingPending, setIsRetryingPending] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<PendingDeletion | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isOnline = useOnlineStatus();

  // Save items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Mark initial load complete after first render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 500); // Wait for staggered animations to complete
    return () => clearTimeout(timer);
  }, []);

  // Clear new item animation flag after animation completes
  useEffect(() => {
    if (newItems.size > 0) {
      const timer = setTimeout(() => {
        setNewItems(new Set());
      }, 150); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [newItems]);

  // Save pending categorizations to localStorage whenever they change
  useEffect(() => {
    savePendingCategorizations(pendingCategorizations);
  }, [pendingCategorizations]);

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (!pendingDeletion) return;

    const timer = setTimeout(() => {
      setPendingDeletion(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [pendingDeletion]);

  // Retry pending categorizations when network comes back online
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      if (pendingCategorizations.length === 0) return;

      // Retry all pending categorizations within 5 seconds
      pendingCategorizations.forEach((pending, index) => {
        setTimeout(() => {
          categorizeItem(pending.itemId, pending.itemName);
        }, index * 100); // Stagger retries to avoid overwhelming the API
      });
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [pendingCategorizations]);

  const categorizeItem = async (itemId: string, itemName: string) => {
    // Mark item as being categorized
    setCategorizingItems((prev) => new Set(prev).add(itemId));

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
          item.id === itemId ? { ...item, section, pendingCategorization: false } : item
        )
      );

      // Remove from pending categorizations on success
      setPendingCategorizations((prev) =>
        prev.filter((p) => p.itemId !== itemId)
      );
    } catch (error) {
      // Check if this is a network error (offline)
      if (!navigator.onLine || error instanceof TypeError) {
        // Mark item as pending categorization
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, pendingCategorization: true } : item
          )
        );

        // Add to pending categorizations if not already there
        setPendingCategorizations((prev) => {
          if (prev.some((p) => p.itemId === itemId)) return prev;
          return [...prev, { itemId, itemName }];
        });
      }
      // On other errors, item remains in "other" section
    } finally {
      // Remove from categorizing set
      setCategorizingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const retryPendingCategorizations = async () => {
    if (pendingCategorizations.length === 0) return;

    setIsRetryingPending(true);

    // Stagger categorizations to avoid overwhelming the API
    for (let i = 0; i < pendingCategorizations.length; i++) {
      const pending = pendingCategorizations[i];
      await new Promise((resolve) => setTimeout(resolve, i * 100));
      await categorizeItem(pending.itemId, pending.itemName);
    }

    setIsRetryingPending(false);
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
    setNewItems((prev) => new Set(prev).add(newItem.id));
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

  const removeItem = useCallback((itemId: string) => {
    // Start the fade-out animation
    setRemovingItems((prev) => new Set(prev).add(itemId));

    // Wait for animation to complete (150ms) before actually removing
    setTimeout(() => {
      // Find the item and its original index before removing
      setItems((prevItems) => {
        const itemIndex = prevItems.findIndex((item) => item.id === itemId);
        const item = prevItems[itemIndex];

        if (item) {
          // Store for potential undo
          setPendingDeletion({ item, originalIndex: itemIndex });
        }

        return prevItems.filter((i) => i.id !== itemId);
      });

      // Clear the removing state
      setRemovingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }, 150); // Match the CSS animation duration
  }, []);

  const undoDeletion = useCallback(() => {
    if (!pendingDeletion) return;

    const { item, originalIndex } = pendingDeletion;

    // Restore item to its original position
    setItems((prev) => {
      const newItems = [...prev];
      // Clamp index to valid range
      const insertIndex = Math.min(originalIndex, newItems.length);
      newItems.splice(insertIndex, 0, item);
      return newItems;
    });

    // Trigger fade-in animation for the restored item
    setNewItems((prev) => new Set(prev).add(item.id));

    // Clear pending deletion
    setPendingDeletion(null);
  }, [pendingDeletion]);

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

        {/* Offline status indicator */}
        {!isOnline && (
          <div className="mb-6 flex items-center justify-center gap-2 rounded-xl border border-[var(--color-neutral-300)] bg-[var(--color-neutral-100)] px-4 py-3 text-sm text-[var(--color-neutral-600)] shadow-brand-sm dark:border-[var(--color-neutral-600)] dark:bg-[var(--color-neutral-200)] dark:text-[var(--color-neutral-700)]">
            <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>You&apos;re offline — categorization will resume when connected</span>
          </div>
        )}

        {/* Pending categorizations refresh button */}
        {pendingCategorizations.length > 0 && (
          <button
            onClick={retryPendingCategorizations}
            disabled={isRetryingPending}
            className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-primary)] bg-[var(--color-primary-lighter)] px-4 py-3 text-sm font-medium text-[var(--color-primary)] shadow-brand-sm transition-all duration-150 ease-out hover:bg-[var(--color-primary-lightest)] disabled:opacity-70 dark:hover:bg-[var(--color-primary-lightest)]"
          >
            {isRetryingPending ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Categorizing {pendingCategorizations.length} item{pendingCategorizations.length !== 1 ? "s" : ""}...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                </svg>
                <span>Retry {pendingCategorizations.length} item{pendingCategorizations.length !== 1 ? "s" : ""}</span>
              </>
            )}
          </button>
        )}

        {/* Item input area */}
        <div className="mb-8">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add an item (e.g., milk, bread...)"
              className="flex-1 rounded-xl border border-[var(--color-neutral-300)] bg-[var(--input-bg)] px-5 py-3.5 text-base text-[var(--foreground)] placeholder-[var(--color-neutral-400)] shadow-brand-md transition-all duration-150 ease-out focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 dark:border-[var(--color-neutral-400)] dark:placeholder-[var(--color-neutral-500)]"
              autoFocus
            />
            <button
              onClick={addItem}
              className="rounded-xl bg-[var(--color-primary)] px-6 py-3.5 text-base font-semibold text-white shadow-brand-md transition-all duration-150 ease-out hover:bg-[var(--color-primary-hover)] hover:shadow-brand-lg active:scale-[0.98] active:bg-[var(--color-primary-active)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:ring-offset-2 focus:ring-offset-[var(--background)]"
            >
              Add
            </button>
          </div>
          {/* Keyboard shortcut hint */}
          <p className="mt-2.5 text-center text-sm text-[var(--color-neutral-400)]">
            Press <span className="font-medium text-[var(--color-neutral-500)]">⏎</span> to add
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearList}
            className="mb-6 rounded-lg border border-[var(--color-neutral-300)] bg-[var(--card-bg)] px-4 py-2 text-sm font-medium text-[var(--color-neutral-600)] shadow-brand-sm transition-all duration-150 ease-out hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-700)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:ring-offset-2 focus:ring-offset-[var(--background)] dark:border-[var(--color-neutral-600)] dark:hover:bg-[var(--color-neutral-200)] dark:hover:text-[var(--color-neutral-800)]"
          >
            Clear List
          </button>
        )}

        {/* Empty state */}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {/* Empty state illustration/icon */}
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--color-primary-lighter)] shadow-brand-md">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[var(--color-primary)]"
              >
                {/* Shopping basket icon */}
                <path
                  d="M8 15C8 13.8954 8.89543 13 10 13H30C31.1046 13 32 13.8954 32 15V17C32 18.1046 31.1046 19 30 19H10C8.89543 19 8 18.1046 8 17V15Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 19V30C10 31.1046 10.8954 32 12 32H28C29.1046 32 30 31.1046 30 30V19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 13V10C15 8.89543 15.8954 8 17 8H23C24.1046 8 25 8.89543 25 10V13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 24V27"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M20 24V27"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M24 24V27"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            {/* Empty state message */}
            <p className="mb-2 text-lg font-medium text-[var(--foreground)]">
              Your list is empty
            </p>
            <p className="text-sm text-[var(--color-neutral-500)]">
              Add your first item to get started!
            </p>
          </div>
        )}

        <div className="space-y-5">
          {groupedItems.map(({ section, items }, index) => (
            <div
              key={section.key}
              className={`rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-brand-md transition-all duration-150 ease-out ${isInitialLoad ? `animate-slide-up stagger-${Math.min(index + 1, 8)}` : ""}`}
            >
              {/* Section header with brand color accent */}
              <div className="mb-4 flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                <h2 className="text-base font-semibold uppercase tracking-wide text-[var(--color-primary)]">
                  {section.displayName}
                </h2>
              </div>
              {/* Items list */}
              <div className="space-y-1.5">
                {items.map((item) => {
                  const isCategorizing = categorizingItems.has(item.id);
                  const isRemoving = removingItems.has(item.id);
                  const isNew = newItems.has(item.id);
                  return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-150 ease-out hover:bg-[var(--color-primary-lightest)] dark:hover:bg-[var(--color-primary-lightest)] ${isCategorizing ? "animate-shimmer bg-gradient-to-r from-[var(--color-primary-lightest)] via-[var(--color-primary-lighter)] to-[var(--color-primary-lightest)] bg-[length:200%_100%]" : ""} ${isNew ? "animate-fade-in" : ""} ${isRemoving ? "animate-fade-out" : ""}`}
                  >
                    {/* Custom styled checkbox */}
                    <button
                      onClick={() => toggleChecked(item.id)}
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 ${
                        item.checked
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                          : "border-[var(--color-neutral-300)] bg-transparent hover:border-[var(--color-primary)] dark:border-[var(--color-neutral-500)]"
                      }`}
                      aria-label={item.checked ? "Mark as not purchased" : "Mark as purchased"}
                    >
                      {/* Checkmark icon */}
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`text-white transition-all duration-200 ease-out ${
                          item.checked ? "scale-100 opacity-100" : "scale-50 opacity-0"
                        }`}
                      >
                        <path
                          d="M2.5 6L5 8.5L9.5 4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    {/* Item name with animated strikethrough */}
                    <span
                      className={`relative flex-1 text-[var(--foreground)] transition-all duration-200 ${
                        item.checked ? "text-[var(--color-neutral-400)]" : ""
                      }`}
                    >
                      {item.name}
                      {/* Animated strikethrough line */}
                      <span
                        className={`pointer-events-none absolute left-0 top-1/2 h-px bg-[var(--color-neutral-400)] transition-all duration-200 ease-out ${
                          item.checked ? "w-full" : "w-0"
                        }`}
                      />
                    </span>
                    {/* Categorizing indicator */}
                    {isCategorizing && (
                      <div className="flex items-center gap-1.5 text-xs text-[var(--color-primary)]">
                        <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>sorting...</span>
                      </div>
                    )}
                    {/* Pending categorization indicator (waiting for connection) */}
                    {item.pendingCategorization && !isCategorizing && (
                      <div className="flex items-center gap-1.5 text-xs text-[var(--color-neutral-500)]">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>waiting for connection</span>
                      </div>
                    )}
                    {/* Remove button - always visible for mobile accessibility */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex-shrink-0 rounded-lg p-3.5 text-[var(--color-neutral-400)] transition-all duration-150 ease-out hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] focus:outline-none focus:ring-2 focus:ring-[var(--color-error)]/30"
                      aria-label={`Remove ${item.name}`}
                    >
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Undo toast */}
      {pendingDeletion && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-xl border border-[var(--color-neutral-300)] bg-[var(--card-bg)] px-4 py-3 shadow-brand-lg animate-slide-up dark:border-[var(--color-neutral-600)]"
        >
          <span className="text-sm text-[var(--foreground)]">Item deleted</span>
          <button
            onClick={undoDeletion}
            className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white transition-all duration-150 ease-out hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
