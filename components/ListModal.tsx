"use client";

import { useState, useEffect, useRef } from "react";
import type { ListIcon, ListColor } from "@/lib/types";
import { LIST_ICONS, LIST_COLORS, getListIcon, getListColor } from "@/lib/list-assets";

type ListModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateList: (name: string, icon: ListIcon, color: ListColor) => void;
};

// Icon component for rendering list icons
function IconOption({
  iconKey,
  isSelected,
  onClick,
}: {
  iconKey: ListIcon;
  isSelected: boolean;
  onClick: () => void;
}) {
  const iconData = getListIcon(iconKey);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all duration-150 ${
        isSelected
          ? "border-[var(--color-primary)] bg-[var(--color-primary-lightest)]"
          : "border-[var(--color-neutral-200)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)] dark:border-[var(--color-neutral-600)]"
      }`}
      aria-label={`Select ${iconKey} icon`}
      aria-pressed={isSelected}
    >
      <svg
        className={`h-5 w-5 ${isSelected ? "text-[var(--color-primary)]" : "text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]"}`}
        viewBox={iconData.viewBox}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={iconData.path} />
      </svg>
    </button>
  );
}

// Color option component
function ColorOption({
  colorKey,
  isSelected,
  onClick,
}: {
  colorKey: ListColor;
  isSelected: boolean;
  onClick: () => void;
}) {
  const colorData = getListColor(colorKey);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150 ${
        isSelected ? "ring-2 ring-offset-2 ring-[var(--color-primary)]" : ""
      }`}
      style={{ backgroundColor: colorData.hex }}
      aria-label={`Select ${colorKey} color`}
      aria-pressed={isSelected}
    >
      {isSelected && (
        <svg
          className="h-4 w-4 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12l5 5L20 7" />
        </svg>
      )}
    </button>
  );
}

export function ListModal({ isOpen, onClose, onCreateList }: ListModalProps) {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<ListIcon>(LIST_ICONS[0].key);
  const [selectedColor, setSelectedColor] = useState<ListColor>(LIST_COLORS[0].key);
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

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    onCreateList(trimmedName, selectedIcon, selectedColor);
    onClose();
  };

  // Validate name (required, max 50 chars)
  const trimmedName = name.trim();
  const isValidName = trimmedName.length > 0 && trimmedName.length <= 50;
  const isNameTooLong = name.length > 50;

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
          Create new list
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Name input */}
          <div className="mb-6">
            <label
              htmlFor="list-name"
              className="mb-2 block text-sm font-medium text-[var(--foreground)]"
            >
              List name
            </label>
            <input
              id="list-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Weekly Groceries"
              maxLength={50}
              autoFocus
              className="w-full rounded-xl border border-[var(--color-neutral-300)] bg-[var(--input-bg)] px-4 py-3 text-base text-[var(--foreground)] placeholder-[var(--color-neutral-400)] transition-all duration-150 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 dark:border-[var(--color-neutral-500)] dark:placeholder-[var(--color-neutral-500)]"
            />
            {isNameTooLong && (
              <p className="mt-1 text-sm text-[var(--color-error)]">
                Name must be 50 characters or less
              </p>
            )}
          </div>

          {/* Icon picker */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
              Icon
            </label>
            <div className="grid grid-cols-10 gap-2">
              {LIST_ICONS.map((icon) => (
                <IconOption
                  key={icon.key}
                  iconKey={icon.key}
                  isSelected={selectedIcon === icon.key}
                  onClick={() => setSelectedIcon(icon.key)}
                />
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
              Color
            </label>
            <div className="flex flex-wrap gap-3">
              {LIST_COLORS.map((color) => (
                <ColorOption
                  key={color.key}
                  colorKey={color.key}
                  isSelected={selectedColor === color.key}
                  onClick={() => setSelectedColor(color.key)}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--color-neutral-300)] bg-[var(--card-bg)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition-all duration-150 hover:bg-[var(--color-neutral-100)] dark:border-[var(--color-neutral-600)] dark:hover:bg-[var(--color-neutral-200)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValidName}
              className="rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
