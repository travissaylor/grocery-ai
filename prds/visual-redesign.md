# PRD: Visual Redesign & Branding

## Introduction

Transform the Grocery List AI app from a basic-looking prototype into a polished, professional-grade application with a distinctive visual identity. The redesign will establish a clean and modern aesthetic (inspired by Apple Notes), featuring an abstract geometric favicon, a cohesive blue/indigo color scheme, and refined UI components with smooth animations. This complete visual overhaul will elevate the app to feel like a premium productivity tool.

## Goals

- Establish a cohesive brand identity with custom favicon and professional metadata
- Implement a clean, modern design system with blue/indigo color palette
- Refine all UI components with subtle shadows, smooth animations, and generous whitespace
- Improve visual hierarchy and user experience through layout enhancements
- Create a polished, app-like feel that builds user trust and delight

## User Stories

### US-001: Create custom abstract favicon

**Description:** As a user, I want a distinctive favicon so I can easily identify the app in my browser tabs and bookmarks.

**Acceptance Criteria:**

- [ ] Create SVG favicon with abstract geometric design (gradient, modern shape)
- [ ] Generate multiple favicon sizes (16x16, 32x32, 180x180 for apple-touch-icon)
- [ ] Generate favicon.ico file for broad browser compatibility
- [ ] Create icon.png (512x512) for PWA manifest
- [ ] All favicon files placed in /app directory
- [ ] Typecheck passes

### US-002: Update page metadata

**Description:** As a user, I want proper page title and description so the app looks professional when shared or in browser tabs.

**Acceptance Criteria:**

- [ ] Update layout.tsx metadata with title "Grocery AI - Smart Shopping Lists"
- [ ] Add description: "AI-powered grocery list that automatically organizes items by store section"
- [ ] Set proper Open Graph metadata for social sharing (title, description, image)
- [ ] Set Twitter card metadata
- [ ] Set theme-color for mobile browser theming (indigo-600: #4F46E5)
- [ ] Typecheck passes

### US-003: Implement blue/indigo design system

**Description:** As a developer, I need a consistent color palette so all components have a unified look.

**Acceptance Criteria:**

- [ ] Define CSS custom properties for color tokens in globals.css
- [ ] Primary color: Indigo-600 (#4F46E5) for main actions
- [ ] Secondary colors: Indigo-100, Indigo-50 for backgrounds and highlights
- [ ] Neutral colors: Slate palette for text and borders
- [ ] Accent color: Indigo-400 for hover states
- [ ] Define spacing scale (4px base unit)
- [ ] Define shadow tokens (sm, md, lg with indigo tint)
- [ ] Typecheck passes

### US-004: Redesign header and brand identity

**Description:** As a user, I want a polished header so the app feels professional and branded.

**Acceptance Criteria:**

- [ ] Create centered header with app logo/name
- [ ] Display app name "Grocery AI" with subtle icon or mark
- [ ] Add tagline: "Smart shopping lists"
- [ ] Include subtle gradient or accent line beneath header
- [ ] Generous padding and whitespace
- [ ] Typecheck passes

### US-005: Redesign item input area

**Description:** As a user, I want an elegant input area that invites me to add items.

**Acceptance Criteria:**

- [ ] Large, prominent input field with subtle shadow
- [ ] Input has focus ring animation in brand color
- [ ] Add button styled as primary CTA (indigo, rounded)
- [ ] Hover and active states with smooth transitions (150ms)
- [ ] Input placeholder text: "Add an item (e.g., milk, bread...)"
- [ ] Show keyboard shortcut hint "Press ⏎ to add" below input
- [ ] Typecheck passes

### US-006: Redesign section cards

**Description:** As a user, I want beautifully styled section cards so the app feels modern and organized.

**Acceptance Criteria:**

- [ ] Section cards have subtle shadow and rounded corners (lg)
- [ ] Section headers styled with brand color accent
- [ ] Smooth expand/collapse animation if sections collapse
- [ ] Alternating or consistent card backgrounds
- [ ] Generous internal padding (16px minimum)
- [ ] Typecheck passes

### US-007: Redesign grocery item rows

**Description:** As a user, I want polished item rows with smooth interactions so adding/removing items feels delightful.

**Acceptance Criteria:**

- [ ] Custom styled checkbox with brand color when checked
- [ ] Smooth strikethrough animation when item is checked (200ms)
- [ ] Remove button appears on hover (subtle, not distracting)
- [ ] Row hover state with subtle background change
- [ ] Consistent height and spacing between items
- [ ] Typecheck passes

### US-008: Add loading and empty states

**Description:** As a user, I want helpful feedback when the list is empty or loading so the app never feels broken.

**Acceptance Criteria:**

- [ ] Empty state shows friendly illustration or icon
- [ ] Empty state message: "Your list is empty. Add your first item!"
- [ ] Loading spinner styled with brand colors
- [ ] AI categorization shows subtle loading indicator
- [ ] Typecheck passes

### US-009: Add smooth animations and transitions

**Description:** As a user, I want subtle animations so the app feels polished and responsive.

**Acceptance Criteria:**

- [ ] Items fade in when added (150ms ease-out)
- [ ] Items fade out when removed (150ms ease-in)
- [ ] Section cards animate in on initial load (staggered)
- [ ] Hover transitions are smooth (150ms)
- [ ] Subtle shimmer/pulse animation when AI is categorizing an item
- [ ] Respect prefers-reduced-motion media query
- [ ] Typecheck passes

### US-010: Dark mode refinement

**Description:** As a user, I want a beautiful dark mode so I can use the app comfortably at night.

**Acceptance Criteria:**

- [ ] Dark mode uses indigo-400 as primary (brighter for contrast)
- [ ] Background uses slate-950 or similar deep dark
- [ ] Cards use slightly lighter dark (slate-900)
- [ ] Text maintains proper contrast ratios (WCAG AA)
- [ ] Smooth transition when system preference changes
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Create and implement custom favicon in multiple formats (ico, svg, png sizes)
- FR-2: Update metadata in layout.tsx with proper title, description, OG tags, and theme color
- FR-3: Define CSS custom properties for color tokens, spacing, and shadows
- FR-4: Redesign header component with app branding and tagline
- FR-5: Style input field with focus animations, primary CTA button, and keyboard shortcut hint
- FR-6: Style section cards with shadows, rounded corners, and accent headers
- FR-7: Style item rows with custom checkboxes, smooth check animation, and hover states
- FR-8: Create empty state with illustration/icon and helpful message
- FR-9: Implement entrance/exit animations for items and sections, plus AI categorization animation
- FR-10: Refine dark mode with proper indigo accent and contrast ratios

## Non-Goals

- No user authentication or account system
- No list sharing or collaboration features
- No multiple list support
- No settings page or preferences UI
- No PWA manifest or offline support (beyond favicon for future PWA)
- No animated illustrations or Lottie animations

## Technical Considerations

- Use CSS custom properties for design tokens to enable easy theming
- Keep animations CSS-based for performance (no JavaScript animation libraries)
- Favicon should be SVG-based for crisp rendering at all sizes
- Use Tailwind's arbitrary values for brand-specific colors until tokens are defined
- Dark mode should use CSS `prefers-color-scheme` media query
- All animations must respect `prefers-reduced-motion` for accessibility

## Success Metrics

- App feels "complete" and professional within 5 seconds of opening
- First-time users immediately understand the app's purpose from header
- Interactions feel responsive with no jank (60fps animations)
- Passes Lighthouse accessibility audit (90+ score)
- Users can distinguish this app from a generic template

## Decisions

- **App name:** Grocery AI
- **AI categorization animation:** Subtle shimmer/pulse effect when categorizing
- **Keyboard shortcut hint:** Show "Press ⏎ to add" below input field
