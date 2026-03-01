# PRD: Light/Dark Mode Toggle

## Introduction

Add a manual light/dark mode toggle to the Grocery AI app, allowing users to choose their preferred theme regardless of system settings. The toggle will be placed in the header and use sun/moon icons for intuitive switching. User preference will persist via localStorage, while still respecting system preference as the default.

## Goals

- Allow users to manually switch between light and dark themes
- Persist theme preference across sessions using localStorage
- Default to system preference when no user preference is set
- Provide clear visual feedback with sun/moon icon toggle
- Ensure smooth transitions between themes

## User Stories

### US-001: Create theme context and provider

**Description:** As a developer, I need a React context to manage theme state so components can access and modify the current theme.

**Acceptance Criteria:**

- [ ] Create `ThemeContext` with theme state (`'light' | 'dark' | 'system'`)
- [ ] Create `ThemeProvider` component that wraps the app
- [ ] Provider reads initial preference from localStorage (key: `theme`)
- [ ] Provider falls back to `'system'` if no localStorage value exists
- [ ] Provider resolves system preference using `matchMedia('(prefers-color-scheme: dark)')`
- [ ] Typecheck passes

### US-002: Apply theme class to document root

**Description:** As a user, I want the app to immediately reflect my theme preference when I load the page or change the setting.

**Acceptance Criteria:**

- [ ] Apply `class="dark"` to `<html>` element when dark mode is active
- [ ] Remove `class="dark"` from `<html>` element when light mode is active
- [ ] Update CSS to use `.dark` class selector instead of `@media (prefers-color-scheme: dark)`
- [ ] Theme applies immediately on page load (no flash of wrong theme)
- [ ] Typecheck passes

### US-003: Create theme toggle component

**Description:** As a user, I want a sun/moon icon button to toggle between light and dark modes.

**Acceptance Criteria:**

- [ ] Create `ThemeToggle` component with icon button
- [ ] Show sun icon (SVG) when in dark mode (clicking switches to light)
- [ ] Show moon icon (SVG) when in light mode (clicking switches to dark)
- [ ] Button has accessible label: "Switch to light mode" / "Switch to dark mode"
- [ ] Button has hover and focus states matching design system
- [ ] Smooth icon transition (150ms) on theme change
- [ ] Typecheck passes

### US-004: Add theme toggle to header

**Description:** As a user, I want the theme toggle visible in the header so I can easily find and use it.

**Acceptance Criteria:**

- [ ] Place `ThemeToggle` in header, aligned to the right side
- [ ] Toggle is vertically centered with app title
- [ ] Proper spacing between toggle and other header elements
- [ ] Toggle remains visible and accessible on mobile viewports
- [ ] Typecheck passes

### US-005: Persist theme preference

**Description:** As a user, I want my theme preference to persist so I don't have to re-select it every visit.

**Acceptance Criteria:**

- [ ] Save theme choice to localStorage immediately on change
- [ ] Key: `theme`, values: `'light'` | `'dark'` | `'system'`
- [ ] Theme persists across page reloads and browser sessions
- [ ] Typecheck passes

### US-006: Update CSS for class-based dark mode

**Description:** As a developer, I need to update the CSS to use class-based dark mode instead of media query only.

**Acceptance Criteria:**

- [ ] Convert `@media (prefers-color-scheme: dark)` rules to `.dark` class selector
- [ ] Both media query AND class should trigger dark mode (for system preference support)
- [ ] All existing dark mode styles continue to work
- [ ] Smooth 300ms transition on theme change
- [ ] Typecheck passes

### US-007: Prevent theme flash on initial load

**Description:** As a user, I want the correct theme to appear immediately without a flash of the wrong theme.

**Acceptance Criteria:**

- [ ] Add inline script in `<head>` to apply theme class before React hydrates
- [ ] Script reads from localStorage and applies `.dark` class if needed
- [ ] Script also checks system preference when no localStorage value exists
- [ ] No visible flash of incorrect theme on page load
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Create `ThemeContext` and `ThemeProvider` to manage theme state (`'light' | 'dark'` | `'system'`)
- FR-2: Apply/remove `dark` class on `<html>` element based on resolved theme
- FR-3: Create `ThemeToggle` component with sun/moon icons and accessible labels
- FR-4: Place `ThemeToggle` in header, right-aligned
- FR-5: Persist theme preference to localStorage key `theme`
- FR-6: Update `globals.css` to support both `.dark` class and `prefers-color-scheme: dark`
- FR-7: Add blocking inline script in `<head>` to prevent theme flash on load
- FR-8: Listen for system preference changes when theme is set to `'system'`

## Non-Goals

- No theme options beyond light and dark (no custom themes)
- No theme preview before applying
- No per-device sync (no account-based preference sync)
- No animation preferences tied to theme
- No separate contrast settings

## Technical Considerations

- Use Tailwind's `darkMode: 'class'` configuration (if using Tailwind dark mode)
- Inline script must run before React to prevent flash
- Use `useLayoutEffect` or similar to ensure theme applies before paint
- Consider using `next-themes` package for simplified implementation (optional)
- System preference listener should update theme when in `'system'` mode
- CSS transitions should respect `prefers-reduced-motion`

## Success Metrics

- Theme toggle responds within 100ms of click
- No flash of incorrect theme on page load
- Theme persists across sessions
- Users can switch themes in under 2 clicks
- Passes accessibility audit for toggle button

## Open Questions

- Should we expose a "Use system" option in the UI, or just hide it after user makes a selection?
- Should the toggle show a third state when using system preference?

## Decisions

- **Toggle placement:** Header, right-aligned
- **Toggle style:** Sun/moon icon button with smooth transition
- **Default behavior:** Start with system preference, allow user override
- **Persistence:** localStorage only
