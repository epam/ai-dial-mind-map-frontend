---
name: code-review
description: Structured CRITICAL→NIT review for diffs or paths; review-only until the user requests code changes.
origin: adapted-from-ecc
---

# Skill: code-review

## When to use

The user wants feedback on a branch, diff, or set of files **without** automatic edits.

## Rules

- **Do not** apply patches or refactors unless the user explicitly asks to fix issues.
- Prefer reading the supplied diff or paths from disk over guessing.

## Output

1. Short **summary** of intent and risk.
2. Findings grouped as:
   - **CRITICAL** — correctness, security, data loss, broken auth, server/client leaks.
   - **MAJOR** — maintainability, missing tests for risky logic, observable UX bugs.
   - **MINOR** — clarity, naming, small duplication.
   - **NIT** — style preferences, optional polish.
3. Each item: **file** (and symbol or line hint), **issue**, **why it matters**, **suggestion**.

## Alignment with Cursor rules

Mirror the expectations in **`.cursor/rules/code-review-agent.mdc`** (attach or read that file when using Cursor).

## Codex note

Invoke as **`$code-review`** with diff or paths. If `.mdc` rules are not loaded, paste or `@` include **`code-review-agent.mdc`** content at session start.
