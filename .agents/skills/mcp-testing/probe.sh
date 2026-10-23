#!/usr/bin/env bash
# probe.sh — Read-only environment detection for MCP testing.
# Never starts, kills, or modifies anything. Prints structured key=value output.
#
# Output:
#   PROD_RUNNING=true|false
#   PROD_CDP_PORT=<port>|none
#   PROD_APP_TITLE=<title>|none
#   DEV_RUNNING=true|false
#   DEV_CDP_PORT=<port>|none
#   DEV_APP_TITLE=<title>|none
#   STALE_SESSION=true|false
#   PORT_9222_NAME=<name>|none   PORT_9222_PID=<pid>|none
#   PORT_9223_NAME=<name>|none   PORT_9223_PID=<pid>|none

cdp_healthy_title() {
  local port=$1
  curl -s --connect-timeout 2 --max-time 5 "http://localhost:$port/json" 2>/dev/null | node -e '
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

# ── Production detection ─────────────────────────────────────────────────────
prod_running=false
case "$(uname -s)" in
  Darwin)
    pgrep -f "Podman Desktop.app/Contents" &>/dev/null && prod_running=true
    ;;
  Linux)
    while IFS= read -r line; do
      if ! echo "$line" | grep -qE 'node_modules|pnpm|scripts/watch'; then
        prod_running=true; break
      fi
    done < <(pgrep -af "podman-desktop" 2>/dev/null)
    # Also detect Flatpak-installed PD (app ID uses underscores: io.podman_desktop.PodmanDesktop)
    if ! $prod_running && pgrep -f "io.podman_desktop.PodmanDesktop" &>/dev/null; then
      prod_running=true
    fi
    ;;
esac

prod_cdp_port=none
prod_app_title=none
if $prod_running; then
  for p in 9222; do
    if curl -s --connect-timeout 2 --max-time 5 "http://localhost:$p/json/version" &>/dev/null; then
      title=$(cdp_healthy_title "$p") && {
        prod_cdp_port=$p
        prod_app_title=$title
        break
      }
    fi
  done
fi

# ── Dev detection ────────────────────────────────────────────────────────────
dev_running=false
pgrep -f 'pnpm.*watch' &>/dev/null && dev_running=true

dev_cdp_port=none
dev_app_title=none
if $dev_running; then
  if curl -s --connect-timeout 2 --max-time 5 "http://localhost:9223/json/version" &>/dev/null; then
    title=$(cdp_healthy_title 9223) && {
      dev_cdp_port=9223
      dev_app_title=$title
    }
  fi
fi

# ── Stale session check ──────────────────────────────────────────────────────
# Only stale if session file exists AND no healthy CDP is reachable.
# If the app is running and accessible, the file is from a "Leave running" exit — not an orphan.
# Path must match the private, per-user directory start.sh creates (see its
# MCP_STATE_DIR) - probe.sh is read-only and never creates it itself.
stale_session=false
if [ -f "${XDG_RUNTIME_DIR:-${TMPDIR:-/tmp}}/mcp-testing-$(id -u)/session" ]; then
  if [[ "$prod_cdp_port" == "none" && "$dev_cdp_port" == "none" ]]; then
    stale_session=true
  fi
fi

# ── Port conflict check ───────────────────────────────────────────────────────
for port in 9222 9223; do
  info=$(lsof -i ":$port" -n -P 2>/dev/null | awk '/LISTEN/ {print $1 ":" $2; exit}')
  if [[ -n "$info" ]]; then
    _name="${info%%:*}"
    _pid="${info##*:}"
    eval "port_${port}_name=\$_name"
    eval "port_${port}_pid=\$_pid"
  else
    eval "port_${port}_name=none"
    eval "port_${port}_pid=none"
  fi
done

# ── Output ───────────────────────────────────────────────────────────────────
echo "PROD_RUNNING=$prod_running"
echo "PROD_CDP_PORT=$prod_cdp_port"
echo "PROD_APP_TITLE=$prod_app_title"
echo "DEV_RUNNING=$dev_running"
echo "DEV_CDP_PORT=$dev_cdp_port"
echo "DEV_APP_TITLE=$dev_app_title"
echo "STALE_SESSION=$stale_session"
echo "PORT_9222_NAME=$port_9222_name"
echo "PORT_9222_PID=$port_9222_pid"
echo "PORT_9223_NAME=$port_9223_name"
echo "PORT_9223_PID=$port_9223_pid"
