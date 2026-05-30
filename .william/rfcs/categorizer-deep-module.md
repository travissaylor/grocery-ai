# RFC: Categorizer deep module

Status: draft
Owner: unassigned
Origin: `/improve-codebase-architecture` analysis, May 2026

## Problem

AI categorization — a single logical operation — is spread across at least nine fragments inside `app/page.tsx`, the API route, and `localStorage`. The fragments couple tightly to one another but expose a thin, leaky surface to the rest of the app.

Concretely, today the following move together to implement one feature:

- A `useOnlineStatus` hook wrapping `navigator.onLine`.
- A `loadPendingCategorizations` / `savePendingCategorizations` helper pair backed by its own `localStorage` key.
- Four pieces of React state: `categorizingItems: Set<string>`, `pendingCategorizations: PendingCategorization[]`, `isRetryingPending: boolean`, `categorizationFailedMessage: string | null`.
- Two `GroceryItem` fields (`pendingCategorization`, `categorizationFailed`) that are transient runtime state but get persisted to disk because they ride on the item.
- Five `useEffect`s: persisting the queue, auto-dismissing the failure banner, subscribing to the `online` event for retries, and others.
- A 65-line `async function categorizeItem` that distinguishes API errors from network errors and updates four observable stores.
- A separate `retryPendingCategorizations` for the manual-retry button.
- An `assignSection` for the user-picks-a-section recovery path.
- The Next.js API route at `app/api/categorize/route.ts` that talks to Gemini.

### Integration risk at the seams

- **Three retry paths, partial dedupe.** An item can be retried by (a) the `online` event listener, (b) the manual retry button, (c) the page-reload-rehydrates-queue path. Today these can overlap; nothing in the surface enforces single-flight per `itemId`.
- **Transient state is persisted.** Putting `pendingCategorization` / `categorizationFailed` on `GroceryItem` means the values are written to `localStorage` with the list. On reload, items can come back marked as failed or pending forever, with no live request behind them.
- **Cancellation is unsafe.** When a user deletes an item before classification finishes, the in-flight request still calls `setItems` to apply the section to the now-deleted id. The update silently no-ops today, but the pattern is fragile.
- **UI states are computed in three places.** Whether to render a shimmer, a clock icon, or a warning icon depends on combining `categorizingItems.has(id)`, `item.pendingCategorization`, and `item.categorizationFailed`. There's no single source of truth for "what's happening with this item right now."

### Why this hurts navigation and maintenance

- The whole feature is unreachable from tests. There are zero tests in the repo; the function shape makes it expensive to write the first one (you'd have to render `page.tsx`).
- Any change to failure UX touches: the API route, four state stores in `page.tsx`, two effects, and the item shape.
- Reading `page.tsx` for any other reason means scrolling past 200+ lines of categorization concerns.
- Onboarding contributors must understand the implicit contract between four mirrored stores before they can safely change anything in the feature.

## Proposed interface

A React-first deep module with a trivial default-case API and a small "advanced" surface for the manual flows. The shape borrows from three independent design sketches; see the **Alternatives considered** section.

### Domain types

```ts
type CategorizationStatus =
  | { state: "running" }
  | { state: "pending-offline" }
  | { state: "failed" }
  | { state: "done"; section: SectionKey };
```

`GroceryItem` is reduced to domain data only — drop the `pendingCategorization` and `categorizationFailed` fields. The item carries `section` (initially `FALLBACK_SECTION_KEY`); transient status lives in the categorizer.

### Public React API

```ts
type UseCategorizerOptions = {
  // Called when an item reaches `done`. The caller applies the section
  // to its own item store. The categorizer never mutates items directly.
  onCategorized: (itemId: string, section: SectionKey) => void;
};

interface Categorizer {
  // Submit an item for classification. Idempotent per itemId — a second
  // call while the first is in-flight or queued is a no-op.
  categorize(itemId: string, name: string): void;

  // Drop an in-flight or queued submission. Safe to call for unknown ids.
  cancel(itemId: string): void;

  // Per-item status, subscribed at the row level so unrelated rows do
  // not re-render when one item's status changes.
  useStatus(itemId: string): CategorizationStatus | undefined;

  // Off-the-happy-path operations live here.
  advanced: {
    retryAll(): void;
    assignManually(itemId: string, section: SectionKey): void;
    usePendingIds(): string[]; // for the "Retry N" banner
    useFailedIds(): string[];  // for the failed-section-picker UI
  };
}

function useCategorizer(opts: UseCategorizerOptions): Categorizer;
```

### Test-only factory

```ts
function createCategorizer(deps: {
  classifier: ClassifierPort;
  online: OnlinePort;
  storage: StoragePort;
}): CategorizerInstance;

// Provider used in tests to bind a hand-built instance into the React tree.
const CategorizerProvider: React.FC<{ instance: CategorizerInstance; children: ReactNode }>;
```

In production no provider is mounted; `useCategorizer` lazily constructs a module-scoped singleton wired to the production adapters on first use.

### Usage example — the common case

```tsx
function Home() {
  const items = useShoppingItems(activeList); // future candidate-1 hook
  const categorizer = useCategorizer({
    onCategorized: items.assignSection,
  });

  const onAdd = (name: string) => {
    const item = items.add(name); // returns the new item
    categorizer.categorize(item.id, name);
  };

  const onRemove = (id: string) => {
    categorizer.cancel(id);
    items.remove(id);
  };

  return (
    <>
      <RetryBanner />
      <ItemList
        items={items.all}
        renderItem={(item) => (
          <Row item={item} status={categorizer.useStatus(item.id)} />
        )}
      />
    </>
  );
}

function RetryBanner() {
  const { advanced } = useCategorizer({ onCategorized: noop });
  const pending = advanced.usePendingIds();
  if (pending.length === 0) return null;
  return (
    <button onClick={advanced.retryAll}>
      Retry {pending.length} item{pending.length !== 1 ? "s" : ""}
    </button>
  );
}
```

The row renders shimmer / clock / warning / nothing purely from its `status`. No `useEffect`s in the caller, no localStorage helpers, no online listener, no mirrored state.

### Complexity the module hides

- The HTTP shape of `POST /api/categorize` and the API/network/unknown error taxonomy.
- The `localStorage` key, JSON encoding, and rehydration on construction.
- The `window` `online` event listener and its drain-the-queue behavior.
- A 100ms stagger between retried requests.
- Single-flight per `itemId` across all three retry paths (manual button, online event, rehydrate).
- Per-id pub/sub so a single row's status change does not invalidate the whole list.
- Mapping the unknown / API-error result to `failed` and clearing the in-flight state.
- A best-effort cancellation (drop the result if the id has been cancelled).

## Dependency strategy

**Category 3 — Remote-but-owned, wrapping a Category 4 (true external).**

The categorizer talks to `POST /api/categorize` (a service we own), which in turn calls Gemini (which we do not). The clean cut is at the categorizer's edge: define a `ClassifierPort` that abstracts the *intent* ("classify this name → section"), and let production wire it to `fetch`.

```ts
interface ClassifierPort {
  classify(name: string, opts: { signal: AbortSignal }): Promise<SectionKey>;
  // Throws NetworkError | ApiError. Module distinguishes them.
}

interface OnlinePort {
  isOnline(): boolean;
  subscribe(listener: (online: boolean) => void): () => void;
}

interface StoragePort {
  load(): PendingCategorization[];
  save(queue: PendingCategorization[]): void;
}
```

| Port             | Production adapter                                            | Test adapter                                                                |
| ---------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `ClassifierPort` | `fetchClassifier` — `POST /api/categorize`, maps error shapes | `InMemoryClassifier` — preset map + `failNext(reason)` + `delayMs` knobs    |
| `OnlinePort`     | `navigatorOnline` — wraps `navigator.onLine` + `online` event | `FakeOnline` — `setOnline(bool)` flips synchronously, notifies subscribers  |
| `StoragePort`    | `localStorageQueue(KEY)`                                      | `InMemoryStorage` — backed by a plain array                                 |

Each adapter is a small file (10-30 lines). The categorizer constructor is the only place the three are wired. Tests never touch globals.

## Testing strategy

### New boundary tests

Tests live at the boundary of `Categorizer` and assert on observable behavior, not on internal state.

- **Happy path.** `categorize(id, "milk")` → status flips to `running` → classifier resolves with `"dairy"` → status reaches `done` → `onCategorized` fired exactly once with `(id, "dairy")`.
- **API failure.** Classifier rejects with `ApiError` → status reaches `failed` → `onCategorized` never fired.
- **Manual recovery.** From `failed`, `advanced.assignManually(id, "produce")` fires `onCategorized(id, "produce")` and removes the id from `useFailedIds()`.
- **Offline path.** With `online=false`, `categorize(id, name)` → status is `pending-offline`, classifier was not called.
- **Reconnect drain.** Two ids queued offline, `online` flips to true → both classifiers are called within ~100ms stagger → both reach `done`.
- **Manual retry.** Two ids in `pending-offline` → `advanced.retryAll()` → both attempted (with stagger) regardless of online state. (Or define semantics: only retry when online; document the choice.)
- **Single-flight.** `categorize(id, "milk")` called twice in quick succession → classifier invoked exactly once.
- **Cross-path single-flight.** A queued id; reconnect fires *and* `retryAll()` is called → classifier invoked exactly once.
- **Cancellation.** `categorize(id, "milk")` → classifier is in-flight → `cancel(id)` → classifier resolves anyway → `onCategorized` is NOT called; `useStatus(id)` returns `undefined`.
- **Reload rehydration.** Construct categorizer with a non-empty `StoragePort` → ids appear in `useFailedIds()` / `usePendingIds()` immediately → if online, drain begins automatically.
- **Persistence write-through.** `categorize(id, name)` while offline → `StoragePort.save` was called with the new id.
- **Persistence on success.** Once an id reaches `done`, it is removed from `StoragePort` (no leaked entries across reloads).
- **No transient state leaks to items.** `GroceryItem` shape no longer carries `pendingCategorization` / `categorizationFailed`; assert the type does not have these fields.

### Old tests to delete

There are no existing tests, so nothing to delete. (Worth noting because the migration cost is zero on this front and the comparison case "boundary tests replace shallow-module tests" is degenerate here.)

### Test environment needs

- A test runner. The project currently has none — Vitest or Node's built-in `node:test` are both fine; Vitest is more idiomatic for React. Adding the runner is a prerequisite, not optional.
- React Testing Library to exercise the `useStatus` / `usePendingIds` hooks under `CategorizerProvider`.
- A `FakeOnline` adapter that lets tests flip connectivity synchronously without `window`.
- A `fakeTimers` strategy (Vitest's `vi.useFakeTimers()`) for the 100ms stagger so reconnect-drain tests don't actually wait.

## Implementation recommendations

Durable guidance, not coupled to file paths.

### What the module should own

- The lifecycle of a single classification attempt: submit, succeed, fail, cancel.
- The offline queue's identity — which ids are pending, in what order — and its persistence.
- The decision of *when* to dispatch: never on its own, only in response to `categorize`, an online-becomes-true edge, or an explicit `retryAll`.
- Single-flight guarantees across all dispatch paths.
- Per-id observability (the React hook surface), implemented as targeted pub/sub.

### What the module should hide

- The transport. Callers must not know whether classification goes over HTTP, gRPC, a Web Worker, a local model, or a static lookup table.
- The error taxonomy. The world outside sees one of four states; the network-vs-API distinction stays internal.
- The persistence format and key. Future migrations to IndexedDB or a server-side store must not require caller changes.
- The reconnect detection mechanism. Today it's `navigator.onLine` + `window` events; that's an implementation detail.
- The retry timing (stagger interval, eventual backoff if introduced).

### What the module should expose

- A small set of verbs whose names match the user-visible operation: `categorize`, `cancel`, `retryAll`, `assignManually`.
- A subscription-shaped status read: `useStatus(itemId)` and the two id-list hooks. Status is the single source of truth for UI presentation of the four states; callers must not synthesize them from anywhere else.
- A `onCategorized` callback as the only mutation route into the caller's item store. The module never reaches into caller state.
- A factory + provider for tests; a singleton path for production. Both reuse the same instance type so test code and production code are not divergent.

### How callers migrate

1. Add a test runner and a basic harness (one-time, blocks the rest of the work).
2. Implement the module with its three ports and adapters in isolation. Write the boundary tests first; let them drive the surface.
3. In the page, replace the four state stores (`categorizingItems`, `pendingCategorizations`, `isRetryingPending`, `categorizationFailedMessage`) and the helpers (`loadPendingCategorizations`, `savePendingCategorizations`) with `useCategorizer({ onCategorized })`. The replacement is mechanical: each store maps to a hook or is deleted.
4. Replace the inline `categorizeItem` and `retryPendingCategorizations` with `categorizer.categorize` and `categorizer.advanced.retryAll`. Delete the `useEffect` that listens for the `online` event; the module owns it now.
5. Remove `pendingCategorization` and `categorizationFailed` from the `GroceryItem` type. Update rendering to use `useStatus(item.id)` instead of reading from the item. Migrate any persisted items by stripping the fields on read (one-shot; lists outlive the type change).
6. Replace the failure-picker dropdown's logic with `useFailedIds()` + `advanced.assignManually(id, section)`.
7. Replace the "Retry N items" button with `usePendingIds()` + `advanced.retryAll()`.
8. Delete the `useOnlineStatus` hook and its only remaining caller (the offline banner) — either fold the banner into the categorizer's surface or keep `useOnlineStatus` as a tiny utility hook if other UI still needs it. (It does, for the "you're offline" header banner — keep it as a 12-line utility, separate from the categorizer.)

A reasonable order of merge: prerequisite test harness → module + tests (no caller changes) → callsite migration in a single commit (the surface is small enough that splitting is more painful than the win).

## Alternatives considered

Three independent design sketches were produced in parallel as part of the analysis.

**Design A — Minimal (one verb).** Collapsed everything into a single `enqueue` method overloaded to mean submit, retry, and manual-assign, plus a `useSyncExternalStore`-shaped subscribe/getSnapshot pair. Rejected because (a) `retryAll` becoming "iterate the snapshot at the call site and call enqueue per id" is foot-gun behavior that leaks queue knowledge back into the caller; (b) overloading `enqueue` to mean three semantically different operations forces every reviewer to read the doc comment. Worth keeping from it: pushing transient status off `GroceryItem` entirely.

**Design B — Maximally flexible (events, middleware, retry policy, batch, classifier chain, cancel, hint, priority).** A future-proofed surface. Rejected because the current product has one caller and no roadmap that justifies middleware, batch, or telemetry. The features it anticipates would not require breaking changes to add later. Worth keeping from it: `cancel(itemId)`, which corresponds to a latent bug today.

**Design C — Trivial default with `.advanced` escape hatch (chosen).** Optimizes the dominant call site, keeps secondary verbs explicit but signposted off-path, and uses the conventional React singleton-with-provider pattern for test injection. Borrowing `cancel` from B and the items-stay-domain-data principle from A.

## Open questions

- **`retryAll` semantics when offline.** Should it no-op, or queue and let reconnect drain? Pick one and document it.
- **Failure-banner copy ownership.** Currently the banner string "Couldn't auto-categorize \"X\" — tap the warning icon…" is generated in `categorizeItem`. The module can expose `useFailedIds()` and let the UI compose the string, which keeps copy out of the module. Recommend that.
- **Migration of persisted items carrying the old transient fields.** On the first read after deploy, strip `pendingCategorization` / `categorizationFailed` from each loaded item. No version bump needed; the fields just disappear.
- **Whether a `RetryBanner` calling `useCategorizer({ onCategorized: noop })` is acceptable.** The wart is real. Alternative: the singleton holds `onCategorized` as a one-time-init slot, and any subsequent `useCategorizer()` call (no args) joins the existing instance. Recommend the latter for ergonomics; document that the first call wins.

## Out of scope

- The other 1,000 lines of `page.tsx`. Item lifecycle (Candidate 1), autocomplete (Candidate 3), modal coordination (Candidate 5), and sharing (Candidate 4) are independent refactors and should not be bundled here.
- Replacing Gemini, batching requests, telemetry, exponential backoff. All reachable later without breaking the surface.
