import { FALLBACK_SECTION_KEY, isValidSectionKey } from "./sections";
import type { SectionKey } from "./sections";
import type { GroceryItem } from "./types";

/** Maximum number of characters accepted in a single paste. */
export const MAX_PASTE_CHARS = 4000;
/** Maximum number of items produced from a single paste. */
export const MAX_PARSED_ITEMS = 60;

export type ParsedListItem = {
  name: string;
  section: SectionKey;
  quantity?: string;
  unit?: string;
  source?: string; // original line the item came from
};

/** Result of parsing a paste. `overflow` counts items past MAX_PARSED_ITEMS that weren't returned. */
export type ParsedList = {
  items: ParsedListItem[];
  overflow: number;
};

export type ParseListErrorKind = "network" | "api" | "too-long";

/** Error thrown by requestParsedList; `kind` tells callers how to react. */
export class ParseListError extends Error {
  kind: ParseListErrorKind;

  constructor(kind: ParseListErrorKind, message?: string) {
    super(message ?? `Parse list failed (${kind})`);
    this.name = "ParseListError";
    this.kind = kind;
  }
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeParsedItem(raw: unknown): ParsedListItem | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const name = optionalString(record.name);
  if (!name) return null;

  const section =
    typeof record.section === "string" && isValidSectionKey(record.section)
      ? record.section
      : FALLBACK_SECTION_KEY;

  const item: ParsedListItem = { name, section };
  const quantity = optionalString(record.quantity);
  const unit = optionalString(record.unit);
  const source = optionalString(record.source);
  if (quantity) item.quantity = quantity;
  if (unit) item.unit = unit;
  if (source) item.source = source;
  return item;
}

/**
 * Sends pasted text to POST /api/parse-list and returns the parsed items plus
 * how many were cut off by MAX_PARSED_ITEMS.
 * Throws ParseListError with kind "too-long", "network", or "api".
 */
export async function requestParsedList(
  text: string,
  opts?: { signal?: AbortSignal }
): Promise<ParsedList> {
  if (text.length > MAX_PASTE_CHARS) {
    throw new ParseListError("too-long", "Pasted text is too long");
  }
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new ParseListError("network", "You appear to be offline");
  }

  let response: Response;
  try {
    response = await fetch("/api/parse-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: opts?.signal,
    });
  } catch (error) {
    // Let callers distinguish their own aborts from real network failures.
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ParseListError("network", "Network request failed");
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  const record =
    body && typeof body === "object" ? (body as Record<string, unknown>) : null;

  if (!response.ok) {
    const message =
      typeof record?.error === "string"
        ? record.error
        : typeof record?.message === "string"
          ? record.message
          : undefined;
    if (response.status === 400 && message && /too long|too-long/i.test(message)) {
      throw new ParseListError("too-long", message);
    }
    throw new ParseListError("api", message ?? `Request failed (${response.status})`);
  }

  if (!record || record.error === true || !Array.isArray(record.items)) {
    throw new ParseListError("api", "Unexpected response from parse-list");
  }

  const items = record.items
    .map(normalizeParsedItem)
    .filter((item): item is ParsedListItem => item !== null);
  const serverOverflow =
    typeof record.overflow === "number" && record.overflow > 0 ? record.overflow : 0;
  return {
    items: items.slice(0, MAX_PARSED_ITEMS),
    overflow: serverOverflow + Math.max(0, items.length - MAX_PARSED_ITEMS),
  };
}

/**
 * Converts parsed items into new GroceryItems. Items whose name matches an
 * unchecked existing item are reported in `skipped`; repeats within the same
 * batch are dropped silently.
 */
export function buildItemsFromParsed(
  parsed: ParsedListItem[],
  existing: GroceryItem[]
): { added: GroceryItem[]; skipped: string[] } {
  const onList = new Set(
    existing
      .filter((item) => !item.checked)
      .map((item) => item.name.trim().toLowerCase())
  );
  const inBatch = new Set<string>();
  const added: GroceryItem[] = [];
  const skipped: string[] = [];

  for (const entry of parsed) {
    const name = entry.name.trim();
    if (!name) continue;
    const normalized = name.toLowerCase();
    if (inBatch.has(normalized)) continue;
    inBatch.add(normalized);
    if (onList.has(normalized)) {
      skipped.push(name);
      continue;
    }

    const item: GroceryItem = {
      id: crypto.randomUUID(),
      name,
      section: entry.section,
      checked: false,
      originalName: entry.source ?? name,
    };
    if (entry.quantity) item.quantity = entry.quantity;
    if (entry.unit) item.unit = entry.unit;
    added.push(item);
  }

  return { added, skipped };
}

// Numbered markers need trailing whitespace so "1.5 cups flour" keeps its quantity.
const LIST_MARKER_PATTERN = /^(?:[-*•·–—]\s*|\d+[.)]\s+|\[[ xX]?\]\s*|[☐☑]\s*)/;

/**
 * Offline/error fallback: splits pasted text into item names, stripping list
 * markers, dropping blanks and "Header:" lines, and deduping case-insensitively.
 * Not capped; callers apply MAX_PARSED_ITEMS so they can report the overflow.
 */
export function splitPastedText(text: string): string[] {
  const seen = new Set<string>();
  const names: string[] = [];

  for (const line of text.split(/\r?\n/)) {
    let name = line.trim();
    // Strip repeatedly so "- [ ] milk" loses both the bullet and the checkbox.
    for (;;) {
      const stripped = name.replace(LIST_MARKER_PATTERN, "").trim();
      if (stripped === name) break;
      name = stripped;
    }
    if (!name || name.endsWith(":")) continue;

    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }

  return names;
}

/**
 * True when the paste has 2+ non-blank lines. Judged on the raw text, before
 * headers are dropped or duplicates merged, so "Produce:\napples" still goes
 * to the list parser instead of being flattened into the single-line input.
 */
export function isMultiLinePaste(text: string): boolean {
  return text.split(/\r?\n/).filter((line) => line.trim()).length >= 2;
}
