# Cerbero — Claude Code Guide

## What this project is

Cerbero is a lightweight TypeScript library for tracking user interactions in the browser. It collects events (clicks, scrolls, text selections, mouse exits, time on page, performance metrics, Web Vitals) and offloads all processing to a **Web Worker** to keep the main thread free.

Distributed as UMD, ESM, and CJS bundles. Published on npm as `cerbero`.

## Project structure

```
src/
  index.ts               # Main class (Cerbero) — sets up listeners, communicates with worker
  worker/index.ts        # MasterWorker — runs inside the Web Worker, dispatches to services
  services/              # One service per event type (Click, Scroll, MouseExit, etc.)
  utils/
    formatter.ts         # DOM node serialization helpers
    selectionObserver.ts # Text selection detection
  constants/index.ts     # Event type string constants
```

Each service has a static `formatEvent()` method that receives a decoded event from the worker and returns a `FormattedMessageStructure` — the object that gets passed to the user's callback.

## Build

```bash
yarn build       # rollup -c rollup.config.js — outputs dist/ (UMD + ESM + CJS)
yarn dev         # watch mode + http-server on :3001 (serves docs/)
```

Output files declared in `package.json`:
- `dist/cerbero.js` → CJS (`main`)
- `dist/cerbero.esm.js` → ESM (`module`)
- `dist/cerbero.umd.js` → UMD (`browser`)

## Test

```bash
yarn test        # jest --coverage
```

Tests live next to their source files as `*.test.ts`. Coverage thresholds enforced (65% branches, 75% functions/lines/statements). Test environment is `jsdom`.

## Lint

```bash
yarn lint        # tslint — currently uses tslint (deprecated, migration to ESLint is planned)
```

## Known issues and technical debt

- `tslint` is fully deprecated — migration to ESLint + `@typescript-eslint` is in the roadmap.
- `window.performance.timing` used in `Performance` service is deprecated by the W3C. Replacement: `PerformanceNavigationTiming` via `PerformanceObserver`.
- `web-vitals` is at v2. In v3+ `getFID` was removed and replaced by `getINP` (Interaction to Next Paint). The `_initListener` in `index.ts` must be updated.
- `event.toElement` / `event.fromElement` in `MouseExit` are non-standard properties (Chrome-only). Should use `event.relatedTarget`.
- There is a typo in the public API: `addEventListner` (missing one `e`). Any rename is a breaking change and must bump the major version.
- The library exports a singleton (`export default new Cerbero()`). Multiple instances on the same page are not possible.
- There is no `destroy()` method — event listeners are never cleaned up.
- `timeInPage` fires even when the tab is in the background (Page Visibility API not used).
- No touch/pointer event support — the library is desktop-only.
- TypeScript target is `es5` and module is `es6`. Should be modernized (target `es2017+`).
- Rollup uses old plugin names (`rollup-plugin-node-resolve`, `rollup-plugin-commonjs`) replaced by `@rollup/plugin-*` scoped packages.

## Conventions

- Event type strings are centralized in `src/constants/index.ts` — never hardcode event names elsewhere.
- All DOM nodes passed to services are already serialized by `formatEvent()` in `src/utils/formatter.ts` before being sent to the worker via `TextEncoder`. Services receive plain objects, not live DOM nodes.
- Services are stateless (all methods are `static`). Keep them that way.
- Do not import anything from `web-vitals` outside `src/index.ts`.

## Roadmap

See `docs/revamp/ROADMAP.md` for the full modernization plan with status tracking.
