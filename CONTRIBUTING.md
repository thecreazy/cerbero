# Contributing to Cerbero

Thanks for taking the time to contribute. This document covers how to set up a local environment, run tests, and submit a pull request.

## Table of Contents

1. [Local setup](#local-setup)
2. [Project structure](#project-structure)
3. [Development workflow](#development-workflow)
4. [Tests](#tests)
5. [Build](#build)
6. [Linting](#linting)
7. [Submitting a pull request](#submitting-a-pull-request)
8. [Commit messages](#commit-messages)
9. [Releasing](#releasing)

---

## Local setup

**Requirements:** Node 20+, yarn 1.x.

```bash
git clone https://github.com/thecreazy/cerbero.git
cd cerbero
yarn install
```

---

## Project structure

```
src/
  index.ts               # Main class (Cerbero) — sets up listeners, communicates with worker
  worker/index.ts        # MasterWorker — runs inside the Web Worker, dispatches to services
  services/              # One service per event type (Click, Scroll, MouseExit, …)
  plugins/               # Opt-in plugins: fingerprint, extended-env, behavioral, webrtc
  utils/
    formatter.ts         # DOM node serialization helpers
    selectionObserver.ts # Text selection detection
  constants/index.ts     # Event type string constants
docs/
  index.html             # Live demo (GitHub Pages)
  cerbero.umd.js         # Built by rollup, committed for the demo
```

**Architecture notes:**
- The main thread extracts only scalar primitives from DOM events and posts them to the worker (`toFormat: false`). No DOM traversal happens on the main thread in the hot path.
- Worker services receive these primitives and reconstruct the formatted event shape.
- Services are stateless — all methods are `static`.
- Event type strings are centralized in `src/constants/index.ts`. Never hardcode event names elsewhere.

---

## Development workflow

```bash
# Start rollup in watch mode + http-server on :3001 (serves docs/)
yarn dev
```

Open http://localhost:3001 to use the live demo while you edit source files.

---

## Tests

```bash
yarn test              # run all tests with coverage
yarn test --watch      # watch mode
```

Tests live next to their source files as `*.test.ts`. Coverage thresholds are enforced (90% branches, 99% functions/lines/statements). **Do not use `/* istanbul ignore */` comments** to work around missing coverage — write a real test for every branch.

When adding a new event type or service:

1. Create `src/services/MyEvent/index.ts` with a static `formatEvent()` method.
2. Create `src/services/MyEvent/__test__/index.ts` (fixture input) and `output.ts` (expected shape).
3. Create `src/services/MyEvent/index.test.ts`.
4. Register the new service in `src/worker/index.ts`.
5. Add the event type string to `src/constants/index.ts` and the type definition in `src/constants/index.d.ts`.

---

## Build

```bash
yarn build
```

Outputs four formats to `dist/` and also copies the UMD build to `docs/cerbero.umd.js` (for the live demo):

| File | Format | Use case |
|------|--------|----------|
| `dist/cerbero.js` | CJS | Node / legacy bundlers |
| `dist/cerbero.esm.js` | ESM | Modern bundlers (tree-shaking) |
| `dist/cerbero.esm-bundler.js` | ESM (unminified) | Downstream bundlers that want to tree-shake further |
| `dist/cerbero.umd.js` | UMD | `<script>` tag / CDN |

The Web Worker is inlined as a Blob URL by a custom rollup plugin — no separate worker file is emitted.

---

## Linting

```bash
yarn lint
```

Uses ESLint 8 + `@typescript-eslint`. The config is in `.eslintrc.js`.

---

## Submitting a pull request

1. Fork the repository and create your branch from `master`.
2. Make your changes, write tests, and ensure `yarn test` and `yarn build` both pass.
3. Open a pull request with a clear description of **what** changed and **why**.
4. Link any relevant issue in the PR description.

---

## Commit messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Use `yarn commit` to launch the interactive prompt:

```bash
yarn commit
```

Accepted types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`.

Breaking changes must be noted with `BREAKING CHANGE:` in the commit footer or `!` after the type (e.g. `feat!: remove singleton export`).

---

## Releasing

1. Bump the version and generate a changelog:
   ```bash
   yarn release        # patch bump
   yarn release --minor
   yarn release --major
   ```
2. Push the tag created by `standard-version`:
   ```bash
   git push --follow-tags origin master
   ```
3. Publish to npm:
   ```bash
   npm publish
   ```
   The `prepublish` script runs `yarn build` automatically.
4. Update `docs/cerbero.umd.js` if you haven't already (it is built as part of `yarn build`), then commit it so the GitHub Pages demo stays in sync.
