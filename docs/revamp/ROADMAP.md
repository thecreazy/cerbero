# Cerbero Modernization Roadmap

> Started: 2026-06-29 | Status: Phase 1 Complete
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
| 2.1 | Replace `window.performance.timing` with `PerformanceNavigationTiming` via `PerformanceObserver` | ⬜ | `performance.timing` is deprecated. Affects `src/services/Performance/index.ts` and `src/index.ts` |
| 2.2 | Update `web-vitals` from v2 to v5 | ⬜ | **Breaking**: `getFID` removed, replaced by `getINP`. Update `src/index.ts` imports |
| 2.3 | Fix `mouseExit` using non-standard `toElement`/`fromElement` | ⬜ | Replace with `event.relatedTarget` (standard). Affects `src/index.ts` `_receiveMouseOutEvent` |
| 2.4 | Add `destroy()` public method | ⬜ | Remove all event listeners, clear intervals, terminate the worker. Currently there is no cleanup path |
| 2.5 | Fix `timeInPage` counting time while tab is backgrounded | ⬜ | Use `Page Visibility API` (`visibilitychange`) to pause/resume the interval |
| 2.6 | Fix typo `addEventListner` → `addEventListener` | ⬜ | **Breaking change** — must be a major version bump. Keep old name as deprecated alias for one cycle |

---

## Phase 3 — New browser API features

> Goal: leverage modern browser APIs that didn't exist or weren't stable when the project was first built.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | Add `PointerEvents` support | ⬜ | Makes tracking work on mobile (touch) and pen input, not just mouse. Replaces pure `click`/`mouseout` listeners |
| 3.2 | Add `IntersectionObserver` — element visibility tracking | ⬜ | New event type: `elementVisible`. Track which elements the user actually saw and for how long |
| 3.3 | Add `Navigation API` support for SPAs | ⬜ | New event type: `navigation`. Fires on client-side route changes without a page reload |
| 3.4 | Add `navigator.sendBeacon` for page-unload data flush | ⬜ | Currently any in-flight data is lost when the user closes the tab |
| 3.5 | Add `IdleDetector` API | ⬜ | New event type: `userIdle` / `userActive`. Detect when user goes idle and resumes |
| 3.6 | Add rage click detection | ⬜ | Detect 3+ rapid clicks on the same element — high-value UX signal. Built on top of existing click tracking |
| 3.7 | Add keyboard interaction tracking | ⬜ | New event type: `keyboardInteraction` — track keyboard shortcut usage (modifier keys + key, not raw keystrokes for privacy) |

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
