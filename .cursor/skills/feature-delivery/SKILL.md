---
name: feature-delivery
description: End-to-end feature work across Next.js UI, Redux store, tests, and verification commands for this repo.
origin: adapted-from-ecc
---

# Skill: feature-delivery

## When to use

The user asked for a user-visible feature or non-trivial behavior change spanning UI and/or state.

## Steps

1. **Clarify scope** in one short paragraph: routes, components, store slices/epics affected, and acceptance checks.
2. **Discover**: map existing similar features under `src/components`, `src/app`, and `src/store`; reuse components and epics patterns.
3. **Implement** incrementally: prefer small commits mentally (even if the user squashes)—UI shell → state → edge cases.
4. **Tests**: add or extend Jest / Testing Library coverage next to the code (`__tests__` or `*.test.ts(x)`).
5. **Verify**:
   - `npm run lint`
   - `npm run test` (or focused Jest paths if the user runs that way)
   - `npm run build` when routing, middleware, or server code changes

## Out of scope without explicit ask

Large refactors, dependency upgrades, or unrelated formatting.

## Done when

Feature works locally per acceptance, tests and lint pass, and the diff stays focused on the requested outcome.
