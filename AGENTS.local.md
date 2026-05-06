---
title: Local AI harness (Cursor + Codex)
scope: repository-local-private
language: en
---

# Project instructions (local harness)

This file is the **single source of truth** for human-readable project guidance used by **OpenAI Codex** when `AGENTS.md` points here. **Cursor** loads detailed rules from **`.cursor/rules/*.mdc`**; Codex does **not** auto-load those files—keep this summary concise and attach or paste `.mdc` files for large tasks.

## Privacy and Git

This harness (`.cursor/`, `.agents/`, `AGENTS.local.md`, and symlinked `AGENTS.md`) is intended to stay **out of version control** for teammates. Entries are listed only in **`.git/info/exclude`** (not `.gitignore`).

**Important:** After a **fresh clone**, Git does not copy `.git/info/exclude`. **Re-append** the same patterns to `.git/info/exclude` on each new working copy, or the harness may be committed by mistake.

Suggested snippet for `.git/info/exclude`:

```gitignore
.cursor/
.agents/
AGENTS.local.md
AGENTS.md
```

## Precedence (conceptual)

| Layer | Cursor | Codex |
| --- | --- | --- |
| Editor / product defaults | Built-in | Client defaults |
| **This repo (local)** | `.cursor/rules/*.mdc` + optional `@` files | `AGENTS.md` → this file; `.agents/skills/**` |
| User global | User rules / settings | `~/.codex` merged docs (see Codex docs) |

Codex merges documentation from `~/.codex` downward; combined size is capped by default (**32 KiB**). Increase with `project_doc_max_bytes` in `~/.codex/config.toml` if needed.

## Project facts (dial-mind-map-frontend)

- **Stack:** Next.js **15** (App Router under `src/app`), React **19**, TypeScript **strict**, **npm** (`package-lock.json`).
- **State:** Redux Toolkit + **redux-observable** epics in `src/store/**`.
- **UI / styling:** Tailwind CSS, **`@epam/ai-dial-ui-kit`**, Testing Library + **Jest** (jsdom). ESLint **flat** config: `eslint.config.mjs` (`simple-import-sort`, Tailwind class order + shorthand).
- **Aliases:** `@/*` → `./src/*` (`tsconfig.json`).
- **CI:** PR workflow targets `development` / `release-*` and calls shared **`epam/ai-dial-ci`** `node_pr.yml`.

### Commands (verify changes)

- `npm run lint` / `npm run lint:fix`
- `npm run test` / `npm run test:ci` / `npm run test:coverage`
- `npm run format:ci` / `npm run format`
- `npm run build`

### Detailed rules on disk (for paste / attach)

- `.cursor/rules/project-style-baseline.mdc` — mirror neighbors, stack conventions (**always on** in Cursor).
- `.cursor/rules/coding-style-quality.mdc` — immutability, scope, errors, boundaries, checklist.
- `.cursor/rules/agent-orchestration.mdc` — planning and skills usage.
- `.cursor/rules/development-workflow.mdc` — branches and CI expectations.
- `.cursor/rules/typescript-eslint-testing.mdc` — TS / ESLint / Jest.
- `.cursor/rules/next-react-redux-architecture.mdc` — App Router, Redux, middleware caution.
- `.cursor/rules/ui-tailwind-accessibility.mdc` — Tailwind + UI kit + a11y.
- `.cursor/rules/code-review-agent.mdc` — **review-only**, CRITICAL→NIT (`alwaysApply: false`—attach when reviewing).

### Skills (single body, symlinked for Codex)

Canonical Markdown lives under **`.cursor/skills/<name>/SKILL.md`**. Codex sees the same files via **`.agents/skills/<name>`** symlinks—**do not duplicate** bodies.

## How to use (Cursor)

1. Keep this repo’s rules under **`.cursor/rules/*.mdc`** (already present in a local setup).
2. Optional: add more `.mdc` files with YAML frontmatter (`description`, `alwaysApply`, `globs`).
3. For **code review**: start a **new chat**, attach **`@.cursor/rules/code-review-agent.mdc`**, include **changed files or diff**.
4. For playbook-style work, reference **`.cursor/skills/<skill>/SKILL.md`** in chat or follow them manually.

## How to use (OpenAI Codex)

### One-time symlink setup (repo root)

```bash
ln -sf AGENTS.local.md AGENTS.md
mkdir -p .agents/skills
ln -sfn ../../.cursor/skills/match-repo-style .agents/skills/match-repo-style
ln -sfn ../../.cursor/skills/feature-delivery .agents/skills/feature-delivery
ln -sfn ../../.cursor/skills/quality-gates .agents/skills/quality-gates
ln -sfn ../../.cursor/skills/code-review .agents/skills/code-review
```

Add the **`.git/info/exclude`** block above so these paths stay private.

**Alternative (no `AGENTS.md` symlink):** set `project_doc_fallback_filenames = ["AGENTS.local.md"]` in `~/.codex/config.toml` per Codex documentation.

### Verify Codex loaded instructions

In a Codex session from the repository root, run:

```bash
codex "Summarize project instructions"
```

Confirm the answer references this file’s stack (Next.js 15, Redux epics, npm scripts) or your visible customizations.

### Code review in Codex

Start a **new session**, invoke **`$code-review`**, provide **diff or paths**. If the client cannot load `.mdc` rules, **paste** the text of **`.cursor/rules/code-review-agent.mdc`** or ask the agent to read that path from disk.
