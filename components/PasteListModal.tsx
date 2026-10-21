"use client";

import { useEffect, useRef, useState } from "react";

type PasteListModalProps = {
  isOpen: boolean;
  onSubmit: (text: string) => void;
  onCancel: () => void;
  maxLength: number;
};

export function PasteListModal({ isOpen, onSubmit, onCancel, maxLength }: PasteListModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");

  const isOverLimit = text.length > maxLength;
  const canSubmit = text.trim().length > 0 && !isOverLimit;

  // Handle escape key to close modal
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onCancel]);

  // Handle click outside to close modal
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onCancel();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit(text);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-2xl border border-[var(--color-neutral-300)] bg-[var(--card-bg)] p-6 shadow-brand-lg dark:border-[var(--color-neutral-600)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="paste-list-modal-title"
      >
        <h2 id="paste-list-modal-title" className="mb-2 text-lg font-semibold text-[var(--foreground)]">
          Paste a list
        </h2>
        <p className="mb-4 text-sm text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
          Paste ingredients or a shopping list, one item per line. We&apos;ll sort them into sections.
        </p>
        <textarea
          autoFocus
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="List to paste"
          placeholder={"2 lbs chicken thighs\n1 can diced tomatoes\nsalt and pepper"}
          className="w-full resize-y rounded-xl border border-[var(--color-neutral-300)] bg-[var(--input-bg)] px-4 py-3 text-base text-[var(--foreground)] placeholder-[var(--color-neutral-400)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 dark:border-[var(--color-neutral-400)] dark:placeholder-[var(--color-neutral-500)]"
        />
        <p
          className={`mt-2 mb-6 text-right text-xs ${
            isOverLimit
              ? "text-[var(--color-error)]"
              : "text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]"
          }`}
          aria-live="polite"
        >
          {text.length} / {maxLength}
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[var(--color-neutral-300)] bg-[var(--card-bg)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition-all duration-150 hover:bg-[var(--color-neutral-100)] dark:border-[var(--color-neutral-600)] dark:hover:bg-[var(--color-neutral-200)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add items
          </button>
        </div>
      </div>
    </div>
  );
}
