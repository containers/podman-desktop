---
name: mcp-testing
description: >-
  Interactive testing of Podman Desktop UI using the electron-test MCP server.
  Supports both production (installed app) and development (pnpm watch) modes.
  Use for manually testing UI workflows, debugging UI issues, exploring features,
  or quick acceptance testing.
---

# Podman Desktop MCP Testing

Interactively test and explore Podman Desktop through automated browser commands, connected via Chrome DevTools Protocol (CDP).

## When to use this skill

- Manually testing Podman Desktop UI changes during development
- Testing the production (installed) Podman Desktop app
- Debugging specific user workflows or UI issues
- Exploring new features interactively
- Verifying functionality without writing test code
- Quick acceptance testing

## Prerequisites

- MCP server `podman-desktop-mcp` configured via `.mcp.json` at the repo root (already done)
- For dev mode: Node.js 24+ and pnpm 10+ installed
- For production mode: Podman Desktop installed

## Workflow

### Phase 1: Detect Environment

> **Always run detection yourself. Never ask the user to run scripts manually.**

Detect the OS — run `uname -s` via the Bash tool:

- Returns `Darwin` → macOS
- Returns `Linux` → Linux
- Starts with `MINGW`, `MSYS`, or `CYGWIN` → Windows (Git Bash)
- Command unavailable or unrecognized → Windows (native PowerShell)

Run the probe script to detect what's running:

**Linux / macOS:**

```bash
bash .agents/skills/mcp-testing/probe.sh
```

**Windows:**

```bash
pwsh .agents/skills/mcp-testing/probe.ps1
```

Parse the key=value output. You will get eleven variables:

- `PROD_RUNNING` — whether a production (installed) Podman Desktop is running
- `PROD_CDP_PORT` — CDP port for production (`none` if CDP not available)
- `PROD_APP_TITLE` — window title of production app (`none` if not available)
- `DEV_RUNNING` — whether `pnpm watch` is running
- `DEV_CDP_PORT` — CDP port for dev (`none` if not available)
- `DEV_APP_TITLE` — window title of dev app (`none` if not available)
- `STALE_SESSION` — `true` if a previous session left a state file without cleaning up
- `PORT_9222_NAME` / `PORT_9222_PID` — process on port 9222 (`none` if free)
- `PORT_9223_NAME` / `PORT_9223_PID` — process on port 9223 (`none` if free)

**Stale session:** If `STALE_SESSION=true`, run the stop script immediately — no confirmation needed — then re-run the probe to get fresh state:

**Linux / macOS:**

```bash
bash .agents/skills/mcp-testing/stop.sh
```

**Windows:**

```powershell
pwsh .agents/skills/mcp-testing/stop.ps1
```

**Port conflict:** For each port where `PORT_<port>_NAME` is not `none`, `electron`, `node`, or `Podman Desktop`, use `AskUserQuestion`:

- **Question:** `Port {PORT} is in use by "{NAME}" (PID {PID}), which doesn't look like Podman Desktop. Kill it to free the port?`
- **Header:** `Port conflict`
- **Options:**
  1. `Kill it` — Stop the process and free the port
  2. `Skip` — Leave it running (choose a different mode or abort)

If the user chooses "Kill it", kill the process using the PID from the probe output:

**Linux / macOS:** `kill <PID>`
**Windows:** `Stop-Process -Id <PID> -Force`

If the user chooses Skip and neither port is usable, report the conflict and stop — do not run the start script.

### Phase 2: Choose Mode

**Always ask the user which mode to use.** Use `AskUserQuestion` with options based on the probe results. Annotate each option with its current status.

**Build the options based on probe output:**

**Production mode option:**

- If `PROD_RUNNING=true` and `PROD_CDP_PORT` is not `none`:
  Label: `Production mode`
  Description: `Connect to installed Podman Desktop on port {PROD_CDP_PORT} — changes affect your real environment`

- If `PROD_RUNNING=true` and `PROD_CDP_PORT=none`:
  Label: `Production mode`
  Description: `Will relaunch Podman Desktop with CDP enabled — changes affect your real environment`

- If `PROD_RUNNING=false`:
  Label: `Production mode`
  Description: `Will launch Podman Desktop with CDP enabled — changes affect your real environment`

**Dev mode option:**

- If `DEV_RUNNING=true` and `DEV_CDP_PORT` is not `none`:
  Label: `Dev mode`
  Description: `pnpm watch already running on port {DEV_CDP_PORT} — instant connect`

- If `DEV_RUNNING=true` and `DEV_CDP_PORT=none`:
  Label: `Dev mode`
  Description: `pnpm watch is running but CDP is not responding — will restart pnpm watch`

- If `DEV_RUNNING=false` and `PROD_RUNNING=false`:
  Label: `Dev mode`
  Description: `Start pnpm watch for isolated development testing (2-4 minutes first run)`

- If `DEV_RUNNING=false` and `PROD_RUNNING=true`:
  Label: `Dev mode`
  Description: `Will close production app first, then start pnpm watch (2-4 minutes)`

Use the `AskUserQuestion` tool with header `Mode` and these two options. The question should be: `Which mode would you like to use for testing?`

### Phase 3: Start and Connect

Based on the chosen mode and probe results, prepare the app and run the startup script.

#### Production mode

Run the startup script — it handles detecting the current state (including stopping any dev instance that holds the single-instance lock), relaunching with CDP if needed, waiting for the app, and verifying the connection:

**Linux / macOS:**

```bash
bash .agents/skills/mcp-testing/start.sh --mode prod
```

**Windows:**

```powershell
pwsh .agents/skills/mcp-testing/start.ps1 -Mode prod
```

**Launching a specific binary (tar.gz/extracted installs, not on `PATH` and not via Flatpak):**

If `podman-desktop` isn't on `PATH` and it's not installed via Flatpak — e.g. a tar.gz release extracted to an arbitrary directory — pass the binary explicitly instead of letting auto-detection fail:

```bash
bash .agents/skills/mcp-testing/start.sh --mode prod --binary /path/to/podman-desktop
```

or set `PODMAN_DESKTOP_BINARY=/path/to/podman-desktop` (same env var name this project's own Playwright CDP runner uses — `tests/playwright/src/runner/chrome-dev-tools-protocol-runner.ts`). The script spawns that binary directly with only `--remote-debugging-port=<port>` — no `--no-sandbox`/`--disable-gpu`/`--ozone-platform` flags, matching that runner exactly — and sets `XDG_SESSION_TYPE=x11` in the child's environment on Linux, which is that runner's actual fix for a blank/non-opening dashboard on native Wayland sessions (podman-desktop#15220), not a sandbox workaround.

The script tracks the exact PID it launched (`/tmp/mcp-testing-prod.pid`) and the CDP-reported build string (`/tmp/mcp-testing-prod.version`), and refuses to report success if the port answers but the PID it launched is no longer alive — this catches a crashed launch being silently masked by an unrelated process coming up on the same port (a real, observed failure mode: a GPU-related Electron crash followed by a stale Flatpak install auto-relaunching on the same port).

**Never assume a CDP connection stays valid for an entire session.** Electron apps under CDP automation can crash mid-run. Before trusting a connection that was established more than a few actions ago — and always before a multi-step or long-running task — re-verify:

```bash
bash .agents/skills/mcp-testing/verify.sh --port 9222 [--pid <pid from start.sh's output>] [--contains "<expected version string>"]
```

This performs the same check independently of any LLM agent — it is the mechanism `scenario-testing`'s Execution Integrity Guard uses before and after every scenario, precisely because an agent's own self-report is not sufficient evidence that it actually touched a real, live app.

#### Dev mode

**If `DEV_RUNNING=true` and `DEV_CDP_PORT` is not `none`** (already running):

```bash
bash .agents/skills/mcp-testing/start.sh --mode dev-fast
```

```powershell
pwsh .agents/skills/mcp-testing/start.ps1 -Mode dev-fast
```

**If `DEV_RUNNING=true` and `DEV_CDP_PORT=none`** (pnpm watch alive but CDP not responding — treat as full restart):

Use `--mode dev` (not `dev-fast`). The start script will kill the stale process and restart cleanly.

**If `DEV_RUNNING=false`** (full startup) — set Bash tool timeout to `600000` (10 minutes):

```bash
bash .agents/skills/mcp-testing/start.sh --mode dev
```

```powershell
pwsh .agents/skills/mcp-testing/start.ps1 -Mode dev
```

#### Error handling

If the start script exits with a non-zero code, report the error output to the user and refer to the **Troubleshooting** section below. Common failures:

- Port still in use → suggest killing the process manually
- `pnpm install` timeout → check network connectivity
- CDP not available within 120s → check for single-instance lock (see Troubleshooting)

Do not retry the script automatically — let the user decide after seeing the error.

#### Extract the CDP port

When the start script prints `Ready — call mcp__podman-desktop-mcp__connect(...)`, extract the port number from that line. You will pass it to the Haiku agent in the next phase.

### Phase 4: Execute task (Haiku agent)

1. Read `.agents/skills/mcp-testing/agent-prompt.md`

2. **Select relevant operation references.** Using the task description and the table below, select which files from `.agents/skills/mcp-testing/references/operations/` to include. Always include `navigation.md`. Use your judgment — if the task implies an area even without exact keywords, include its reference.

   | File                | Covers                                                                                                                   |
   | ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
   | `navigation.md`     | **Always include.** Sidebar nav, welcome/onboarding page, dashboard, breadcrumbs, back/forward, status bar               |
   | `images.md`         | Pull/build/push/save/delete/prune images, image details, edit/rename, Containerfile, platform selection, registry search |
   | `containers.md`     | Create/run/start/stop/delete/export containers, container details, logs, terminal, port mapping, prune                   |
   | `pods.md`           | Kube Play (YAML deploy), podify (create pod from containers), pod lifecycle, pod logs, prune                             |
   | `volumes.md`        | Create/delete/prune volumes, volume details, gather sizes, usage status                                                  |
   | `networks.md`       | Create/delete networks, subnet configuration, network details, bulk delete                                               |
   | `extensions.md`     | View/install/enable/disable/delete extensions, catalog, custom OCI install, extension status                             |
   | `settings.md`       | Preferences, proxy configuration, resources, CLI tools section, Kubernetes settings                                      |
   | `registries.md`     | Add/remove/login to registries, credentials, authentication (under Settings)                                             |
   | `kubernetes.md`     | Kubernetes contexts, namespaces, resource browsing (nodes/pods/deployments/services), apply YAML                         |
   | `compose.md`        | Docker Compose onboarding, CLI tool install/uninstall/version check                                                      |
   | `search-palette.md` | Command palette (F1), search commands, navigate via palette                                                              |

   **Cross-dependencies** — when one area implies another, include both:
   - Container operations → also include `images.md` (creating a container requires an image)
   - Pod operations → also include `containers.md` (podify requires selecting containers)
   - Registry operations → also include `settings.md` (registries is under Settings)
   - Settings exploration → also include `registries.md` (registries is a Settings subsection)
   - Compose/CLI tools → also include `settings.md` (CLI tools is under Settings)
   - Settings exploration → also include `compose.md` when CLI tools may be relevant
   - Docker mentioned (docker, docker-compose, Docker Hub) → include `compose.md` + `containers.md` + `images.md` + `extensions.md` + `settings.md`
   - Kubernetes settings → also include `kubernetes.md`
   - Any image name in the task (httpd, nginx, alpine, redis, etc.) → include `images.md`
   - Ambiguous or broad scope (no single area clearly implied) → include `navigation.md` + `containers.md` + `images.md` + `settings.md` + `extensions.md`
   - General exploration or unknown scope → include all references

3. Read the selected reference files and concatenate their contents into an **Operations Reference** block

4. Spawn an agent with `model: "haiku"`, passing: `CDP port: {PORT}. Task: {TASK}` followed by the full content of agent-prompt.md, then the operations reference block

The agent uses operation references directly when they cover the elements needed for the task. It falls back to compact snapshots only for elements not in the reference, and full `snapshot()` as a last resort.

The agent returns a summary of what it found or did, and optionally a structured workflow trace (for E2E test writing tasks). The agent handles connecting to CDP, initial setup (dialogs), and disconnecting — the orchestrator only needs to pass the port number.

**After the agent returns**, use `AskUserQuestion`:

- **Question:** `What would you like to do next?`
- **Header:** `Next`
- **Options:**
  1. `Continue testing` — Provide another task (user enters free text via "Other")
  2. `Done — finish testing` — Disconnect and clean up

If the user continues, run Phase 4 again with the new task. If done, proceed to Phase 5.

### Phase 5: Cleanup

Use `AskUserQuestion`:

- **Question:** `What should I do with the app?`
- **Header:** `Cleanup`
- **Options:**
  1. `Leave running` — Keep the app alive so you can reconnect later
  2. `Close it` — Stop the app and free the port

If the user chooses **"Leave running"** — remove the session file so the next invocation finds the app cleanly via probe (no process killing):

**Linux / macOS:** `bash .agents/skills/mcp-testing/stop.sh --session-only`
**Windows:** `pwsh .agents/skills/mcp-testing/stop.ps1 -SessionOnly`

If the user chooses **"Close it"** — run the stop script, which reads the session state and kills the right processes:

**Linux / macOS:**

```bash
bash .agents/skills/mcp-testing/stop.sh
```

**Windows:**

```powershell
pwsh .agents/skills/mcp-testing/stop.ps1
```

## Troubleshooting

### `pnpm: command not found`

```bash
npm install -g pnpm
```

Then re-open your terminal and verify with `pnpm --version`.

### Production App Without CDP

**Symptom:** Probe shows `PROD_RUNNING=true` but `PROD_CDP_PORT=none`.

**Fix:** Run `start.sh --mode prod` (or `start.ps1 -Mode prod`) — it detects this case automatically, closes the running app, and relaunches it with CDP enabled.

### Production Blocks Dev Instance

`start.sh --mode dev` (and `start.ps1 -Mode dev`) automatically detects and closes a running production Podman Desktop before starting the dev instance — no manual action is needed.

**If startup still times out after 120s:** the production app may have restarted in the gap between detection and the kill, or a non-Podman-Desktop process holds port 9222. Run the stop script, verify port 9222 is free (`lsof -ti :9222`), then re-run the start script.

## Quick Reference

| Command                                                    | Purpose                                        |
| ---------------------------------------------------------- | ---------------------------------------------- |
| `bash .agents/skills/mcp-testing/probe.sh`                 | Detect environment (what's running, CDP ports) |
| `bash .agents/skills/mcp-testing/start.sh --mode dev`      | Full dev startup                               |
| `bash .agents/skills/mcp-testing/start.sh --mode dev-fast` | Fast-path (dev already running)                |
| `bash .agents/skills/mcp-testing/start.sh --mode prod`     | Launch/connect production app                  |
| `bash .agents/skills/mcp-testing/stop.sh`                  | Stop app and free port                         |
