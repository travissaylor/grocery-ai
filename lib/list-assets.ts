import type { ListIcon, ListColor } from "./types";

// Color definitions with hex and Tailwind classes
export const LIST_COLORS: { key: ListColor; hex: string; tailwind: string; bgTailwind: string }[] = [
  { key: "blue", hex: "#3B82F6", tailwind: "bg-blue-500", bgTailwind: "bg-blue-100 dark:bg-blue-900/30" },
  { key: "green", hex: "#22C55E", tailwind: "bg-green-500", bgTailwind: "bg-green-100 dark:bg-green-900/30" },
  { key: "purple", hex: "#A855F7", tailwind: "bg-purple-500", bgTailwind: "bg-purple-100 dark:bg-purple-900/30" },
  { key: "orange", hex: "#F97316", tailwind: "bg-orange-500", bgTailwind: "bg-orange-100 dark:bg-orange-900/30" },
  { key: "pink", hex: "#EC4899", tailwind: "bg-pink-500", bgTailwind: "bg-pink-100 dark:bg-pink-900/30" },
  { key: "teal", hex: "#14B8A6", tailwind: "bg-teal-500", bgTailwind: "bg-teal-100 dark:bg-teal-900/30" },
  { key: "red", hex: "#EF4444", tailwind: "bg-red-500", bgTailwind: "bg-red-100 dark:bg-red-900/30" },
  { key: "yellow", hex: "#EAB308", tailwind: "bg-yellow-500", bgTailwind: "bg-yellow-100 dark:bg-yellow-900/30" },
  { key: "indigo", hex: "#6366F1", tailwind: "bg-indigo-500", bgTailwind: "bg-indigo-100 dark:bg-indigo-900/30" },
  { key: "gray", hex: "#6B7280", tailwind: "bg-gray-500", bgTailwind: "bg-gray-100 dark:bg-gray-900/30" },
];

// Get color info by key
export function getListColor(key: ListColor) {
  return LIST_COLORS.find((c) => c.key === key) ?? LIST_COLORS[0];
}

// Icon SVG definitions as React-compatible SVG strings
export const LIST_ICONS: { key: ListIcon; path: string; viewBox: string }[] = [
  { key: "cart", path: "M2 3h2l2 12h10l2-9H6M6 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z", viewBox: "0 0 24 24" },
  { key: "store", path: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10", viewBox: "0 0 24 24" },
  { key: "home", path: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", viewBox: "0 0 24 24" },
  { key: "party", path: "M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zM5 16l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3zM18 14l.75 2.25L21 17l-2.25.75L18 20l-.75-2.25L15 17l2.25-.75L18 14z", viewBox: "0 0 24 24" },
  { key: "star", path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", viewBox: "0 0 24 24" },
  { key: "heart", path: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z", viewBox: "0 0 24 24" },
  { key: "camping", path: "M12 2L2 22h20L12 2zM12 7l6 12H6l6-12zM8 22v-4h8v4", viewBox: "0 0 24 24" },
  { key: "work", path: "M20 7h-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM10 5h4v2h-4V5z", viewBox: "0 0 24 24" },
  { key: "gift", path: "M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z", viewBox: "0 0 24 24" },
  { key: "restaurant", path: "M18 3a1 1 0 00-1 1v7h-2V4a1 1 0 10-2 0v7H9V4a1 1 0 10-2 0v7a4 4 0 004 4v5a1 1 0 102 0v-5a4 4 0 004-4V4a1 1 0 00-1-1z", viewBox: "0 0 24 24" },
  { key: "coffee", path: "M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3", viewBox: "0 0 24 24" },
  { key: "plane", path: "M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z", viewBox: "0 0 24 24" },
  { key: "car", path: "M5 17a2 2 0 104 0 2 2 0 00-4 0zM15 17a2 2 0 104 0 2 2 0 00-4 0zM5 9l1.5-4.5A2 2 0 018.3 3h7.4a2 2 0 011.8 1.5L19 9M3 9h18v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM5 9h14", viewBox: "0 0 24 24" },
  { key: "fitness", path: "M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z", viewBox: "0 0 24 24" },
  { key: "pet", path: "M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM5.5 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM18.5 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM12 8c2.21 0 4 1.79 4 4v7h-8v-7c0-2.21 1.79-4 4-4zM4 16c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM20 16c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z", viewBox: "0 0 24 24" },
  { key: "baby", path: "M12 2a3 3 0 100 6 3 3 0 000-6zM6 10a2 2 0 100 4 2 2 0 000-4zM18 10a2 2 0 100 4 2 2 0 000-4zM12 10c3.31 0 6 2.69 6 6v4H6v-4c0-3.31 2.69-6 6-6z", viewBox: "0 0 24 24" },
  { key: "garden", path: "M12 22V12M12 12c-2-4-6-4-6-8a4 4 0 018 0c0 4-4 4-6 8M12 12c2-4 6-4 6-8a4 4 0 00-8 0c0 4 4 4 6 8M7 18h10", viewBox: "0 0 24 24" },
  { key: "book", path: "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z", viewBox: "0 0 24 24" },
  { key: "music", path: "M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM21 16a3 3 0 11-6 0 3 3 0 016 0z", viewBox: "0 0 24 24" },
  { key: "celebration", path: "M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7l2-7zM5 3l2 2M19 3l-2 2M5 21l2-2M19 21l-2-2M3 12h2M19 12h2", viewBox: "0 0 24 24" },
];

// Get icon info by key
export function getListIcon(key: ListIcon) {
  return LIST_ICONS.find((i) => i.key === key) ?? LIST_ICONS[0];
}
