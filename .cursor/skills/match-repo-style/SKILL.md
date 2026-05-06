---
name: match-repo-style
description: Align new edits with neighboring files—imports, Redux epics, Next.js patterns, and Tailwind rules in dial-mind-map-frontend.
origin: adapted-from-ecc
---

# Skill: match-repo-style

## When to use

You are editing an unfamiliar area of `src/` or introducing a new file next to existing ones.

## Steps

1. List the target directory; open **one to three** neighboring `.ts` / `.tsx` files (and any colocated `__tests__` or `*.test.tsx`).
2. Copy **import order** (external → `@/` → relative), hook style, and component structure—not necessarily line-by-line, but the same conventions.
3. For Redux work, read an adjacent **`*.epics.ts`** and **`*.reducers.ts`** pair and mirror error handling, action naming, and selector layout.
4. For UI, note **Tailwind class order** and EPAM DIAL UI imports used nearby.
5. Run **`npm run lint`** on the touched paths before concluding.

## Done when

The change reads as if the same author wrote the surrounding module: no new stray patterns, no conflicting state style, no import-sort violations.
