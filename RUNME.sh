#!/usr/bin/env bash
# RUNME.sh — alles, was dein Terminal braucht. Idempotent, bricht bei Fehlern ab.
# Reihenfolge: Node prüfen -> Abhängigkeiten -> Typecheck -> Tests -> Build -> Startanleitung.
set -euo pipefail

cd "$(dirname "$0")"

echo "== 1/5 Node-Version prüfen (benötigt: >= 20.19) =="
node --version

echo "== 2/5 Abhängigkeiten installieren (npm ci, falls Lockfile da; sonst npm install) =="
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo "== 3/5 Typecheck =="
npm run typecheck

echo "== 4/5 Tests (Vitest, einmaliger Lauf) =="
npm run test:run

echo "== 5/5 Produktions-Build =="
npm run build

echo
echo "Dev-Server starten (Mac):        npm run dev"
echo "Im lokalen Netz fürs iPad:       npm run dev -- --host   (dann http://<Mac-IP>:5173 auf dem iPad öffnen,"
echo "                                 'Zum Home-Bildschirm' hinzufügen; PWA-Offline-Cache greift erst nach"
echo "                                 'npm run build' + 'npm run preview -- --host' oder einem echten Deploy)"
echo
echo "STATUS: RUNME.sh vollständig durchgelaufen am $(date '+%Y-%m-%d %H:%M') — Version $(node -p "require('./package.json').version"), Node $(node --version)"
