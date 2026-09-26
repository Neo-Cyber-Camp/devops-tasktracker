#!/usr/bin/env bash
# Exporte le tableau de bord Tasktracker de Grafana vers le depot, pour le versionner.
# Usage : ./monitoring/export-dashboard.sh, puis git add, git commit, git push.
set -euo pipefail
cd "$(dirname "$0")/.."
FILE=monitoring/grafana/dashboards/tasktracker.json
CID=$(docker ps -q --filter label=com.docker.compose.project=tasktracker --filter label=com.docker.compose.service=grafana | head -1)
[ -n "$CID" ] || { echo "Grafana ne tourne pas (projet tasktracker)."; exit 1; }
PASS=$(docker inspect "$CID" --format '{{range .Config.Env}}{{println .}}{{end}}' | sed -n 's/^GF_SECURITY_ADMIN_PASSWORD=//p')
DASH=$(python3 -c "import json, sys; print(json.load(open(sys.argv[1]))['uid'])" "$FILE")
curl -fsS -u "admin:${PASS:-admin}" "http://localhost:3000/api/dashboards/uid/$DASH" | python3 -c "
import json, sys
d = json.load(sys.stdin)['dashboard']
d.pop('id', None)
d['version'] = 1
json.dump(d, open(sys.argv[1], 'w'), indent=2, ensure_ascii=False)
print('Exporte :', len(d.get('panels', [])), 'panneau(x) dans', sys.argv[1])
" "$FILE"
