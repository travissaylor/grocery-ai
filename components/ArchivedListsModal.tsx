"use client";

import { useState, useEffect, useRef } from "react";
import type { ShoppingList, ListIcon, ListColor } from "@/lib/types";
import { getListIcon, getListColor } from "@/lib/list-assets";

type ArchivedListsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  archivedLists: ShoppingList[];
  onRestoreList: (id: string) => void;
  onDeleteList: (id: string) => void;
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

// Format date for display
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ArchivedListsModal({
  isOpen,
  onClose,
  archivedLists,
  onRestoreList,
  onDeleteList,
}: ArchivedListsModalProps) {
  const [listToDelete, setListToDelete] = useState<ShoppingList | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key to close modal
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Handle click outside to close modal
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Get background color class for color indicator
  const getColorClass = (color: ListColor) => {
    return getListColor(color).tailwind;
  };

  // Handle restore
  const handleRestore = (id: string) => {
    onRestoreList(id);
  };

  // Handle delete with confirmation
  const handleDelete = (list: ShoppingList) => {
    setListToDelete(list);
  };

  // Confirm deletion
  const confirmDelete = () => {
    if (listToDelete) {
      onDeleteList(listToDelete.id);
      setListToDelete(null);
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setListToDelete(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-2xl border border-[var(--color-neutral-300)] bg-[var(--card-bg)] p-6 shadow-brand-lg dark:border-[var(--color-neutral-600)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h2 id="modal-title" className="mb-6 text-xl font-semibold text-[var(--foreground)]">
          Archived Lists
        </h2>

        {archivedLists.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-[var(--color-neutral-500)]">No archived lists</p>
          </div>
        ) : (
          <div className="max-h-[400px] space-y-3 overflow-y-auto">
            {archivedLists.map((list) => (
              <div
                key={list.id}
                className="flex items-center gap-3 rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-3 dark:border-[var(--color-neutral-600)] dark:bg-[var(--color-neutral-800)]"
              >
                {/* Color indicator */}
                <span className={`h-3 w-3 flex-shrink-0 rounded-full ${getColorClass(list.color)}`} />
                {/* Icon */}
                <ListIconSVG icon={list.icon} className="h-4 w-4 flex-shrink-0 text-[var(--color-neutral-500)]" />
                {/* List info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--foreground)]">{list.name}</p>
                  <p className="text-xs text-[var(--color-neutral-500)]">
                    Archived {formatDate(list.updatedAt)}
                  </p>
                </div>
                {/* Action buttons */}
                <div className="flex flex-shrink-0 gap-2">
                  <button
                    onClick={() => handleRestore(list.id)}
                    className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white transition-all duration-150 hover:bg-[var(--color-primary-hover)]"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => handleDelete(list)}
                    className="rounded-lg border border-[var(--color-error)] px-3 py-1.5 text-xs font-medium text-[var(--color-error)] transition-all duration-150 hover:bg-[var(--color-error)]/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Close button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-[var(--color-neutral-300)] bg-[var(--card-bg)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition-all duration-150 hover:bg-[var(--color-neutral-100)] dark:border-[var(--color-neutral-600)] dark:hover:bg-[var(--color-neutral-200)]"
          >
            Close
          </button>
        </div>

        {/* Delete confirmation dialog */}
        {listToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl border border-[var(--color-neutral-300)] bg-[var(--card-bg)] p-6 shadow-brand-lg dark:border-[var(--color-neutral-600)]">
              <h3 className="mb-2 text-lg font-semibold text-[var(--foreground)]">
                Delete List
              </h3>
              <p className="mb-6 text-sm text-[var(--color-neutral-600)]">
                Permanently delete &quot;{listToDelete.name}&quot;? This cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  className="rounded-xl border border-[var(--color-neutral-300)] bg-[var(--card-bg)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-all duration-150 hover:bg-[var(--color-neutral-100)] dark:border-[var(--color-neutral-600)] dark:hover:bg-[var(--color-neutral-200)]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="rounded-xl bg-[var(--color-error)] px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:opacity-90"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
