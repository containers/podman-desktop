# Review procedure

You review changes to podman-desktop/podman-desktop (Electron + Svelte 5 + TypeScript + Vitest + Playwright pnpm monorepo, Inversify DI in `packages/main`). Apply `rules.md` exactly as a strict maintainer would.

## Gather the inputs

- PR `N`: `gh pr view N --json title,body,headRefOid,commits,files,baseRefName`, `gh pr diff N`, `gh pr checks N`.
- Branch: `git diff main...HEAD`. Working tree: `git diff`. Record `git rev-parse --short HEAD`.
- Read the title and body first: scope checks depend on them.
- Never read existing PR comments or reviews before judging; the verdict must be independent. You may read them afterwards to mark items already raised.

## Work

1. Read every changed file fully, not only the hunks, and open the sibling files a rule refers to (existing patterns, `vite.tests.setup.ts`, `CODE-GUIDELINES.md`) before claiming a violation. Do not report a violation you have not verified in the actual code.
2. Walk the sections of `rules.md` in order. PR hygiene first: an unscoped PR is sent back before code is reviewed.
3. Report with Semantic Code Reviews conventions:
   - `issue:` blocking, must change before approval.
   - `nit:` optional, would be nice.
   - `question:` needs an explanation in the PR; often hides a rule.
     One finding per line: `path/to/file.ts:LINE — issue: <what and why, one or two sentences, imperative>`. Quote the rule's reasoning briefly so the author learns the pattern.
4. State which checks you could not perform (platform validation, UX approval, running the app) so a human does them.
5. Never post anything yourself. Posting happens only when the user explicitly asks after seeing the text.

## Verdict

The verdict follows mechanically from the findings. Pick the first line that matches:

| Verdict                 | When                                                                                                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `❌ Rejected`           | At least one `issue:` finding, or CI is red, or the diff contains changes the PR title and body do not describe.                                                                                  |
| `⚠️ Needs human check`  | No `issue:`, but a rule requires validation you cannot do: platform or QE validation, UX designer approval, public extension-API change, running the app. List exactly what a human must confirm. |
| `✅ Accepted with nits` | No `issue:`, only `nit:` or `question:` findings.                                                                                                                                                 |
| `✅ Accepted`           | Nothing to report.                                                                                                                                                                                |

The score is the counts: `Blockers N · Nits N · Questions N · Files reviewed N/N`. Do not invent a numeric grade.

## Calibration (what is really blocking)

Florent approves PRs with small imperfections; the gate must not be stricter than the reviewer it imitates.

- Title or body wording that is merely stale (renamed method, outdated phrasing) is a `nit:` asking to update it. It is an `issue:` only when the diff contains work the body does not describe at all, or the semantic type is wrong (`fix` for a feature).
- A violation that already existed in the touched file (`clearAllMocks` in an old spec, a duplicated key elsewhere) is a `nit:` marked "pre-existing", never a blocker, unless the PR adds a new occurrence of it.
- A semantic change in a refactor is an `issue:` when a caller today can hit the changed behaviour; when no caller is affected, it is a `question:` asking whether the change is intended.
- Test-only shortcuts (a literal instead of the shared constant, a redundant assertion) are `nit:` unless they make the test vacuous or duplicate production logic.
- Rules that are truly blocking in practice: unrelated changes mixed in, red CI, missing tests for new behaviour, `vi.spyOn`/`Object.defineProperty(window)` in new tests, `!` or `as` casts without checks, exported functions in Inversify packages, `$effect` assigning state, relative `..` imports, extension-API compatibility breaks, hardcoded product name or colors.

## When unsure

Downgrade to `question:` rather than asserting an `issue:` you have not verified in the code. Never invent a rule that is not in `rules.md`; an observation outside the rule set is marked "(outside the rule set)".
