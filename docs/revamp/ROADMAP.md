# Cerbero Modernization Roadmap

> Started: 2026-06-29 | Status: Phase 3B Complete
>
> The project has been dormant for ~5 years. This document tracks all planned work to bring Cerbero up to date with modern browser APIs, tooling, and best practices.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ⬜ | Not started |
| 🔄 | In progress |
| ✅ | Done |
| ❌ | Blocked |
| 💡 | Idea / under discussion |

---

## Phase 1 — Toolchain modernization

> Goal: make the project buildable and testable with current tooling. No feature changes.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Migrate from `tslint` to `ESLint` + `@typescript-eslint` | ✅ | Used ESLint 8 + `@typescript-eslint/parser` v7. `tslint.json` deleted. `.eslintrc.js` created mirroring original rules. `ban-types` disabled (Phase 4 concern). |
| 1.2 | Update `rollup` from v2 to v4 | ✅ | Migrated all `rollup-plugin-*` → `@rollup/plugin-*`. Build produces all 3 outputs. |
| 1.3 | Update `rollup-plugin-web-worker-loader` or find replacement | ✅ | Plugin is incompatible with Rollup 4. Replaced with a custom inline plugin in `rollup.config.js` that builds the worker via nested `rollup()` call and inlines it as a Blob URL. No changes to `src/`. |
| 1.4 | Update `typescript` from v3 to v5 | ✅ | Updated to v5.8. Required adding `as unknown as NodeStructure` cast in `formatter.ts` and `index.test.ts` (TS5 is stricter about DOM types). Moved from `dependencies` to `devDependencies`. |
| 1.5 | Update `jest` from v26 to v29 + `ts-jest` | ✅ | Updated to v29. Added `jest-environment-jsdom` (separate package in v29). Added `jest.setup.js` to polyfill `TextEncoder`/`TextDecoder` for jsdom v24 compatibility. Added 2 tests to keep branch coverage above 65% (Jest 29 counts branches more precisely). |
| 1.6 | Update `husky` from v7 to v9 | ✅ | Removed `"husky"` key from `package.json`. Added `"prepare": "husky"` script. Created `.husky/pre-commit`. |
| 1.7 | Update `@babel/core` and presets | ✅ | Updated `@babel/core`, `@babel/preset-env`, `@babel/plugin-*` all to `^7.25.0`. Kept v7 (v8 too risky). Added `babelHelpers: 'bundled'` to `@rollup/plugin-babel` (required in v6). |
| 1.8 | Update `concurrently`, `http-server`, `standard-version` | ✅ | `concurrently` → v9, `http-server` → v14, `standard-version` kept at v9. |
| 1.9 | Update GitHub Actions CI to Node 20+ | ✅ | All 3 workflow files updated: Node 12/13 → 20, `actions/checkout@v2` → v4, `actions/setup-node@v1` → v4, `codecov/codecov-action@v1` → v4. |
| 1.10 | Update `tsconfig.json` target from `es5` to `es2017` | ✅ | `target: es2017`, `module: es2020`, added `lib: ["es2017", "dom"]`, `strict: false`. Also excluded test files from build tsconfig (they were being type-checked by rollup). |

---

## Phase 2 — Bug fixes and deprecation removals

> Goal: fix all broken or deprecated APIs. These are correctness issues, not features.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.1 | Replace `window.performance.timing` with `PerformanceNavigationTiming` via `PerformanceObserver` | ✅ | Added `_initPerformance()` using `performance.getEntriesByType('navigation')` with `PerformanceObserver` fallback. **Breaking**: `data.timing` and `data.navigation` shapes changed (relative ms timings instead of epoch timestamps). Performance service now uses `any` input type since browser APIs return runtime objects. |
| 2.2 | Update `web-vitals` from v2 to v5 | ✅ | **Breaking**: In v5 all functions renamed `getCLS→onCLS`, `getFCP→onFCP`, `getLCP→onLCP`, `getTTFB→onTTFB`, `getFID→onINP`. Updated imports and usages in `src/index.ts`. |
| 2.3 | Fix `mouseExit` using non-standard `toElement`/`fromElement` | ✅ | `_receiveMouseOutEvent` now uses `event.relatedTarget` and `event.target`. **Breaking**: `data.elements.fromElement` renamed to `data.elements.target` in mouseExit events. |
| 2.4 | Add `destroy()` public method | ✅ | Cleans up all listeners (click, mouseout, scroll, visibilitychange), clears intervals, terminates worker. Click listener stored as named `_clickHandler` field for proper removal. |
| 2.5 | Fix `timeInPage` counting time while tab is backgrounded | ✅ | Added `_handleVisibilityChange()` using Page Visibility API (`document.hidden`). Interval pauses on `hidden`, resumes on `visible`. |
| 2.6 | Fix typo `addEventListner` → `addEventListener` | ✅ | New `addEventListener` method is the canonical API. Old `addEventListner` kept as `@deprecated` alias delegating to the new method. Major version bump needed before removing the alias. |

---

## Phase 3A — New event types (environment & advanced signals)

> Goal: expose rich user context that previously required separate analytics tools. All new data types discovered during a deep browser API audit (2026-06-29). Each is a new event type emitted through the existing worker pipeline.

### Skipped APIs (documented for future reference)

| API | Reason skipped |
|-----|---------------|
| Battery API | Deprecated, removed from Firefox/Safari, fingerprint risk |
| WebGL renderer string | Known GPU fingerprinting attack surface |
| Font enumeration (`document.fonts`) | Known fingerprinting vector |
| High-entropy Client Hints (`getHighEntropyValues()`) | Requires async permission-like flow, invasive |
| `IdleDetector` | Requires `idle-detection` permission prompt, limited support |
| `prefers-reduced-data` | Chrome-only behind flag |
| `navigator.keyboard` | Chrome/Edge only |

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3A.1 | Add `environment` event | ✅ | One-shot at init. Covers: user prefs (dark mode, reduced motion, high contrast, forced-colors, color gamut), device (CPU cores, RAM, pixel ratio, color depth), input type (touch points, pointer fine/coarse, hover), session context (referrer, history length, iframe, PWA, opened-by-script), locale (timezone, language, languages, hour cycle). `hourCycle` cast via `(dtf as any)` — missing from TS `ResolvedDateTimeFormatOptions` type |
| 3A.2 | Add `network` event | ✅ | Snapshot via `navigator.connection` at init + fires again on `change`. Fields: `effectiveType`, `downlink`, `rtt`, `saveData`. Graceful no-op on browsers without `NetworkInformation` API. Handler stored as `_networkChangeHandler` and removed in `destroy()` |
| 3A.3 | Add `longTask` event | ✅ | `PerformanceObserver` on `longtask` entries (>50ms main thread blocks). Fields: `duration`, `startTime`, `after`. Graceful no-op where `supportedEntryTypes` doesn't include `longtask` (Firefox). Observer disconnected in `destroy()` |
| 3A.4 | Add `privacySignals` event | ✅ | One-shot, runs FIRST in `_initListener`. Fields: `gpc`, `doNotTrack`, `gpcAutoDisabled`. If `gpc === true`: emits event then calls `destroy()` and returns `false` to abort all further init |
| 3A.5 | Add `browserAI` event | ✅ | Fire-and-forget async. Detects presence only — no AI invocations. Fields: `hasChromeAI` (`window.ai`), `chromeAIModel` (async capability check), `hasWebNN` (`navigator.ml`). Chrome 127+ only, graceful no-op elsewhere |
| 3A.6 | Add `slowResource` event | ✅ | `PerformanceObserver` on `resource` entries with `duration > 1000ms`. Fields: `name` (URL), `duration`, `initiatorType`, `startTime`. Observer disconnected in `destroy()` |
| 3A.7 | Add `orientationChange` event | ✅ | Listens to `screen.orientation change`. Fields: `type` (`portrait-primary`\|`landscape-primary`\|etc), `angle`. Guard on `screen.orientation` availability. Handler removed in `destroy()` |

---

## Phase 3B — New browser API integrations

> Goal: deeper integration with browser platform APIs for richer interaction data.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3B.1 | Add `PointerEvents` support | ✅ | Replaced `click` listener with `pointerup` (PointerEvent extends MouseEvent). Added `pointerType` field (`mouse`\|`touch`\|`pen`\|`null`) to click event output. `_clickHandler` now receives `PointerEvent`. |
| 3B.2 | Add `IntersectionObserver` — element visibility tracking | ✅ | New event type: `elementVisible`. New public method `observeElements(selector: string)` — user passes a CSS selector to opt-in. Fields: `selector`, `element`, `visibleRatio`. Graceful no-op where IntersectionObserver is unavailable. Observer disconnected in `destroy()`. |
| 3B.3 | Add `Navigation API` support for SPAs | ✅ | New event type: `navigation`. Tries `window.navigation.addEventListener('navigate', ...)` first (Chrome 102+). Falls back to `popstate`+`hashchange` listeners. Fields: `from`, `to`, `navigationType`. All handlers removed in `destroy()`. |
| 3B.4 | Add `pagehide` flush | ✅ | On `pagehide`, fires `pageUnload` event through the normal callback mechanism. Fields: `timeOnPage` (ms elapsed). Note: `sendBeacon` requires a server URL that Cerbero doesn't manage — the user can call `sendBeacon` from their own `pagehide` callback. |
| 3B.5 | Add rage click detection | ✅ | Built into `_handlePointerUp`. Maintains a `_clickBuffer` (rolling 500ms window). 3+ clicks on the same target = `rageClick` event. Fields: `count`, `target`. Buffer cleared after rage detected. |
| 3B.6 | Add keyboard shortcut tracking | ✅ | New event type: `keyboardShortcut`. `keydown` listener, fires only when at least one modifier key (Ctrl/Meta/Alt) is pressed. Never records bare keystrokes. Fields: `key`, `combo` (e.g. `ctrl+s`), `modifiers` object. |

---

## Phase 4 — API and architecture improvements

> Goal: make the library more flexible and production-ready.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | Allow selective event tracking via config | ⬜ | `new Cerbero({ events: ['click', 'scroll'] })`. Currently all events are always enabled |
| 4.2 | Remove singleton export, allow multiple instances | ⬜ | `export default new Cerbero()` prevents multiple isolated instances on the same page |
| 4.3 | Add tree-shakeable named exports per tracker | ⬜ | `import { ClickTracker } from 'cerbero'` — let bundlers drop what's unused |
| 4.4 | Add plugin system | ⬜ | Allow third-party trackers to hook into the event pipeline without modifying the library |
| 4.5 | Strict TypeScript types throughout | ⬜ | Remove all `any` and `@ts-ignore`. Add proper generic types for the callback payload |
| 4.6 | Add `esm-bundler` output format | ⬜ | Modern bundlers benefit from a non-minified ESM build with pure annotations |
| 4.7 | Add event batching / debounce config | ⬜ | Currently each event fires the callback individually. Batching reduces callback overhead |

---

## Phase 5 — Documentation and ecosystem

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5.1 | Update README with all new events and config options | ⬜ | Current README only documents v1.1.0 API |
| 5.2 | Add TypeDoc for auto-generated API docs | ⬜ | Replace the hand-written table in README |
| 5.3 | Add a live demo page | ⬜ | Update `docs/` with an interactive demo |
| 5.4 | Publish updated version to npm | ⬜ | Coordinate with Phase 1+2 completion at minimum |
| 5.5 | Add CONTRIBUTING.md | ⬜ | Document how to run locally, test, and submit a PR |

---

## Dependency upgrade summary

| Package | Current | Target | Breaking? |
|---------|---------|--------|-----------|
| `typescript` | 3.9.x | 5.x | Minor (tsconfig adjustments) |
| `web-vitals` | 2.1.x | 5.x | **Yes** — `getFID` removed |
| `rollup` | 2.x | 4.x | **Yes** — plugin API |
| `jest` | 26.x | 29.x | Minor |
| `ts-jest` | 26.x | 29.x | Minor |
| `tslint` | 6.x | **removed** | Replace with ESLint |
| `husky` | 7.x | 9.x | **Yes** — config format |
| `@babel/core` | 7.x | 8.x | Minor |
| `concurrently` | 5.x | latest | No |
| `http-server` | 0.x | latest | No |

---

## Decision log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-06-29 | Start modernization | Project dormant for 5 years; browser APIs and tooling have significantly evolved |
| 2026-06-29 | Treat `addEventListner` typo fix as a major version bump | It's a public API rename — existing users would break silently |
| 2026-06-29 | Keep Web Worker architecture | Still the right call for offloading processing from the main thread |
| 2026-06-29 | Target `es2017` instead of `es5` | All major browsers support it; removes need for most Babel polyfills |
| 2026-06-29 | Use `any` in Performance service input type | `PerformanceNavigationTiming` is a complex DOM interface; test fixtures can't satisfy it fully without extensive mocking. Runtime data always comes from the browser API. |
| 2026-06-29 | web-vitals v5: `getCLS/getFCP/getLCP/getTTFB` → `onCLS/onFCP/onLCP/onTTFB` | Breaking rename in v3+; v5 drops the old names entirely. `getFID` → `onINP` (metric replaced). |
| 2026-06-29 | `mouseExit` elements key renamed `fromElement` → `target` | `fromElement` was non-standard (Chrome-only). Standard `event.target` is the same element. Breaking change in event payload shape. |
| 2026-06-29 | Phase 3 split into 3A (new event types) and 3B (browser API integrations) | After deep browser API audit, identified 7 high-value new event types (environment, network, longTask, privacySignals, browserAI, slowResource, orientationChange) distinct from the platform integrations already planned |
| 2026-06-29 | GPC auto-disable: if `navigator.globalPrivacyControl === true`, emit only `privacySignals` and stop | Legal/ethical requirement — GPC is a legally recognized opt-out signal in several jurisdictions (CCPA) |
| 2026-06-29 | `pointerup` instead of `click` for click tracking | `PointerEvent` (which `pointerup` delivers) extends `MouseEvent` with `pointerType` — allows detecting touch/pen. Semantically equivalent for tracking purposes. |
| 2026-06-29 | `sendBeacon` not implemented directly | Cerbero has no server URL to beacon to — architecture is callback-based. Emitting `pageUnload` lets integrators call `sendBeacon` themselves in their callback. |
