---
name: mindmap-release-notes
description: Use when the user asks to enhance, refine, polish, or "look at" the release notes for a tag — a fresh CI-generated pre-release (e.g. `0.13.0-rc.0`) or a stable cut. Reads the auto-generated notes off the GitHub release, tidies inconsistent phrasing and issue references, folds duplicate/hotfix entries, reclassifies misfiled security bumps, builds a `Deployment Changes` section from `README.md`'s Environment Variables table, and saves a draft to `claude/release-notes/`. Never edits GitHub directly.
allowed-tools: Read Grep Glob LSP Bash(gh release view:*) Bash(gh release list:*) Bash(gh pr view:*) Bash(gh pr list:*) Bash(gh pr diff:*) Bash(git log:*) Bash(git show:*) Bash(git diff:*) Bash(git tag:*) Bash(git rev-parse:*) Bash(date:*) Write(claude/release-notes/*) Bash(mkdir -p claude/release-notes)
argument-hint: "[tag]"
arguments: tag
model: opus
effort: xhigh
context: fork
agent: general-purpose
---

# Mind Map Studio release-notes enhancer

This repo's release pipeline (`epam/ai-dial-ci`'s reusable `node_release.yml` workflow) already buckets PRs into `## Features` / `## Fixes` / `## Other` by conventional-commit type and strips the `feat:`/`fix:`/`chore:` prefix before publishing — so raw notes here start cleaner than a typical hand-rolled changelog. What's left is a smaller, sharper editorial pass:

- Inconsistent issue references baked into PR titles by the author (`(Issue#45)` with no space, vs `(Issue #45)`).
- Duplicate or follow-up PRs patching the same issue, each landing as its own bullet.
- Hotfix commits with no PR (rare, but `git log` catches what the release body misses).
- Security-relevant dependency bumps (`bump next`, `bump axios`) sitting anonymously in `## Other` next to routine bot churn (`bump the ai-dial-ci group with 4 updates`), with no signal to a reader about which ones matter.
- Terse-to-the-point-of-vague bullets (`enhance PDF URL resolution with getReferenceUrl utility` — enhance it *how*, for *whom*?) that a quick look at the diff can sharpen without inventing anything.
- No `Deployment Changes` section at all today, even when a release adds/removes/renames an environment variable documented in `README.md`.

This skill does that pass. It does **not** re-invent the categorization CI already gets right — don't move things between `Features`/`Fixes`/`Other` unless the raw placement is actually wrong (e.g. a security-relevant `chore: bump` sitting in `Other`).

You are running in a forked, isolated context. Read and research freely — only the final summary you return reaches the main conversation. All file writes happen in this fork; the draft lands at `claude/release-notes/<tag>-draft.md`.

## When to use

- "Enhance the release notes for `0.13.0-rc.0`"
- "Look at the latest pre-release notes and clean them up"
- "Help me polish the notes for the current rc"
- "The CI just published `<tag>`, tidy it up"

Do **not** trigger on "what changed in 0.13.0?" — that's a recall question, not a notes-editing task.

## Inputs

`tag` = `$tag` — the GitHub release tag to enhance (e.g. `0.13.0-rc.0`, `0.13.0`). If empty, pick the most recent from `gh release list --limit 5` and confirm with the user before editing.

## Workflow

### 1. Resolve target and reference styles

1. `gh release view <tag> --json body,name,tagName` — capture the raw CI notes.
2. `gh release list --limit 10` — locate the previous tag of the same kind (last stable for a stable release, the predecessor `rc` for a delta `rc.N+1`).
3. `gh release view <prev-tag> --json body` — the style anchor. Match its terseness; this project's notes run shorter than a typical enterprise changelog — don't pad bullets with clauses the raw title didn't earn.
4. `git tag --list | sort -V` + `git log <prev-tag>..<tag> --oneline` — full commit list for the range, to catch hotfix commits without a PR.

### 2. Pull source context for each bullet

For every bullet in the raw notes:

1. Parse the trailing `(#<PR>)`. If the bullet also carries an inline `(Issue#<N>)` or `(Issue #<N>)` from the PR title, normalize to `(Issue #<N>)` — always a space after `Issue`.
2. `gh pr view <PR> --json title,body,files` — check the body, but expect it to often be an unfilled template in this repo (the PR template's "Description of changes" section is frequently left blank). When it's empty, don't fabricate rationale — lean on `gh pr diff <PR>` or the title itself instead of inventing a "why".
3. For bullets with no PR number, `git log <prev-tag>..<tag> --oneline | grep -i <keywords>` and `git show <hash>` to find the underlying commit.

### 3. Cross-check `README.md` for deployment changes

The `Deployment Changes` section is built from the source of truth, not PR titles:

- `git diff <prev-tag>..<tag> -- README.md` — look for changes inside the "Environment Variables" table (currently around README.md's `## Environment Variables` heading) for added, removed, or reworded rows.
- The table in this repo is **3 columns**: `Variable | Required | Description` — there's no separate "Available Values" / "Default values" columns like some sibling DIAL repos; those details live inline in the Description cell. Keep that shape when building the section, don't invent extra columns.
- For any variable that lands in the section, verify it's actually read by `Grep`-ing `process.env.VAR_NAME` in `src/` — the README has drifted from the code before (e.g. mismatched variable names). Code wins if they disagree; flag the discrepancy in the editorial notes (§7) rather than silently picking one.
- There is no feature-flag enum / `ENABLED_FEATURES`-style mechanism in this repo (checked `src/types/common.ts` and equivalents) — don't add a "New/Removed feature flags" subsection; it doesn't apply here.

### 4. Fold duplicates and hotfixes, flag security bumps — don't re-bucket everything else

Unlike a from-scratch classification pass, most of the CI's `Features`/`Fixes`/`Other` placement is already correct. Only touch it for these specific situations:

| Situation | Action |
|---|---|
| Two or more bullets reference the same `Issue #<N>` | Fold into one bullet, cite both PRs: `(Issue #<N>) (#<PR1>, #<PR2>)`. |
| A hotfix commit in `git log` with no PR, clearly patching a bullet already in the notes | Fold into that bullet, cite the short hash in parens. |
| A `Revert "..."` commit whose original is in the same range | Drop both — net zero in the range. |
| A `Revert "..."` commit whose original shipped in an earlier release | Keep, rephrase as a rollback: `Roll back <what> shipped in <prev-version> — restores prior <behavior>`. |
| A dependency bump in `## Other` that addresses a CVE or is otherwise security-relevant (`next`, `axios`, auth libraries, anything flagged by Dependabot/CI as a security PR) | Keep in `Other` but rewrite with the CVE or security rationale named explicitly, so it doesn't read identically to routine `bump the ai-dial-ci group with 4 updates` churn. |
| Everything else already in `Other` (routine dependency bumps, `bump the ai-dial-ci group with 4 updates`, CI workflow tweaks) | Leave as-is — this project's convention is to keep the full bump list, not thin it out. Don't drop these unless the user has explicitly asked for a leaner `Other` section in this run. |

If you're unsure whether something is security-relevant, `gh pr view <PR> --json title,body` and check whether the title mentions a version jump across a security advisory boundary — when in doubt, leave it alone rather than guessing.

### 5. Rewrite bullets that need it

Most bullets in this repo's raw notes are already prefix-free prose (CI strips `feat:`/`fix:`/`chore:` before publishing) — don't rewrite a bullet that's already clear. Where you do touch one:

1. **One line per bullet.** Match the source releases' terseness.
2. **Normalize issue refs** to `(Issue #<N>)` (space after `Issue`).
3. **Backticks for code identifiers**: env vars (`THEMES_CONFIG_HOST`), prop names, component names (`PdfContent`), file paths.
4. **Use `—`** for a "why"/"what it replaces" clause only when one is actually knowable from the diff or PR — don't manufacture a rationale the source material doesn't support.
5. **Quote CVE IDs verbatim** when known: `Upgrade next to 15.5.18 to address CVE-2025-XXXXX`. If no CVE is referenced anywhere (README, PR, changelog of the bumped package), don't invent one — just name what changed and why it's worth calling out (e.g. "security patch release").
6. **Preserve `(#<PR>)` / `(Issue #<N>) (#<PR>)`** at the end exactly as GitHub auto-links them.

#### Example transformations

```
# Normalizing an issue ref baked into the PR title:
- * customizable chat labels via theme chat.labels (Issue#45) (#55)
+ * Customizable chat labels via theme `chat.labels` (Issue #45) (#55)

# Sharpening a vague bullet using the PR diff, no invented rationale:
- * enhance PDF URL resolution with getReferenceUrl utility
+ * Resolve PDF URLs through a new `getReferenceUrl` utility, fixing broken links to reference documents

# Naming the security angle on a bump already correctly in Other:
- * bump next from 15.5.15 to 15.5.18 (#67)
+ * Upgrade `next` to `15.5.18` (security patch release) (#67)

# Folding two PRs on the same issue:
- * fix publication scrolling (Issue #70) (#71)
- * fix publication scrolling follow-up (Issue #70) (#72)
+ * Fix scrolling inside the publication panel when the list overflows the viewport (Issue #70) (#71, #72)

# Leaving routine churn untouched:
  * bump the ai-dial-ci group with 4 updates (#84)   ← no change
```

### 6. Build the `Deployment Changes` section

Add this section **only** when `git diff <prev-tag>..<tag> -- README.md` shows an actual change inside the Environment Variables table, or the range introduces a behavioral shift an operator needs to know about on upgrade (default value change, a previously-optional variable becoming required, etc.). Otherwise omit the whole section — most rc-to-rc and even many stable ranges in this repo won't have one.

```markdown
## Deployment Changes

### New environment variables
| Variable | Required | Description |
| --- | --- | --- |
| `VAR_NAME` | **Yes**/**No** | ... |

### Removed environment variables
| Variable | Reason |
| --- | --- |

### Behavioral changes
> [!NOTE]
> <one-line explaining the runtime shift — operator does nothing, it's automatic on upgrade>
- **<what changed>** (#<PR>)
```

Pull the `Description` cell verbatim from the new README row (or lightly tighten it, keeping the meaning). If a variable's presence/absence in the README disagrees with `process.env.VAR_NAME` usage in `src/`, use the code as the source of truth and note the discrepancy in the editorial-notes file — don't silently fix the README as a side effect of writing release notes.

### 7. Pre-release / delta handling

If the target is `<X.Y.Z>-rc.N` with `N ≥ 1`:

- Cover only what changed since the previous rc — don't consolidate the predecessor's notes into this one. Consolidation happens at the stable cut.
- Drop `Deployment Changes` if this specific rc's delta has none, even if an earlier rc in the same train did.
- Don't add a "Delta since <prev-rc>" header — the `-rc.N` suffix already signals that, and none of the shipped releases in this repo's history use one.

### 8. Save the draft (and optional editorial companion)

Create `claude/release-notes/` if missing, then write:

- **`claude/release-notes/<tag>-draft.md`** — the final notes, ready to paste into the GitHub release body. No preamble, no commentary — just the headings and bullets, in the order `Features` → `Fixes` → `Other` → `Deployment Changes` (only sections with content).
- **`claude/release-notes/<tag>-editorial-notes.md`** *(optional)* — only when there's something non-obvious worth surfacing:
  - Issue-ref folds and hotfix folds performed, with the commits/PRs involved.
  - Any README-vs-code discrepancy found for an env var.
  - Bumps flagged as security-relevant but where no CVE could be confirmed — ask the user whether to keep the "(security patch release)" framing or revert to a plain bump description.

### 9. Verify nothing was pushed to GitHub

This skill **never** runs `gh release edit`, `gh release create`, or any write operation against the repo. Draft files are the only output. If the user later asks you to apply the draft, that's a separate, explicit request.

## Return to the main conversation

Return a short summary — five lines or fewer:

- The draft path (`claude/release-notes/<tag>-draft.md`).
- Counts of bullets per section.
- Folds performed (duplicate issues, hotfixes, reverts) — count and example.
- Security bumps called out explicitly, if any.
- Whether a `Deployment Changes` section was added, and why (which README rows changed).
- Any open questions (README/code env-var name mismatch, unconfirmed CVE, ambiguous security-relevance call).

## Safety rails

- **Never edit GitHub.** No `gh release edit`, no `gh release create`. Drafts only.
- **Never invent items or rationale.** Every kept bullet maps to a PR or commit hash in the range; every "why" clause traces to something readable in the diff, PR body, or title — don't manufacture motivation the source doesn't support (PR bodies in this repo are frequently just the unfilled template).
- **Never silently rename or drop a PR/issue reference.** Bullets end with `(Issue #<N>) (#<PR>)` so links resolve on the release page.
- **Don't re-bucket what CI already got right.** Only move a bullet between sections for the specific cases in §4 — this repo's pipeline strips prefixes and classifies correctly far more often than not.
- **Don't thin out `## Other`** unless explicitly asked — the shipped convention here is to keep the full dependency-bump list.
- **Don't consolidate pre-release notes** into the stable's notes unless the user explicitly asks.

## Maintenance

If the CI pipeline changes (a new `epam/ai-dial-ci` workflow version with different section behavior, a new conventional-commit scope that misroutes items, a recurring rewrite the user keeps asking for), surface it in your return summary and offer to update this `SKILL.md`. The user confirms before any edit lands.
