# Output: verdict comment

Return, in this order:

1. One chat line with the verdict and the counts.
2. The full comment in a single fenced ` ```markdown ` block, following the template below exactly.
3. The same markdown written to `pr-<N>-review.md` in the scratchpad directory (or `review-<sha>.md` for a branch), and the command to post it: `gh pr comment N --body-file <path>`. In an automated run the workflow, not the prompt, does the posting.

## Template

```markdown
## Review: ❌ Rejected — 3 blockers

Reviewed commit `abc1234` · Blockers 3 · Nits 2 · Questions 1 · Files reviewed 4/4

### Blockers (must fix before approval)

- `packages/main/src/foo.ts:42` — issue: <what is wrong and why, imperative, one or two sentences, naming the rule in plain words>

### Nits (optional)

- `packages/renderer/src/Bar.svelte:10` — nit: <...>

### Questions

- `packages/api/src/baz.ts:7` — question: <...>

### Scope check

Title/body vs diff: <one line: "matches" or the list of unrelated changes to move to another PR>

### Not verified (needs a human)

- <platform validation / UX approval / ran the app end-to-end>

<sub>Automated review based on the recurring rules from benoitf's PR reviews (`.agents/skills/review-podman-desktop/references/rules.md`). Rule references are indicative; reply on any item you disagree with.</sub>
```

Rules for the comment:

- The header line is `## Review: <verdict> — <N blockers | N nits | nothing to report>`.
- Omit any section that would be empty. An accepted PR keeps the header, the counts line, the scope check and the footer.
- Every finding is one bullet: `path:line — prefix: text`. Group by prefix, order blockers by severity of impact. No paragraphs inside bullets.
- Mark an item already raised by another reviewer with `(already raised)` at the end of the bullet.
- Keep the footer verbatim so nobody mistakes the comment for a human review.
- Write in the imperative, address the author directly, no praise padding.
- An observation outside the rule set goes under `### Questions` with the note "(outside the rule set)".
