# STATUS — Stand: 2026-08-17, Einheit A (Projektgerüst)

**Kurzfassung in einem Satz:** Projektgerüst steht und ist gepusht; Recherche-Workflow
(für QUELLEN.md) läuft noch im Hintergrund; als Nächstes types.ts + Kennzahlenlogik + Tests.

## Fertig
- `package.json` — React 19, Vite 7, Tailwind 4, pdfmake, idb-keyval, Vitest, vite-plugin-pwa
- `tsconfig.json` — strict inkl. noUncheckedIndexedAccess/exactOptionalPropertyTypes
- `vite.config.ts` — React + Tailwind + PWA (Workbox-Precache, Manifest), Vitest-Config
- `index.html` — de, viewport für iPad, apple-touch-icon-Verweis
- `src/main.tsx`, `src/App.tsx` (Platzhalter), `src/styles.css`
- `.gitignore`, `RUNME.sh` (idempotent, Statuszeile am Ende)
- `ENTSCHEIDUNGEN.md` (E1–E5), `OPEN.md` (O1–O3)

## In Arbeit
- Recherche-Workflow für QUELLEN.md läuft (11 Themen + 11 adversariale Gegenprüfungen).
  Ergebnis wird beim Eintreffen zu QUELLEN.md verarbeitet (eigene Einheit).

## Als Nächstes (Reihenfolge)
1. `src/types.ts` (Datenmodell laut Auftrag, bindend) + `src/lib/statistik.ts` + `src/lib/kennzahlen.ts`
2. Vitest-Tests inkl. Randfälle (eine Messung, Ausreißer, Ersparnis ≤ 0, leere Messreihe, Restaufwand 0/100 %)
3. QUELLEN.md aus Workflow-Ergebnis (sobald fertig) + Warnschwellen-Konstante festziehen
4. Storage-Schicht (idb-keyval, Autosave, JSON-Export/-Import)
5. Erfassungs-Ansicht (Stoppuhr) → 6. Kalkulations-Ansicht → 7. PDF-Export → 8. README

## Wartet auf RUNME.sh (auf deinem Rechner)
- npm-Install + Testlauf + Build. (Ich versuche beides zusätzlich hier in der Session;
  ob das klappt, steht dann unter „Fertig" — sonst gilt: Tests geschrieben, aber ungetestet.)

## Offene Annahmen
- Siehe OPEN.md: O1 (Netzlage/Verifikationstiefe), O2 (PWA-Icons), O3 (Paketversionen)
