---
name: review-podman-desktop
description: >-
  Review a podman-desktop PR, branch or working-tree diff the way maintainer benoitf does,
  using the recurring rules distilled from a year of their review comments. Use for
  "review this PR", "review PR #N", "review my diff/branch", "verdict on PR #N",
  "write the review comment for PR #N", "what would benoitf say".
argument-hint: '[PR number | branch | empty for working tree]'
allowed-tools: Bash(gh pr view:*) Bash(gh pr diff:*) Bash(gh pr checks:*) Bash(git diff:*) Bash(git rev-parse:*) Read Grep Glob
---

# Review podman-desktop

Target: `$ARGUMENTS` (a PR number, a branch, or empty for the working tree).

The rules and procedure are shared with the `pr-reviewer` / `pr-verdict` agents and with automated reviews, so they live in plain files. Read all of them first:

1. `references/procedure.md`: how to gather the diff, verdict table, calibration.
2. `references/rules.md`: the rules to apply.
3. The output format:
   - default: `references/output-interactive.md`
   - if the user asks for a "verdict" or a "comment to post": `references/output-comment.md`

Follow them exactly. This skill is read-only: never post a comment.
