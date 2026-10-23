#!/usr/bin/env bash
# verify.sh — Independent, non-LLM ground-truth check that a CDP-connected
# Podman Desktop window is real, alive, and (optionally) the expected build.
#
# This exists because an LLM agent can fabricate a plausible-looking success
# report even when it has no working tool to back it up — self-reported "I
# connected and saw X" is not evidence. This script performs the same checks
# a human would with curl/ps, deterministically, with no model in the loop.
#
# Callers (e.g. scenario-testing's Execution Integrity Guard) must run this
# BEFORE trusting any execution agent's report, and again before every
# subsequent scenario in a run — apps under CDP automation can crash mid-run,
# and a crashed process can be silently replaced by an unrelated instance
# answering the same port.
#
# Usage:
#   bash verify.sh --port 9222 [--pid 12345] [--contains "1.30.1"]
#
# --port      required. CDP port to check.
# --pid       optional. If given, also confirms this exact process is still
#             alive — catches "port answers, but a DIFFERENT process now
#             owns it" (a real observed failure mode after a crash/relaunch).
# --contains  optional. Substring that must appear in the CDP endpoint's
#             reported User-Agent (e.g. an app version or Electron version).
#             Use this to catch "CDP is up, but it's the wrong build."
#
# Exit 0 and prints "VERIFIED: ..." on success.
# Exit 1 and prints a specific, actionable reason on any failure — never
# silent, never a bare non-zero exit with no explanation.

set -euo pipefail

PORT=""
PID=""
CONTAINS=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --port)     PORT="$2"; shift 2 ;;
    --pid)      PID="$2"; shift 2 ;;
    --contains) CONTAINS="$2"; shift 2 ;;
    *)          echo "Unknown argument: $1"; exit 1 ;;
  esac
done

if [[ -z "$PORT" ]]; then
  echo "Usage: bash verify.sh --port <port> [--pid <pid>] [--contains <substring>]"
  exit 1
fi

VERSION_JSON=$(curl -s --connect-timeout 2 --max-time 5 "http://localhost:$PORT/json/version" 2>/dev/null || true)
if [[ -z "$VERSION_JSON" ]]; then
  echo "FAILED: no CDP endpoint responding on port $PORT — nothing is actually running/reachable there."
  echo "        This means any prior agent report claiming to have interacted with the app on this"
  echo "        port could not have been real. Do not accept it."
  exit 1
fi

UA=$(echo "$VERSION_JSON" | node -e '
  try {
    const d = JSON.parse(require("fs").readFileSync(0, "utf8"));
    process.stdout.write(d["User-Agent"] || "");
  } catch { process.stdout.write(""); }
' 2>/dev/null || echo "")

if [[ -z "$UA" ]]; then
  echo "FAILED: CDP responded on port $PORT but had no User-Agent field — not a real Electron/Chromium target."
  exit 1
fi

if [[ -n "$CONTAINS" && "$UA" != *"$CONTAINS"* ]]; then
  echo "FAILED: CDP on port $PORT is serving an unexpected build."
  echo "        Expected substring: $CONTAINS"
  echo "        Actual User-Agent:  $UA"
  echo "        A different app instance may have come up on this port after a crash —"
  echo "        do not proceed until you've confirmed which app you actually want."
  exit 1
fi

if [[ -n "$PID" ]]; then
  if ! kill -0 "$PID" 2>/dev/null; then
    echo "FAILED: expected process pid $PID is not running."
    echo "        Port $PORT is being served by a DIFFERENT process than the one this"
    echo "        session launched — treat any prior report as void and re-verify from scratch."
    exit 1
  fi
fi

TITLE=$(curl -s --connect-timeout 2 --max-time 5 "http://localhost:$PORT/json" 2>/dev/null | node -e '
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
' 2>/dev/null || echo "unknown")

echo "VERIFIED: title=\"$TITLE\" | user-agent=\"$UA\"$([[ -n "$PID" ]] && echo " | pid=$PID alive")"
exit 0
