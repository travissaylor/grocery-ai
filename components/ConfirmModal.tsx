"use client";

import { useEffect, useRef } from "react";

type ConfirmModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
};

export function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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

  const isDanger = variant === "danger";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={modalRef}
        className="w-full max-w-sm rounded-2xl border border-[var(--color-neutral-300)] bg-[var(--card-bg)] p-6 shadow-brand-lg dark:border-[var(--color-neutral-600)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <h2
          id="confirm-modal-title"
          className="mb-2 text-lg font-semibold text-[var(--foreground)]"
        >
          {title}
        </h2>
        <p className="mb-6 text-sm text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[var(--color-neutral-300)] bg-[var(--card-bg)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition-all duration-150 hover:bg-[var(--color-neutral-100)] dark:border-[var(--color-neutral-600)] dark:hover:bg-[var(--color-neutral-200)]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={
              isDanger
                ? "rounded-xl bg-[var(--color-error)] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:opacity-90"
                : "rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-[var(--color-primary-hover)]"
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
