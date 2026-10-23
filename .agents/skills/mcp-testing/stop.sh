#!/usr/bin/env bash
# stop.sh — Stop everything started by the mcp-testing skill.
# Reads the session file in this user's private state directory (see
# MCP_STATE_DIR below) to determine what to kill.
# Safe to run even if nothing is running.

set -euo pipefail

# Must match the private, per-user directory start.sh creates (0700, owned by
# this uid). A fixed /tmp/mcp-testing-session path was world-writable, so a
# local attacker could pre-create it and control which mode this script acts on.
MCP_STATE_DIR="${XDG_RUNTIME_DIR:-${TMPDIR:-/tmp}}/mcp-testing-$(id -u)"
STATE="$MCP_STATE_DIR/session"
DEV_PORT=9223

SESSION_ONLY=false
for arg in "$@"; do
  [ "$arg" = "--session-only" ] && SESSION_ONLY=true
done

# Only trust $STATE if the directory holding it is a real (non-symlinked)
# directory this user actually owns with the expected restrictive mode.
MODE=""
STATE_TRUSTED=false
if [ -d "$MCP_STATE_DIR" ] && [ ! -L "$MCP_STATE_DIR" ]; then
  owner_uid=$(stat -c %u "$MCP_STATE_DIR" 2>/dev/null || stat -f %u "$MCP_STATE_DIR" 2>/dev/null || echo -1)
  perms=$(stat -c %a "$MCP_STATE_DIR" 2>/dev/null || stat -f %Lp "$MCP_STATE_DIR" 2>/dev/null || echo 000)
  if [ "$owner_uid" = "$(id -u)" ] && [ "$perms" = "700" ]; then
    STATE_TRUSTED=true
  else
    echo "WARNING: $MCP_STATE_DIR is not a private directory you own - ignoring session state" >&2
  fi
elif [ -e "$MCP_STATE_DIR" ] || [ -L "$MCP_STATE_DIR" ]; then
  echo "WARNING: $MCP_STATE_DIR is not a private directory you own - ignoring session state" >&2
fi

if $SESSION_ONLY; then
  if $STATE_TRUSTED; then
    rm -f "$STATE"
    echo "Session file removed — app left running"
  fi
  exit 0
fi

if $STATE_TRUSTED && [ -f "$STATE" ]; then
  MODE=$(tr -d '[:space:]' < "$STATE")
fi

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
    echo "No active session found ($STATE not present)"
    ;;

  *)
    echo "Unknown mode '$MODE' in $STATE — skipping process kill"
    ;;
esac

rm -f "$STATE"
echo "Cleanup complete"
