#!/usr/bin/env bash
# Slithera admin CLI
# Usage: ./admin.sh <command> [args]
# Requires ADMIN_KEY env var (or set it in .env and run: source .env && ./admin.sh ...)
#
# Commands:
#   state                        — show server state (players, parties, memory)
#   kick   <playerId>            — disconnect a player
#   broadcast <message>          — send a [SERVER] chat message to all players
#   ban    --uid <uid>           — ban a Firebase UID
#   ban    --ip <ip>             — ban an IP address
#   unban  --uid <uid>           — remove UID ban
#   unban  --ip <ip>             — remove IP ban

set -euo pipefail

BASE="${ADMIN_BASE_URL:-http://localhost/admin}"
KEY="${ADMIN_KEY:-}"

if [[ -z "$KEY" ]]; then
  echo "Error: ADMIN_KEY is not set." >&2
  echo "  export ADMIN_KEY=your-secret-key" >&2
  exit 1
fi

auth_header="Authorization: Bearer $KEY"

cmd="${1:-help}"
shift || true

case "$cmd" in
  state)
    curl -sf -H "$auth_header" "$BASE/state" | python3 -m json.tool
    ;;

  kick)
    player_id="${1:?Usage: ./admin.sh kick <playerId>}"
    curl -sf -X POST -H "$auth_header" -H "Content-Type: application/json" \
      -d "{\"playerId\":\"$player_id\"}" "$BASE/kick" | python3 -m json.tool
    ;;

  broadcast)
    text="${1:?Usage: ./admin.sh broadcast <message>}"
    curl -sf -X POST -H "$auth_header" -H "Content-Type: application/json" \
      -d "{\"text\":\"$text\"}" "$BASE/broadcast" | python3 -m json.tool
    ;;

  ban|unban)
    flag="${1:-}"
    value="${2:-}"
    case "$flag" in
      --uid) payload="{\"uid\":\"$value\"}" ;;
      --ip)  payload="{\"ip\":\"$value\"}" ;;
      *) echo "Usage: ./admin.sh $cmd --uid <uid> | --ip <ip>" >&2; exit 1 ;;
    esac
    curl -sf -X POST -H "$auth_header" -H "Content-Type: application/json" \
      -d "$payload" "$BASE/$cmd" | python3 -m json.tool
    ;;

  help|*)
    grep '^#' "$0" | sed 's/^# \{0,2\}//'
    ;;
esac
