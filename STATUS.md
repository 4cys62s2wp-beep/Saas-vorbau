# STATUS — Endstand 2026-08-17

**In einem Satz:** v1 ist fertig und gepusht (Branch
`claude/audit-tool-research-phase-wh2r5z`) — QUELLEN.md komplett (11 Themen),
48/48 Unit-Tests grün, Browser-Smoke-Test von Messung bis PDF-Download grün,
Build inkl. PWA läuft. **Eine Sache ist ausgefallen: die adversariale
Gegenprüfung der Recherche** (Monats-Ausgabenlimit) — Ersatz ist die
Handprüf-Liste OPEN.md O5, ca. 10 Klicks.

## Was du als Erstes tun solltest
1. `./RUNME.sh` laufen lassen (reproduziert Install → Typecheck → Tests → Build).
2. **`ABSENDER` in `src/lib/quellen.ts` befüllen** (dein Name ausgeschrieben +
   ladungsfähige Anschrift). Pflichtangabe auf Geschäftsbriefen, QUELLEN.md T5 —
   ich habe bewusst nichts erfunden. Ohne das fehlt die Zeile im PDF.
3. QUELLEN.md lesen, dann OPEN.md O5 abarbeiten (die TEILVERIFIZIERT-Quellen
   einmal von Hand öffnen), bevor Zahlen in ein echtes Angebot gehen.

## Fertig — alles hier real ausgeführt, nicht nur geschrieben
**Verifiziert:** `tsc --noEmit` sauber · Vitest **48/48 grün** · `vite build` inkl.
Service-Worker ok · Playwright-Smoke-Test **15/15 grün** (echter Chromium: Audit
anlegen → Stoppuhr → 3 Messungen → Reload übersteht IndexedDB → Kalkulation →
Toggle → PDF-Download mit `%PDF-`-Signatur → JSON-Export).

- **Datenmodell/Logik:** `types.ts`, `lib/statistik.ts` (Median, Quartile Typ 7,
  Tukey-Ausreißer), `lib/kennzahlen.ts` (Ist/Soll/Ersparnis/Preisband,
  Baseline↔Nachmessung), `lib/stundensatz.ts`, `lib/format.ts` (de-DE + NBSP),
  `lib/exportImport.ts` (validierender Import), `lib/storage.ts`, `lib/konstanten.ts`
- **Tests:** `statistik.test.ts`, `kennzahlen.test.ts`, `stundensatz.test.ts`,
  `exportImport.test.ts`, `pdf.test.ts` — inkl. aller geforderten Randfälle
  (eine Messung, leere Reihe, Ausreißer, Restaufwand 0 %/100 %, Ersparnis ≤ 0)
- **Erfassung (iPad):** `components/Stoppuhr.tsx` (Start/Runde/Stopp/Verwerfen),
  `components/Erfassung.tsx` (große Touch-Targets, Warnschwelle, Ausreißer-Chips)
- **Kalkulation (Mac):** `components/Kalkulation.tsx` (Schritttabelle, Toggle,
  Restaufwand-Slider, Stundensatzrechner, Pflicht-Abschlag mit Begründung +
  belegbaren Begründungsvorschlägen, Ergebnisblock, Vergleich, PDF-Knopf)
- **PDF:** `lib/pdf.ts` — Rohmesswerte, jeder Rechenschritt, Stundensatz-Herleitung,
  Preisband, Vergleich, Messqualitäts-Hinweise, rechtliche Hinweise,
  Quellen-/Annahmenblock mit Statusangaben
- **Rahmen:** `App.tsx` (Ansichten, Export/Import, Export-Erinnerung), PWA
  (`vite.config.ts` + Icons via `scripts/erzeuge-icons.mjs`), `scripts/smoke.mjs`
- **Doku:** `QUELLEN.md` (11 Themen), `README.md`, `ENTSCHEIDUNGEN.md` (E1–E7),
  `OPEN.md` (O1–O8), `RUNME.sh`

## Was NICHT fertig ist (ehrlich)
- **Adversariale Gegenprüfung der Recherche: ausgefallen.** 11 von 22
  Workflow-Agenten sind am Monats-Ausgabenlimit gescheitert — es waren genau die
  Prüf-Agenten. Die Statusangaben in QUELLEN.md sind damit Selbsteinschätzung
  ohne Zweitmeinung; ich habe **nichts hochgestuft**. Details: OPEN.md O8.
- **Lernkurven-/J-Kurven-Literatur** (Einlernverluste) unrecherchiert → im Tool
  bewusst **keine** Prozentwerte daraus. OPEN.md O7.
- **Produktivstunden-Mini-Rechner** (Urlaub/Feiertage/Krank einzeln) ist als
  Ausbaustufe beschrieben, aber nicht gebaut — aktuell gibst du die produktiven
  Stunden direkt ein (belegte Referenz 1.455–1.503 h steht als Platzhaltertext im Feld).
- **pdfmake 0.2.23 statt 0.3.x** — funktioniert nachweislich, Upgrade optional (O6).

## Offene Annahmen
OPEN.md: O1 (Netzlage → Verifikationstiefe), O4 (löscht Icon-Entfernen die Daten?
auf Testgerät prüfen), O5 (Handprüf-Liste), O6/O7/O8 wie oben.
Entscheidungen inkl. Begründung: ENTSCHEIDUNGEN.md E1–E7 — besonders **E6**
(„Soll" enthält nicht-automatisierbare Schritte voll; die wörtliche
Auftragslesart hätte die Ersparnis überhöht).
