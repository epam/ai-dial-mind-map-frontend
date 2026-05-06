---
name: quality-gates
description: Run the standard npm lint, test, format, and build checks expected before sharing dial-mind-map-frontend changes.
origin: adapted-from-ecc
---

# Skill: quality-gates

## When to use

Before a PR, before handing off work, or when the user asks “is this ready?”.

## Commands (npm)

Run from the repository root:

1. **`npm run lint`** — ESLint flat config must pass (`eslint.config.mjs`).
2. **`npm run test`** — Jest with jsdom; watch `lodash-es` mapping if tests fail on imports.
3. **`npm run format:ci`** — Prettier check for `ts`, `tsx`, `md` when formatting could have drifted.
4. **`npm run build`** — Next.js production build for anything touching app routes, API handlers, or middleware.

Optional: **`npm run test:coverage`** when the user cares about coverage deltas.

## Interpretation

- Fix **errors** first; **warnings** (`no-explicit-any`, etc.) should not grow without reason.
- If CI parity matters, favor **`npm run test:ci`** for a non-watch run.

## Done when

All chosen commands succeed and any failures are explained with next steps—not ignored.
