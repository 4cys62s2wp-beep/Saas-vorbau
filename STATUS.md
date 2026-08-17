# STATUS — Stand: 2026-08-17, nach Einheit F (beide Ansichten)

**Kurzfassung:** Logik + Tests grün (40/40, real ausgeführt), Erfassung (iPad) und
Kalkulation (Mac) fertig, Produktions-Build inkl. PWA-Service-Worker läuft fehlerfrei.
Recherche-Workflow für QUELLEN.md läuft noch. Es fehlen: QUELLEN.md, PDF-Export, README.

## Fertig (verifiziert: tsc sauber, Vitest 40/40 grün, vite build ok — alles hier ausgeführt)
- Gerüst: `package.json` (+ committetes Lockfile), `tsconfig.json`, `vite.config.ts` (PWA), `index.html`, `RUNME.sh`
- `src/types.ts` — Datenmodell laut Auftrag (bindend)
- `src/lib/statistik.ts` — Median, Quartile (Typ 7), Tukey-Ausreißer (nur Markierung)
- `src/lib/kennzahlen.ts` — Ist/Soll/Ersparnis/Preisband, Baseline↔Nachmessung-Vergleich
- `src/lib/stundensatz.ts` — Stundensatzrechner (Kostensatz, ohne Gewinn)
- `src/lib/exportImport.ts` — JSON-Export/-Import mit vollständiger Validierung
- `src/lib/storage.ts` — idb-keyval, persist()-Anforderung, Export-Zeitstempel
- `src/lib/format.ts` — de-DE-Formatierung (DIN-5008-Feinheiten nach QUELLEN.md)
- `src/state/useAudits.ts` — Autosave nach jeder Aktion
- `src/components/Stoppuhr.tsx` — Start/Runde/Stopp/Verwerfen, 0,1-s-Auflösung
- `src/components/Erfassung.tsx` — Audit/Prozess/Schritt anlegen, Messen, Ausreißer-Chips, Warnschwelle
- `src/components/Kalkulation.tsx` — Schritttabelle, Toggle, Slider, Stundensatzrechner,
  Pflicht-Abschlag mit Begründung, Ergebnisblock, Vergleich
- `src/App.tsx` — Ansichten-Umschalter, Export/Import, Export-Erinnerung
- Tests: `statistik.test.ts`, `kennzahlen.test.ts`, `stundensatz.test.ts`, `exportImport.test.ts`

## In Arbeit
- Recherche-Workflow (11 Themen + 11 Gegenprüfer) → QUELLEN.md. Läuft im Hintergrund;
  Ergebnis wird beim Eintreffen eingearbeitet (inkl. Festziehen von
  `MIN_MESSUNGEN_WARNSCHWELLE` in `src/lib/konstanten.ts`, aktuell vorläufig 5).

## Als Nächstes (Reihenfolge)
1. QUELLEN.md aus Workflow-Ergebnis + OPEN.md/konstanten.ts nachziehen
2. PDF-Export (pdfmake) mit vollem Rechenweg + Quellen-/Annahmenblock aus QUELLEN.md
3. README.md
4. PWA-Icons (O2, niedrig priorisiert)

## Wartet auf RUNME.sh (auf deinem Mac)
- Nur noch Reproduktion: `./RUNME.sh` (npm ci → Typecheck → Tests → Build) und `npm run dev`.
  Alles davon lief hier bereits erfolgreich — nichts ist ungetestet gepusht.

## Offene Annahmen
- OPEN.md: O1 (Netzlage/Verifikationstiefe der Quellen), O2 (PWA-Icons), O3 (erledigt sich
  durch committetes Lockfile — npm install lief hier fehlerfrei)
- ENTSCHEIDUNGEN.md: E1–E7, insbesondere E6 (Soll-Interpretation, konservativ)
