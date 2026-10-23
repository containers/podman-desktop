#!/usr/bin/env bash
# start.sh — Start or connect to Podman Desktop for MCP testing.
# Requires --mode flag. Detection is handled by probe.sh; this script executes.
#
# Usage:
#   bash start.sh --mode dev          # full startup (clean, install, pnpm watch)
#   bash start.sh --mode dev-fast     # fast-path (pnpm watch already running)
#   bash start.sh --mode prod         # launch/connect production app (auto-detects state)
#   bash start.sh --mode prod --binary /path/to/podman-desktop
#                                     # launch a specific production binary directly —
#                                     # for tar.gz/extracted installs not on PATH and not
#                                     # installed via Flatpak. Mirrors this project's own
#                                     # Playwright CDP runner
#                                     # (tests/playwright/src/runner/chrome-dev-tools-protocol-runner.ts):
#                                     # spawn the binary with only --remote-debugging-port,
#                                     # no sandbox/GPU flags. Same effect as setting the
#                                     # PODMAN_DESKTOP_BINARY env var (that runner's own name
#                                     # for this), which start.sh also honors if --binary is
#                                     # omitted.
#
# After exit 0, call mcp__podman-desktop-mcp__connect({ port: <PORT> }).
#
# Every successful exit also writes the exact PID launched (when known) to
# /tmp/mcp-testing-prod.pid and the CDP-reported User-Agent to
# /tmp/mcp-testing-prod.version — callers (e.g. the scenario-testing skill's
# Execution Integrity Guard) should re-check both before trusting the
# connection later in a long session: a crashed Electron process can be
# silently replaced by a different, unrelated app instance answering the same
# port (this has happened in practice — a stale Flatpak install came up on
# the same port after a GPU-related crash of the intended binary).

set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../" && pwd)"
DEV_PORT=9223

# VS Code (and other Electron-based editors) set ELECTRON_RUN_AS_NODE=1 in child
# processes. This makes the Electron binary run as plain Node.js, breaking the
# Electron API and Chromium flags like --remote-debugging-port. Unset it so that
# pnpm watch can spawn Electron properly.
unset ELECTRON_RUN_AS_NODE

cdp_ready() { curl -s --connect-timeout 2 --max-time 5 "http://localhost:${1:-$DEV_PORT}/json/version" &>/dev/null; }
watch_running() { pgrep -f 'pnpm.*watch' &>/dev/null; }

# Returns the CDP endpoint's reported User-Agent (identifies exact app/build/Electron
# version) or empty on failure. Used to detect a process swap on a port — a crashed
# app can be silently replaced by an unrelated instance answering the same port.
cdp_version_string() {
  local port=${1:-$DEV_PORT}
  curl -s --connect-timeout 2 --max-time 5 "http://localhost:$port/json/version" | node -e '
    try {
      const d = JSON.parse(require("fs").readFileSync(0, "utf8"));
      process.stdout.write(d["User-Agent"] || d.Browser || "");
    } catch { process.stdout.write(""); }
  ' 2>/dev/null
}

cdp_healthy_title() {
  local port=${1:-$DEV_PORT}
  curl -s --connect-timeout 2 --max-time 5 "http://localhost:$port/json" | node -e '
    const d = require("fs").readFileSync(0, "utf8");
    try {
      for (const t of JSON.parse(d)) {
        const u = (t.url || "").toLowerCase();
        const l = (t.title || "").toLowerCase();
        if (!u.includes("devtools") && l !== "devtools" && t.type === "page") {
          process.stdout.write(t.title || "unknown");
          process.exit(0);
        }
      }
    } catch {}
    process.exit(1);
  ' 2>/dev/null
}

close_devtools_targets() {
  local port=${1:-$DEV_PORT}
  local closed
  closed=$(curl -s --connect-timeout 2 --max-time 5 "http://localhost:$port/json" | CDP_PORT=$port node -e '
    const d = require("fs").readFileSync(0, "utf8");
    const port = process.env.CDP_PORT;
    let closed = 0;
    (async () => {
      for (const t of JSON.parse(d)) {
        const u = (t.url || "").toLowerCase();
        const l = (t.title || "").toLowerCase();
        if (u.includes("devtools") || l === "devtools") {
          try { await fetch("http://localhost:" + port + "/json/close/" + t.id); closed++; } catch {}
        }
      }
      console.log(closed);
    })();
  ' 2>/dev/null || echo 0)
  if [[ "$closed" -gt 0 ]]; then
    echo "      Closed ${closed} DevTools target(s) — waiting 10s for rendering surface…"
    sleep 10
  fi
}

detect_production_pd() {
  case "$(uname -s)" in
    Darwin)
      pgrep -f "Podman Desktop.app/Contents" &>/dev/null
      ;;
    Linux)
      local found=false
      while IFS= read -r line; do
        # Exclude this script's own invocation (its argv contains "podman-desktop"
        # whenever --binary points at a path like .../podman-desktop-1.30.1-x64/podman-desktop,
        # which otherwise self-matches and produces a false "already running" positive),
        # and other unrelated matches (dev tooling, this very grep/pgrep call).
        if ! echo "$line" | grep -qE 'node_modules|pnpm|scripts/watch|start\.sh|mcp-testing|pgrep|grep -qE'; then
          found=true; break
        fi
      done < <(pgrep -af "podman-desktop" 2>/dev/null)
      # Also detect Flatpak-installed PD (app ID uses underscores: io.podman_desktop.PodmanDesktop)
      if ! $found && pgrep -f "io.podman_desktop.PodmanDesktop" &>/dev/null; then
        found=true
      fi
      $found
      ;;
    *)
      return 1
      ;;
  esac
}

# ── Argument parsing ─────────────────────────────────────────────────────────
MODE=""
BINARY=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)   MODE="$2"; shift 2 ;;
    --binary) BINARY="$2"; shift 2 ;;
    *)        echo "Unknown argument: $1"; exit 1 ;;
  esac
done

# Same env var name this project's own Playwright CDP runner uses
# (tests/playwright/src/runner/chrome-dev-tools-protocol-runner.ts) — accept
# it as a fallback so the same env already set for that runner works here too.
BINARY="${BINARY:-${PODMAN_DESKTOP_BINARY:-}}"

if [[ -z "$MODE" ]]; then
  echo "Usage:"
  echo "  bash start.sh --mode dev          # full startup"
  echo "  bash start.sh --mode dev-fast     # fast-path (already running)"
  echo "  bash start.sh --mode prod         # launch/connect production app"
  echo "  bash start.sh --mode prod --binary /path/to/podman-desktop"
  echo "                                    # launch a specific binary (tar.gz/extracted"
  echo "                                    # installs not on PATH or via Flatpak)"
  exit 1
fi

if [[ -n "$BINARY" && "$MODE" != "prod" ]]; then
  echo "ERROR: --binary is only valid with --mode prod"
  exit 1
fi

if [[ -n "$BINARY" && ! -x "$BINARY" ]]; then
  echo "ERROR: --binary path '$BINARY' does not exist or is not executable"
  exit 1
fi

# ── Mode: prod ───────────────────────────────────────────────────────────────
if [[ "$MODE" == "prod" ]]; then

  PROD_PID_FILE=/tmp/mcp-testing-prod.pid
  PROD_LOG_FILE=/tmp/mcp-testing-prod.log
  PROD_VERSION_FILE=/tmp/mcp-testing-prod.version
  PROD_HOME_DIR=/tmp/mcp-testing-prod-home
  rm -f "$PROD_PID_FILE"

  # Linux windowing workaround, not a sandbox/GPU flag: this project's own
  # Playwright CDP runner base class sets exactly this env var for the same
  # reason (podman-desktop#15220 — blank/non-opening dashboard on native
  # Wayland sessions). Deliberately does NOT add --no-sandbox/--disable-gpu/
  # --ozone-platform flags — the upstream runner doesn't need them, and only
  # --remote-debugging-port is passed on the command line, matching it exactly.
  linux_launch_env() {
    if [[ "$(uname -s)" == "Linux" ]]; then
      echo "XDG_SESSION_TYPE=x11"
    fi
  }

  # Mirrors Runner.setupPodmanDesktopCustomFolder() in
  # tests/playwright/src/runner/podman-desktop-runner.ts exactly: an isolated
  # PODMAN_DESKTOP_HOME_DIR with its own configuration/settings.json
  # (OpenDevTools disabled, auto-update disabled). Without this, --binary
  # launches against the user's real default profile — which can collide
  # with Electron's single-instance lock if any other Podman Desktop process
  # (tray icon, autostart entry, a leftover instance from a prior run) is
  # using that same default profile, silently killing one of the two
  # processes moments after launch. This was an observed, reproducible
  # failure mode: the launched binary died within seconds of the first UI
  # interaction, with no crash message and no coredump (consistent with an
  # external SIGTERM from a second-instance handoff, not a real crash).
  setup_prod_home_dir() {
    rm -rf "$PROD_HOME_DIR"
    mkdir -p "$PROD_HOME_DIR/configuration"
    cat > "$PROD_HOME_DIR/configuration/settings.json" <<'EOF'
{"preferences.OpenDevTools":"none","extensions.autoUpdate":false,"extensions.autoCheckUpdates":false,"extensions.disabled":[]}
EOF
  }

  launch_prod() {
    local port=$1
    : > "$PROD_LOG_FILE"

    if [[ -n "$BINARY" ]]; then
      echo "      Launching explicit binary: $BINARY"
      setup_prod_home_dir
      echo "      Isolated profile: $PROD_HOME_DIR (avoids single-instance-lock collisions with any other running instance)"
      env $(linux_launch_env) PODMAN_DESKTOP_HOME_DIR="$PROD_HOME_DIR" "$BINARY" --remote-debugging-port="$port" >>"$PROD_LOG_FILE" 2>&1 &
      echo $! > "$PROD_PID_FILE"
      disown
      return 0
    fi

    case "$(uname -s)" in
      Darwin)
        open -a "Podman Desktop" --args --remote-debugging-port="$port"
        ;;
      Linux)
        if command -v podman-desktop &>/dev/null; then
          env $(linux_launch_env) podman-desktop --remote-debugging-port="$port" >>"$PROD_LOG_FILE" 2>&1 &
          echo $! > "$PROD_PID_FILE"
          disown
        elif flatpak list --app 2>/dev/null | grep -q podman_desktop; then
          flatpak run io.podman_desktop.PodmanDesktop --remote-debugging-port="$port" >>"$PROD_LOG_FILE" 2>&1 &
          echo $! > "$PROD_PID_FILE"
          disown
        else
          echo "ERROR: podman-desktop not found on PATH or via Flatpak."
          echo "       Pass an explicit binary: bash start.sh --mode prod --binary /path/to/podman-desktop"
          echo "       or set PODMAN_DESKTOP_BINARY=/path/to/podman-desktop"
          exit 1
        fi
        ;;
      *)
        echo "ERROR: Unsupported OS for auto-launch — launch Podman Desktop manually with --remote-debugging-port=$port"
        exit 1
        ;;
    esac
  }

  # Polls the CDP endpoint AND, when a PID was captured for the process we
  # launched, cross-checks that PID is still alive. This is the guard against
  # a process swap: without it, a crashed launch followed by some unrelated
  # process (or a stale prior session) coming up on the same port looks
  # identical to a successful launch — this has happened in practice.
  wait_cdp() {
    local port=$1
    local expected_pid="${2:-}"
    echo "      Waiting for CDP on port ${port}…"
    for i in $(seq 1 30); do
      if [[ -n "$expected_pid" ]] && ! kill -0 "$expected_pid" 2>/dev/null; then
        echo "ERROR: the process this script launched (pid $expected_pid) exited before exposing CDP."
        echo "       Tail of $PROD_LOG_FILE:"
        tail -20 "$PROD_LOG_FILE" 2>/dev/null || true
        return 1
      fi
      if cdp_ready "$port"; then
        echo "      CDP ready after ${i}s"
        if [[ -n "$expected_pid" ]] && ! kill -0 "$expected_pid" 2>/dev/null; then
          echo "ERROR: CDP answered on port $port, but the process we launched (pid $expected_pid) is no longer running."
          echo "       A DIFFERENT process is now serving this port — refusing to report success."
          echo "       Inspect with: curl -s http://localhost:$port/json/version"
          return 1
        fi
        return 0
      fi
      sleep 1
    done
    echo "ERROR: App did not expose CDP on port $port within 30s"
    return 1
  }

  PROD_PORT=9222

  # 1. Already running with CDP on the production port? (9223 is exclusively dev — never check it here)
  for p in 9222; do
    if cdp_ready "$p"; then
      app_title=""
      for _i in $(seq 1 10); do
        app_title=$(cdp_healthy_title "$p") && break
        sleep 1
      done
      if [[ -n "$app_title" ]]; then
        echo "prod" > /tmp/mcp-testing-session
        cdp_version_string "$p" > "$PROD_VERSION_FILE" 2>/dev/null || true
        echo "Already running — $app_title (port $p)"
        echo "      CDP-reported build: $(cat "$PROD_VERSION_FILE" 2>/dev/null || echo unknown)"
        if [[ -n "$BINARY" ]]; then
          echo "      NOTE: --binary was given but an app was already answering this port —"
          echo "      this did NOT verify it's the binary you asked for. Check the build line"
          echo "      above, or close it first if you need the exact binary launched fresh."
        fi
        echo "Ready — call mcp__podman-desktop-mcp__connect({ port: $p })"
        exit 0
      fi
    fi
  done

  # 2. Running but no CDP — relaunch with CDP flag
  if detect_production_pd; then
    echo "Production Podman Desktop is running without CDP — relaunching with --remote-debugging-port=${PROD_PORT}…"
    case "$(uname -s)" in
      Darwin) osascript -e 'quit app "Podman Desktop"' 2>/dev/null || true ;;
      Linux)
        flatpak kill io.podman_desktop.PodmanDesktop 2>/dev/null || true
        pkill -x podman-desktop 2>/dev/null || true
        ;;
    esac
    sleep 3
  fi

  # 3. Kill dev instance if it holds the single-instance lock
  if watch_running; then
    echo "      Dev instance (pnpm watch) running — stopping it to release the single-instance lock…"
    pgrep -f 'pnpm.*watch' | xargs kill 2>/dev/null || true
    lsof -ti :$DEV_PORT | xargs kill 2>/dev/null || true
    sleep 3
    echo "      Dev instance stopped"
  fi

  # 4. Not running (or just closed) — launch with CDP
  echo "Launching production Podman Desktop with --remote-debugging-port=${PROD_PORT}…"
  launch_prod "$PROD_PORT"
  LAUNCHED_PID=""
  [[ -f "$PROD_PID_FILE" ]] && LAUNCHED_PID=$(cat "$PROD_PID_FILE")
  wait_cdp "$PROD_PORT" "$LAUNCHED_PID" || exit 1

  # Window title may not be set immediately — retry for up to 10s
  app_title=""
  for i in $(seq 1 10); do
    app_title=$(cdp_healthy_title "$PROD_PORT") && break
    sleep 1
  done
  if [[ -z "$app_title" ]]; then
    echo "ERROR: CDP on port $PROD_PORT has no healthy app window"
    [[ -n "$LAUNCHED_PID" ]] && kill "$LAUNCHED_PID" 2>/dev/null || true
    exit 1
  fi

  cdp_version_string "$PROD_PORT" > "$PROD_VERSION_FILE" 2>/dev/null || true
  echo "prod" > /tmp/mcp-testing-session
  echo "Connected to production Podman Desktop — $app_title (port $PROD_PORT)"
  echo "      CDP-reported build: $(cat "$PROD_VERSION_FILE" 2>/dev/null || echo unknown)"
  [[ -n "$LAUNCHED_PID" ]] && echo "      Launched pid: $LAUNCHED_PID (tracked in $PROD_PID_FILE for crash detection)"
  echo "Ready — call mcp__podman-desktop-mcp__connect({ port: $PROD_PORT })"
  exit 0
fi

# ── Mode: dev-fast ───────────────────────────────────────────────────────────
if [[ "$MODE" == "dev-fast" ]]; then
  if ! watch_running; then
    echo "ERROR: pnpm watch is not running"
    exit 1
  fi

  if ! cdp_ready; then
    echo "ERROR: pnpm watch is running but CDP is not available on port $DEV_PORT"
    exit 1
  fi

  app_title=$(cdp_healthy_title) || {
    echo "ERROR: CDP on port $DEV_PORT has no healthy app window — restart pnpm watch"
    exit 1
  }

  close_devtools_targets

  echo "dev" > /tmp/mcp-testing-session
  echo "pnpm watch already running — $app_title"
  echo "Ready — call mcp__podman-desktop-mcp__connect({ port: $DEV_PORT })"
  exit 0
fi

# ── Mode: dev (full startup) ────────────────────────────────────────────────
if [[ "$MODE" != "dev" ]]; then
  echo "ERROR: Unknown mode '$MODE'. Use: dev, dev-fast, or prod"
  exit 1
fi

# Close production Podman Desktop if it holds the single-instance lock
if detect_production_pd; then
  echo "      Production Podman Desktop running — closing it to release the single-instance lock…"
  case "$(uname -s)" in
    Darwin) osascript -e 'quit app "Podman Desktop"' 2>/dev/null || true ;;
    Linux)
      flatpak kill io.podman_desktop.PodmanDesktop 2>/dev/null || true
      pkill -x podman-desktop 2>/dev/null || true
      ;;
  esac
  sleep 3
  echo "      Production app stopped"
fi

# Kill any existing dev instance on the dev CDP port
echo "[1/4] Stopping any running dev instance…"
if lsof -ti :$DEV_PORT &>/dev/null; then
  proc_name=$(lsof -ti :$DEV_PORT | head -1 | xargs -I{} ps -p {} -o comm= 2>/dev/null || echo "unknown")
  echo "      Killing process on port $DEV_PORT ($proc_name)"
  kill $(lsof -ti :$DEV_PORT) 2>/dev/null || true
  echo "      Stopped process on port $DEV_PORT"
fi

# Also kill any lingering pnpm watch process tree (port kill only hits the Electron app)
if pgrep -f 'pnpm.*watch' &>/dev/null; then
  pgrep -f 'pnpm.*watch' | xargs kill 2>/dev/null || true
  sleep 2
  echo "      Killed stale pnpm watch processes"
fi
rm -f /tmp/pnpm-watch.pid

# Wait up to 5s for port to drain
for i in $(seq 1 5); do
  cdp_ready || break
  sleep 1
done

if cdp_ready; then
  echo "ERROR: Port $DEV_PORT is still in use (not by pnpm watch) — stop it manually:"
  echo "  lsof -ti :$DEV_PORT | xargs kill"
  exit 1
fi
echo "      Port $DEV_PORT is free"

# Clean stale artifacts
echo "[2/4] Cleaning stale artifacts…"
rm -rf "$REPO/node_modules"
echo "      Removed node_modules/"
dist_count=0
while IFS= read -r d; do
  rm -rf "$d"
  dist_count=$((dist_count + 1))
done < <(find "$REPO/packages" "$REPO/extensions" -maxdepth 4 -name dist -type d 2>/dev/null)
echo "      Removed $dist_count dist/ folder(s)"

if ! command -v pnpm &>/dev/null; then
  echo "ERROR: pnpm not found — install with: npm install -g pnpm"
  exit 1
fi

# Install deps (timeout after 5 minutes)
echo "[3/4] Installing dependencies…"
pnpm --dir "$REPO" install &
INSTALL_PID=$!
( sleep 300 && kill $INSTALL_PID 2>/dev/null ) &
TIMER_PID=$!
if wait $INSTALL_PID 2>/dev/null; then
  kill $TIMER_PID 2>/dev/null; wait $TIMER_PID 2>/dev/null || true
  echo "      Dependencies up to date"
else
  kill $TIMER_PID 2>/dev/null; wait $TIMER_PID 2>/dev/null || true
  echo "ERROR: pnpm install failed or timed out after 5 minutes"
  exit 1
fi

# Launch pnpm watch and wait for CDP
echo "[4/4] Launching pnpm watch (output → /tmp/pnpm-watch.log)…"
if [[ "$(uname -s)" == "Linux" && -n "${WAYLAND_DISPLAY:-}" ]]; then
  ELECTRON_OZONE_PLATFORM_HINT=x11 pnpm --dir "$REPO" watch &>/tmp/pnpm-watch.log &
else
  pnpm --dir "$REPO" watch &>/tmp/pnpm-watch.log &
fi
WATCH_PID=$!
echo "$WATCH_PID" > /tmp/pnpm-watch.pid
echo "      pnpm watch started (pid $WATCH_PID)"

echo "      Waiting for CDP on port ${DEV_PORT}..."
for i in $(seq 1 120); do
  if cdp_ready; then
    echo "      CDP ready after ${i}s"
    break
  fi
  sleep 1
done
if ! cdp_ready; then
  echo "ERROR: App did not expose CDP within 120s"
  if detect_production_pd; then
    echo "HINT: A production Podman Desktop is running — it holds the"
    echo "      single-instance lock, preventing the dev instance from starting."
    echo "      Either close it, or relaunch it with CDP:"
    echo "        podman-desktop --remote-debugging-port=9222"
  fi
  tail -20 /tmp/pnpm-watch.log
  exit 1
fi

close_devtools_targets

echo "dev" > /tmp/mcp-testing-session
echo "Ready — call mcp__podman-desktop-mcp__connect({ port: $DEV_PORT })"
