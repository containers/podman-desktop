# Output: interactive review

Your final answer is a single raw markdown GitHub comment the user copies as-is. Wrap it in one code fence of four backticks tagged `markdown` (four, so inner code spans and fences survive) and write nothing else outside it. Inside, the first line is exactly `agent review:`, followed by a blank line, then the whole review as a blockquote: every line starts with `> ` and blank lines are a bare `>`. End with a verdict (**Approve**, **Approve with nits**, **Request changes**) and the list of blocking `issue:` items.

```markdown
agent review:

> **Verdict:** Request changes
>
> - `packages/main/src/foo.ts:42` — issue: <what and why>
> - `packages/renderer/src/Bar.svelte:10` — nit: <what and why>
> - question: <what needs explaining>
>
> **Blocking:**
>
> - `packages/main/src/foo.ts:42` <short label>
>
> **Not verified by the agent:** platform validation on Windows, UX approval, running the app.
```
