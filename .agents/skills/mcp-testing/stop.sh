#!/usr/bin/env bash
# stop.sh — Stop everything started by the mcp-testing skill.
# Reads /tmp/mcp-testing-session to determine what to kill.
# Safe to run even if nothing is running.

set -euo pipefail

STATE=/tmp/mcp-testing-session
DEV_PORT=9223

SESSION_ONLY=false
for arg in "$@"; do
  [ "$arg" = "--session-only" ] && SESSION_ONLY=true
done

if $SESSION_ONLY; then
  rm -f "$STATE"
  echo "Session file removed — app left running"
  exit 0
fi

MODE=""
[ -f "$STATE" ] && MODE=$(cat "$STATE" | tr -d '[:space:]')

case "$MODE" in
  dev)
    echo "Stopping dev session…"

    # Kill pnpm watch process tree via PID file
    if [ -f /tmp/pnpm-watch.pid ]; then
      PID=$(cat /tmp/pnpm-watch.pid)
      kill "$PID" 2>/dev/null || true
      rm -f /tmp/pnpm-watch.pid
      echo "  Killed pnpm watch (pid $PID)"
    fi

    # Kill any remaining pnpm watch processes (catches children not in PID file)
    pkill -f 'pnpm.*watch' 2>/dev/null || true

    # Kill the Electron app listening on the dev CDP port
    if command -v lsof &>/dev/null; then
      ELECTRON_PIDS=$(lsof -ti :"$DEV_PORT" 2>/dev/null || true)
      if [ -n "$ELECTRON_PIDS" ]; then
        echo "$ELECTRON_PIDS" | xargs kill 2>/dev/null || true
        echo "  Killed Electron on port $DEV_PORT"
      fi
    fi

    rm -f /tmp/pnpm-watch.log
    ;;

  prod)
    echo "Stopping production session…"

    # Prefer the exact PID this skill launched (set when start.sh used
    # --binary or found podman-desktop/flatpak itself) — precise, and works
    # for custom binary paths that pkill -x podman-desktop might not name-match.
    if [ -f /tmp/mcp-testing-prod.pid ]; then
      PROD_PID=$(cat /tmp/mcp-testing-prod.pid)
      if kill -0 "$PROD_PID" 2>/dev/null; then
        kill "$PROD_PID" 2>/dev/null || true
        echo "  Killed tracked production process (pid $PROD_PID)"
      fi
      rm -f /tmp/mcp-testing-prod.pid
    fi
    rm -f /tmp/mcp-testing-prod.log /tmp/mcp-testing-prod.version

    case "$(uname -s)" in
      Darwin)
        osascript -e 'quit app "Podman Desktop"' 2>/dev/null || true
        ;;
      Linux)
        flatpak kill io.podman_desktop.PodmanDesktop 2>/dev/null || true
        pkill -x podman-desktop 2>/dev/null || true
        ;;
    esac
    echo "  Production app stopped"
    ;;

  "")
    echo "No active session found (/tmp/mcp-testing-session not present)"
    ;;

  *)
    echo "Unknown mode '$MODE' in $STATE — skipping process kill"
    ;;
esac

rm -f "$STATE"
echo "Cleanup complete"
