# STATUS — Stand: 2026-08-17, nach QUELLEN.md-Erstausgabe (Themen 1–9)

**Kurzfassung:** App komplett (Erfassung, Kalkulation, PDF, Export/Import, PWA,
Icons, README), 48/48 Tests grün, Build ok — alles hier real ausgeführt und
gepusht. QUELLEN.md deckt Themen 1–9 ab; Themen 10–11 und die adversarialen
Gegenprüfungen laufen noch im Hintergrund-Workflow und werden nachgetragen.

## Fertig (verifiziert: tsc sauber, Vitest 48/48, vite build inkl. PWA — hier ausgeführt)
- Alles aus dem vorherigen Stand (Gerüst, types, statistik, kennzahlen,
  stundensatz, exportImport, storage, format, useAudits, Stoppuhr, Erfassung,
  Kalkulation, App) — Details siehe Git-Historie
- `src/lib/pdf.ts` + `pdf.test.ts` — PDF mit vollem Rechenweg (Messwerte,
  Zwischenschritte, Stundensatz-Herleitung, Preisband, Vergleich, Messqualität,
  Hinweise, Quellenblock); pdfmake 0.2.23, eingebettete Roboto-TTF (Umlaute/€ ok,
  vfs-Form direkt in node_modules geprüft)
- `QUELLEN.md` — Themen 1–9 mit Quellen/URLs/Stand/Status (Dreistufung)
- `src/lib/quellen.ts` — 15 PDF-Quelleneinträge + ANGEBOT_HINWEISE (Bindefrist
  § 148 BGB, § 19 UStG neu, Art.-13-DSGVO-Hinweis) + ABSENDER (leer, TODO Nutzer)
- `src/lib/konstanten.ts` — Warnschwelle 5 belegt (Konvention, QUELLEN.md T4),
  „statistisch abgesichert ab 30" (Orghandbuch des Bundes)
- PWA-Icons (`scripts/erzeuge-icons.mjs`), `README.md`, `RUNME.sh`

## In Arbeit (Hintergrund-Workflow, Ergebnis wird eingearbeitet)
- Recherche Thema 10 (pdfmake-Fonts, Doku-Belege) und Thema 11
  (Konservativ-Abschlag-Herleitung); danach 11 adversariale Gegenprüfungen.
  → Beim Eintreffen: QUELLEN.md Themen 10/11 + Gegenprüfungs-Vermerke ergänzen,
  Statuse ggf. ABSTUFEN (nie aufwerten), quellen.ts nachziehen.
  Zwischenstand liegt versioniert in den Workflow-Journalen; QUELLEN.md ist auch
  ohne diese Ergänzung benutzbar und ehrlich markiert.

## Als Nächstes (Reihenfolge)
1. Workflow-Ergebnisse einarbeiten (QUELLEN.md 10/11 + Gegenprüfung, quellen.ts)
2. Playwright-Smoke-Test der App (Chromium ist vorinstalliert) — optional, falls Zeit
3. STATUS.md finalisieren

## Wartet auf dich / RUNME.sh (auf deinem Mac)
- `./RUNME.sh` (reproduziert Install → Typecheck → Tests → Build; lief hier alles)
- `npm run dev -- --host` und iPad im WLAN verbinden, „Zum Home-Bildschirm"
- **ABSENDER in `src/lib/quellen.ts` mit deinem Namen + ladungsfähiger Anschrift
  befüllen** (Pflichtangabe Geschäftsbrief, QUELLEN.md Thema 5 — bewusst leer)
- Stichprobe: 4 HWK-PDF-Links aus QUELLEN.md einmal von Hand öffnen (Egress-Sperre
  hier, siehe OPEN.md O1)

## Offene Annahmen
- OPEN.md O1 (Netzlage → Verifikationstiefe), O4 (Icon-Entfernen löscht Daten?
  auf Testgerät prüfen — steht in QUELLEN.md T9), ENTSCHEIDUNGEN.md E1–E7
