#!/usr/bin/env bash
# start.sh — Start or connect to Podman Desktop for MCP testing.
# Requires --mode flag. Detection is handled by probe.sh; this script executes.
#
# Usage:
#   bash start.sh --mode dev          # full startup (clean, install, pnpm watch)
#   bash start.sh --mode dev-fast     # fast-path (pnpm watch already running)
#   bash start.sh --mode prod         # launch/connect production app (auto-detects state)
#
# After exit 0, call mcp__podman-desktop-mcp__connect({ port: <PORT> }).

set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../" && pwd)"
DEV_PORT=9223

# Private, per-user state directory. A fixed /tmp/mcp-testing-session path is
# world-writable: a local attacker could pre-create it (as a file, directory,
# or symlink) with content this script - and stop.sh - later trust. Create a
# 0700 directory scoped to this uid and refuse to use it unless we can confirm
# we actually own it.
# The base is XDG_RUNTIME_DIR when set (per-user and 0700 on Linux), else
# TMPDIR (already per-user on macOS), else /tmp, where another user could
# squat the name first and block startup. stop.sh and probe.sh use the same.
MCP_STATE_DIR="${XDG_RUNTIME_DIR:-${TMPDIR:-/tmp}}/mcp-testing-$(id -u)"
if [[ -L "$MCP_STATE_DIR" ]] || { [[ -e "$MCP_STATE_DIR" ]] && [[ ! -d "$MCP_STATE_DIR" ]]; }; then
  echo "ERROR: $MCP_STATE_DIR exists and is not a plain private directory - remove it and re-run: rm -f '$MCP_STATE_DIR'"
  exit 1
fi
mkdir -m 700 "$MCP_STATE_DIR" 2>/dev/null || true
if [[ ! -d "$MCP_STATE_DIR" ]]; then
  echo "ERROR: cannot create $MCP_STATE_DIR - check that ${XDG_RUNTIME_DIR:-${TMPDIR:-/tmp}} exists and is writable"
  exit 1
fi
mcp_state_owner=$(stat -c %u "$MCP_STATE_DIR" 2>/dev/null || stat -f %u "$MCP_STATE_DIR" 2>/dev/null || echo -1)
mcp_state_perms=$(stat -c %a "$MCP_STATE_DIR" 2>/dev/null || stat -f %Lp "$MCP_STATE_DIR" 2>/dev/null || echo 000)
if [[ "$mcp_state_owner" != "$(id -u)" || "$mcp_state_perms" != "700" ]]; then
  echo "ERROR: $MCP_STATE_DIR is not a private directory you own (uid=$mcp_state_owner perms=$mcp_state_perms) - remove it and re-run: rm -rf '$MCP_STATE_DIR'"
  exit 1
fi
STATE_FILE="$MCP_STATE_DIR/session"

# VS Code (and other Electron-based editors) set ELECTRON_RUN_AS_NODE=1 in child
# processes. This makes the Electron binary run as plain Node.js, breaking the
# Electron API and Chromium flags like --remote-debugging-port. Unset it so that
# pnpm watch can spawn Electron properly.
unset ELECTRON_RUN_AS_NODE

cdp_ready() { curl -s --connect-timeout 2 --max-time 5 "http://localhost:${1:-$DEV_PORT}/json/version" &>/dev/null; }
watch_running() { pgrep -f 'pnpm.*watch' &>/dev/null; }

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
        if ! echo "$line" | grep -qE 'node_modules|pnpm|scripts/watch'; then
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

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode) MODE="$2"; shift 2 ;;
    *)      echo "Unknown argument: $1"; exit 1 ;;
  esac
done

if [[ -z "$MODE" ]]; then
  echo "Usage:"
  echo "  bash start.sh --mode dev          # full startup"
  echo "  bash start.sh --mode dev-fast     # fast-path (already running)"
  echo "  bash start.sh --mode prod         # launch/connect production app"
  exit 1
fi

# ── Mode: prod ───────────────────────────────────────────────────────────────
if [[ "$MODE" == "prod" ]]; then

  launch_prod() {
    case "$(uname -s)" in
      Darwin)
        open -a "Podman Desktop" --args --remote-debugging-port=9222
        ;;
      Linux)
        if command -v podman-desktop &>/dev/null; then
          podman-desktop --remote-debugging-port=9222 &
        elif flatpak list --app 2>/dev/null | grep -q podman_desktop; then
          flatpak run io.podman_desktop.PodmanDesktop --remote-debugging-port=9222 &
        else
          echo "ERROR: podman-desktop not found — install via RPM, Flatpak, or tar.gz"
          exit 1
        fi
        ;;
      *)
        echo "ERROR: Unsupported OS for auto-launch — launch Podman Desktop manually with --remote-debugging-port=9222"
        exit 1
        ;;
    esac
  }

  wait_cdp() {
    local port=$1
    echo "      Waiting for CDP on port ${port}…"
    for i in $(seq 1 30); do
      if cdp_ready "$port"; then
        echo "      CDP ready after ${i}s"
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
        echo "prod" > "$STATE_FILE"
        echo "Already running — $app_title (port $p)"
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
  launch_prod
  wait_cdp "$PROD_PORT" || exit 1

  # Window title may not be set immediately — retry for up to 10s
  app_title=""
  for i in $(seq 1 10); do
    app_title=$(cdp_healthy_title "$PROD_PORT") && break
    sleep 1
  done
  if [[ -z "$app_title" ]]; then
    echo "ERROR: CDP on port $PROD_PORT has no healthy app window"
    exit 1
  fi

  echo "prod" > "$STATE_FILE"
  echo "Connected to production Podman Desktop — $app_title (port $PROD_PORT)"
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

  echo "dev" > "$STATE_FILE"
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

echo "dev" > "$STATE_FILE"
echo "Ready — call mcp__podman-desktop-mcp__connect({ port: $DEV_PORT })"
