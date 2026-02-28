# PRD: PWA (Progressive Web App) Support

## Introduction

Convert the Grocery AI app into a Progressive Web App so users can install it on their iPhone home screen for quick access. The app should work fully offline, with AI categorization resuming automatically when connectivity returns.

## Goals

- Enable "Add to Home Screen" installation on iOS and other devices
- Provide full offline functionality - app loads and works without internet
- Cache all static assets (HTML, CSS, JS, images) for instant loading
- Gracefully handle AI categorization when offline (defer until online)
- Display app-like experience (standalone mode, no browser UI)
- Show clear offline status indicator to users
- Allow manual refresh of pending categorizations

## User Stories

### US-001: Create Web App Manifest

**Description:** As a user, I want the app to have proper metadata so it installs with the correct name, icon, and appearance on my home screen.

**Acceptance Criteria:**

- [ ] Create `public/manifest.json` with name "Grocery AI", short_name "Grocery AI", description
- [ ] Set `display: "standalone"` for full-screen app experience
- [ ] Set `background_color` and `theme_color` to match app branding
- [ ] Define icon paths for all required sizes (192x192, 512x512, and iOS maskable)
- [ ] Add manifest link in `app/layout.tsx` via Next.js metadata API
- [ ] Typecheck/lint passes

### US-002: Generate PWA Icons

**Description:** As a user, I want the app icon to appear on my home screen so it looks like a native app.

**Acceptance Criteria:**

- [ ] Create `public/icon-192.png` (192x192px) - standard PWA icon
- [ ] Create `public/icon-512.png` (512x512px) - high-resolution PWA icon
- [ ] Create `public/apple-touch-icon.png` (180x180px) - iOS home screen icon
- [ ] Create `public/icon-maskable.png` (512x512px with safe zone) - Android adaptive icon
- [ ] Add `<link rel="apple-touch-icon">` in layout metadata
- [ ] Icons use existing brand identity (gradient square with grid pattern)

### US-003: Implement Service Worker for Offline Caching

**Description:** As a user, I want the app to load and function without internet so I can access my grocery list anywhere.

**Acceptance Criteria:**

- [ ] Create service worker (`public/sw.js`) that caches all static assets on install
- [ ] Cache Next.js static chunks (`/_next/static/*`)
- [ ] Cache public assets (manifest, icons)
- [ ] Cache Google Fonts responses (leverage browser/CDN caching, no self-hosting needed)
- [ ] Implement cache-first strategy for static assets
- [ ] Implement network-first with cache fallback for app pages
- [ ] Service worker activates and controls pages correctly
- [ ] Typecheck/lint passes

### US-004: Register Service Worker in App

**Description:** As a user, I want the service worker to be automatically registered when I load the app so offline support works without manual setup.

**Acceptance Criteria:**

- [ ] Create client-side service worker registration (in `app/page.tsx` or dedicated hook)
- [ ] Register only in production build (not during dev)
- [ ] Handle registration success and update available events
- [ ] Service worker registration does not block initial render
- [ ] Typecheck/lint passes

### US-005: Handle Offline AI Categorization Gracefully

**Description:** As a user, when I add items offline, I want them to be categorized automatically when I'm back online so I don't have to manually re-trigger categorization.

**Acceptance Criteria:**

- [ ] Detect when categorization API call fails due to network
- [ ] Store pending categorization requests (itemId, itemName) in localStorage
- [ ] When app detects network restoration (`online` event), retry pending categorizations
- [ ] Items with pending categorization show a "waiting for connection" indicator
- [ ] Pending items automatically categorize within 5 seconds of connectivity restoration
- [ ] Typecheck/lint passes

### US-006: Update Layout Metadata for PWA

**Description:** As a developer, I need proper HTML metadata so the app is recognized as a PWA by browsers and devices.

**Acceptance Criteria:**

- [ ] Add `manifest` to Next.js metadata export in `app/layout.tsx`
- [ ] Add `apple-mobile-web-app-capable` meta tag (content="yes")
- [ ] Add `apple-mobile-web-app-status-bar-style` meta tag
- [ ] Add `apple-mobile-web-app-title` meta tag
- [ ] Add `mobile-web-app-capable` meta tag
- [ ] Typecheck/lint passes

### US-007: Display Offline Status Indicator

**Description:** As a user, I want to see when I'm offline so I understand why categorization isn't working.

**Acceptance Criteria:**

- [ ] Detect online/offline status using `navigator.onLine` and `online`/`offline` events
- [ ] Show a subtle banner/indicator when offline (e.g., "You're offline - categorization will resume when connected")
- [ ] Indicator appears at top of app, below header
- [ ] Indicator automatically hides when connection is restored
- [ ] Does not block interaction with the app
- [ ] Typecheck/lint passes

### US-008: Add Manual Refresh Button for Pending Items

**Description:** As a user, I want a button to manually retry categorization of pending items so I don't have to wait if I know I'm back online.

**Acceptance Criteria:**

- [ ] Add a "Refresh Categories" button (visible only when there are pending items)
- [ ] Button shows count of pending items (e.g., "Retry 3 items")
- [ ] Clicking button triggers categorization for all pending items
- [ ] Button shows loading state during categorization
- [ ] Button hides when no pending items remain
- [ ] Typecheck/lint passes

## Functional Requirements

- FR-1: The app must serve a valid Web App Manifest at `/manifest.json`
- FR-2: The app must register a service worker that caches all assets needed for offline use
- FR-3: All static assets (JS, CSS, fonts) must be cached and available offline
- FR-4: When offline, new items must still be addable and stored in localStorage
- FR-5: When offline, new items must be placed in "other" section with a pending state
- FR-6: When network is restored, pending items must be automatically categorized
- FR-7: The app must display in standalone mode (no browser chrome) when launched from home screen
- FR-8: App icons must be provided for iOS (apple-touch-icon), Android (maskable), and standard PWA sizes
- FR-9: An offline indicator must be displayed when the app detects no network connectivity
- FR-10: A "Refresh Categories" button must be shown when there are items pending categorization

## Non-Goals

- No push notifications
- No install prompt banner (user manually adds to home screen)
- No background sync API (uses simple localStorage + online event)
- No service worker update notifications to user
- No caching of API responses (categorization always uses fresh API call)
- No self-hosting of Google Fonts (rely on browser/CDN caching)

## Technical Considerations

### Next.js PWA Setup

- Use Next.js built-in metadata API for manifest (no external plugin needed)
- Service worker is a static file in `public/sw.js`
- Service worker scope covers the entire app origin

### Offline Categorization Strategy

```
[User adds item offline]
    ↓
[Item saved to localStorage with section: "other"]
    ↓
[Item marked with pendingCategorization: true]
    ↓
[Offline indicator shows at top of app]
    ↓
[App listens for 'online' event OR manual refresh click]
    ↓
[When online, batch categorize all pending items]
    ↓
[Update items with correct sections, clear pending flag]
```

### Assets to Cache

- `/` (app shell)
- `/manifest.json`
- `/_next/static/*` (JS chunks, CSS)
- `/icon-192.png`, `/icon-512.png`
- Google Fonts - rely on browser caching from CDN

### iOS-Specific Considerations

- iOS does not support service workers fully - focus on app manifest and icons
- iOS ignores `display: standalone` but uses `apple-mobile-web-app-capable`
- iOS needs apple-touch-icon at 180x180px
- Status bar style should be `default` (light) or `black-translucent` based on theme

## Success Metrics

- App installs successfully from Safari "Add to Home Screen"
- App launches in standalone mode (no Safari UI)
- App loads and displays grocery list when airplane mode is on
- New items can be added while offline
- Offline indicator appears within 1 second of losing connectivity
- Pending items get categorized within 5 seconds of connectivity restoration
- Refresh button successfully categorizes pending items when clicked

## Open Questions

None - all questions resolved.
