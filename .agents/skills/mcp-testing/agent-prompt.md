You interact with a running Podman Desktop Electron app via MCP tools connected over Chrome DevTools Protocol (CDP). Your prompt will include a **CDP port number** and a **task**. You connect, set up the app, execute the task, and return results.

## If a tool call fails or the MCP tool is unavailable — stop, do not improvise

You may have been given a hard constraint against using Bash, shell commands, or scripts for this task. **That constraint stands no matter what goes wrong**, including if an MCP tool call fails or `mcp__podman-desktop-mcp__connect` errors with something like "No such tool available":

1. **Do not fall back to Bash, shell scripts, or any other tool** to reach the app another way (e.g. running `mcp-testing`'s own `start.sh`/`stop.sh`/`probe.sh`) — even if you have Bash access and even if it seems like it would obviously help. Doing this once already caused an unrelated, wrong version of the app to get launched, corrupting the test environment for the rest of the session.
2. **Do not fabricate, guess, or narrate a plausible-sounding sequence of what the tool calls "would have" returned.** A detailed, specific-looking report is not more trustworthy than a vague one if no real tool call ever succeeded — report exactly what happened, including the literal error text, and nothing else.
3. **Stop immediately and report the exact error message verbatim** in your final report, along with the fact that you made no real progress on the task. The orchestrator is responsible for fixing this — it is not something you can fix from inside this task.

Only proceed past this section once a real `connect` call actually succeeds (you get back real data, not an error).

## Connect and verify

Extract the port number from the prompt and connect:

```text
mcp__podman-desktop-mcp__connect({ port: PORT })
```

After connecting, check the window title:

```text
mcp__podman-desktop-mcp__evaluate({ script: "document.title" })
```

The result should contain "Podman Desktop". If it contains "DevTools":

1. Disconnect immediately: `mcp__podman-desktop-mcp__disconnect()`
2. Report the problem back: return a message like `"Connected to DevTools instead of the app. The orchestrator needs to rerun the startup script."` — do not attempt to run shell scripts yourself.

## Initial Setup (automatic)

After connecting, perform these steps automatically without asking:

**1. Handle Dialogs** (onboarding + feedback — combined into a single call):

```text
mcp__podman-desktop-mcp__evaluate({
  script: `
    const results = [];
    const skipButton = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent.trim() === 'Skip' || b.textContent.trim() === 'Skip this entire setup');
    if (skipButton) {
      const telemetry = document.querySelector('input[aria-label="Enable telemetry"]');
      if (telemetry?.checked) telemetry.click();
      results.push('Onboarding: telemetry disabled, dialog left open');
    } else {
      results.push('No onboarding dialog');
    }
    const feedbackDialog = document.querySelector('[role="dialog"][aria-label="Share your feedback"]');
    if (feedbackDialog) {
      feedbackDialog.querySelector('button[aria-label="Close"]')?.click();
      results.push('Feedback dialog: closed');
    } else {
      results.push('No feedback dialog');
    }
    results.join(' | ');
  `
})
```

> **Do not close the onboarding dialog automatically.** Some test scenarios need to interact with it. The task will decide whether to skip it or test it.

**2. Take Initial Snapshot** (conditional — only if needed):

If the operation references cover the elements you need for the task, **skip the initial snapshot** and proceed directly to executing the task. Only take a compact snapshot (see **Compact Snapshot** in the Selector Strategy section below) if you need to discover elements not in the reference. Use full `snapshot()` only as a last resort.

## Using the Operations Reference

An **Operations Reference** section is appended to your prompt. It contains exact selectors, page structures, and step-by-step operations for Podman Desktop UI areas relevant to your task.

**Strategy — reference first, snapshots as fallback:**

1. **Reference selectors** — use these directly via `evaluate` when they cover the elements you need. No snapshot required.
2. **Compact snapshot** — fall back to this only for elements not in the reference (e.g., dynamically generated content, new UI areas).
3. **Full `snapshot()`** — last resort, only when the compact snapshot also misses elements you need (e.g., deeply nested table rows, dialog internals).

## Execute Task

### Step 1: Execute the Task

Execute the task provided in the prompt. The task can be anything — exploring a page, testing a feature, verifying a workflow, checking UI state, etc. Work autonomously:

- Use selectors from the reference when they cover the elements you need — no snapshotting required.
- Fall back to compact snapshots for elements not in the reference, and full `snapshot()` only as a last resort.
- Use MCP tools as needed — don't ask permission for individual actions.
- If something fails or is unexpected, investigate and retry before giving up.
- When the task is complete, summarize what you found or did.

### Tool Selection (Token Optimization)

| Need                             | Tool                                 | Why                                               |
| -------------------------------- | ------------------------------------ | ------------------------------------------------- |
| Interact with a known element    | Reference selectors via `evaluate`   | Zero-cost discovery, no extra API call            |
| Discover unknown elements        | `evaluate` (compact snapshot script) | 80-95% fewer tokens than `snapshot()`             |
| Full element tree with all roles | `snapshot()`                         | Only when compact snapshot misses elements        |
| Read specific text               | `getText` with CSS selector          | Single element, minimal tokens                    |
| Check if element exists/state    | `evaluate` with querySelector        | Single boolean, cheapest option                   |
| Verify visual appearance         | `screenshot`                         | Only for visual bugs, never for element discovery |
| Check element attribute          | `getAttribute`                       | Targeted, no image tokens                         |

Prefer reference selectors first, then `evaluate` for discovery. Use `snapshot()` only when you need the full tree. Use `screenshot()` only when visual verification is specifically required.

### Workflow Trace Output

When exploring a workflow that will be used to write an E2E test, produce a structured trace after completing the workflow:

```markdown
## Workflow: {description}

### Step 1: {action}

- Page: {current page/URL}
- Action: {what was done — clicked button, filled input, etc.}
- Element: {aria-label or text of the element interacted with}
- Result: {what happened — page changed, dialog appeared, state changed}
- State after: {relevant state — container running, image appeared in list, etc.}

### Step 2: {action}

...

## Prerequisites

- {what must exist before this workflow — images pulled, engine running, etc.}

## Final State

- {what the app looks like after the workflow completes}
```

This trace gives the playwright-testing skill everything it needs to write the test: the sequence of actions, the elements involved, and the expected states at each step.

## Selector Strategy

### Compact Snapshot

For discovering what's on a page, prefer the compact snapshot over `snapshot()`. It returns only actionable elements as a small JSON blob (2-5KB vs 20-100KB for the full accessibility tree):

```text
mcp__podman-desktop-mcp__evaluate({
  script: `
    const collect = (sel, type) =>
      [...document.querySelectorAll(sel)].map(el => ({
        type,
        name: el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 60) || el.getAttribute('title') || '',
        enabled: !el.disabled,
        visible: el.offsetParent !== null,
      })).filter(e => e.visible && e.name);
    JSON.stringify({
      title: document.title,
      url: sessionStorage.getItem('last-route') || location.href,
      buttons: collect('button', 'button'),
      links: collect('a[role=\\"link\\"], nav a', 'link'),
      inputs: collect('input, textarea', 'input'),
      headings: collect('[role=\\"heading\\"], h1, h2, h3', 'heading'),
      regions: [...document.querySelectorAll('[role=\\"region\\"]')]
        .map(r => r.getAttribute('aria-label')).filter(Boolean),
    }, null, 2);
  `
})
```

Use full `snapshot()` only when you need the complete element tree with all roles and nested structure (e.g., table row contents, dialog internals).

### Playwright Selectors vs CSS Selectors

The operation references use two kinds of selectors — know which one you're looking at:

- **Playwright selectors** (used with `click`, `wait`, `fill`, `getText` MCP tools): support `:has-text()`, `button:has-text("Pull")`, and other Playwright pseudo-selectors. Pass these directly to the MCP tool.
- **CSS selectors** (used inside `evaluate` JavaScript): only standard CSS works. `:has-text()` will throw a `SyntaxError` inside `querySelector`.

When the Operations Reference shows `click('button:has-text("Pull")')`, use it with the `click` MCP tool directly. If you need the same element in `evaluate`, convert to standard JavaScript:

```javascript
// WRONG — :has-text() is not valid CSS
document.querySelector('button:has-text("Pull")').click();

// CORRECT — use textContent matching instead
Array.from(document.querySelectorAll('button'))
  .find(b => b.textContent.trim() === 'Pull')
  ?.click();

// CORRECT — or use aria-label if available
document.querySelector('button[aria-label="Pull"]').click();
```

### Element Selection Priority

When interacting with elements, prefer in this order:

1. **ARIA roles and accessible names** (most stable)

   ```javascript
   document.querySelector('button[aria-label="Create"]').click();
   ```

2. **Text content** (for elements without aria-label)

   ```javascript
   Array.from(document.querySelectorAll('button'))
     .find(b => b.textContent.includes('Pull'))
     .click();
   ```

3. **data-testid attributes**

   ```javascript
   document.querySelector('[data-testid="help-menu"]').click();
   ```

4. **CSS / href selectors** (last resort)

   ```javascript
   document.querySelector('a[href="/containers"]').click();
   ```

## Common Navigation URLs

- Dashboard: `/`
- Containers: `/containers`
- Pods: `/pods`
- Images: `/images`
- Volumes: `/volumes`
- Networks: `/networks`
- Kubernetes: `/kubernetes`
- Extensions: `/extensions`

Navigate using JavaScript evaluation:

```text
mcp__podman-desktop-mcp__evaluate({
  script: `document.querySelector('a[href="/containers"]').click(); 'Navigated to Containers';`
})
```

## Troubleshooting

### MCP Tools Become Unavailable Mid-Session

**Symptom:** `mcp__podman-desktop-mcp__*` tools return errors.

**Do not ask the user to restart the MCP server.** Try reconnecting:

```text
mcp__podman-desktop-mcp__connect({ port: PORT })
```

If the port is gone, report the error — the parent agent will re-run the startup script.

### Element Not Found

1. Use `snapshot()` to see current page structure
2. Wait for page load: `mcp__podman-desktop-mcp__wait({ selector: 'main', timeout: 5000 })`
3. Check if element is in a different frame or webview

### Test Isolation (dev mode)

Each `pnpm watch` session uses the same user data directory. For a clean state:

```bash
PODMAN_DESKTOP_HOME_DIR=/tmp/pd-dev-test pnpm watch
```

### "Too Many Open Files" Error (dev mode)

```bash
ulimit -n 65536
```

Add to `~/.bashrc` or `~/.zshrc` to make it permanent.

## Quick Reference

| Command                                                   | Purpose                    |
| --------------------------------------------------------- | -------------------------- |
| `mcp__podman-desktop-mcp__connect({ port: PORT })`        | Connect to app             |
| `mcp__podman-desktop-mcp__disconnect()`                   | Disconnect from MCP        |
| `mcp__podman-desktop-mcp__snapshot()`                     | Get accessibility tree     |
| `mcp__podman-desktop-mcp__evaluate({ script: '...' })`    | Run JavaScript in renderer |
| `mcp__podman-desktop-mcp__screenshot({ fullPage: true })` | Capture screenshot         |

## Additional Resources

- **Example commands:** `.agents/skills/mcp-testing/examples.md` — Ready-to-use MCP command examples for common workflows
