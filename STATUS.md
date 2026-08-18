# STATUS — Stand 2026-08-18

**In einem Satz:** Das Programm ist fertig, umgestellt auf eine schlichte
Schwarz-Weiß-Oberfläche und um die fehlenden Grundfunktionen ergänzt
(Löschen, Umbenennen, Nachmessung, eigene Absenderangaben). Alles ist geprüft:
62 Tests der Rechenlogik und 29 Prüfungen im echten Browser laufen durch,
einschließlich PDF-Erstellung.

## Was du als Erstes tun solltest
1. `./RUNME.sh` laufen lassen (installieren, prüfen, testen, bauen).
2. Im Programm unter **Auswerten → PDF → Meine Angaben** Namen und Anschrift
   eintragen — Pflichtangabe auf Geschäftsbriefen. Steht sie nicht drin,
   meldet das Programm es vor jedem PDF.
3. QUELLEN.md lesen; vor dem ersten echten Angebot die Liste in OPEN.md O5
   abarbeiten (rund zehn Klicks auf die Quellen, die hier nicht direkt
   abrufbar waren).

## Fertig — alles hier ausgeführt, nicht nur geschrieben
**Geprüft:** `tsc` ohne Beanstandung · 62 Tests grün · `vite build` inklusive
Offline-Fähigkeit · 29 Browser-Prüfungen grün (Betrieb anlegen, messen,
umbenennen, löschen, Neustart übersteht die Daten, Stundensatz rechnen,
bewerten, Abschlag, PDF mit gültiger Signatur, Sicherungsdatei, Nachmessung,
Vergleich).

- **Rechenlogik:** `types.ts`, `lib/statistik.ts`, `lib/kennzahlen.ts`,
  `lib/stundensatz.ts`, `lib/audit.ts`, `lib/format.ts`, `lib/exportImport.ts`,
  `lib/storage.ts`, `lib/konstanten.ts`, `lib/quellen.ts`
- **Oberfläche:** `components/ui.tsx` (gemeinsame Bausteine),
  `AuditLeiste.tsx`, `Erfassung.tsx`, `Stoppuhr.tsx`, `Kalkulation.tsx`, `App.tsx`
- **PDF:** `lib/pdf.ts` — Messwerte, vollständiger Rechenweg,
  Stundensatz-Herleitung, Preisrahmen, Vergleich, Quellenanhang ab neuer Seite
- **Tests:** sieben Dateien mit 62 Tests, `scripts/smoke.mjs` mit 29 Prüfungen
- **Unterlagen:** QUELLEN.md (11 Themen), README.md, ENTSCHEIDUNGEN.md (E1–E11),
  OPEN.md (O1–O9), RUNME.sh

## In dieser Runde geändert
- **Gestaltung:** ausschließlich Schwarz, Weiß, Grau; Zustände über Kontrast
  statt Farbe; nummerierte Abschnitte führen durch den Ablauf; klare Schrift,
  große Schaltflächen.
- **Sprache:** „Sicherheitsabschlag 20 %" statt „Faktor 0,8" (Faktor wird
  daneben und im PDF weiterhin genannt), „Messung speichern" statt „Runde",
  „Messen/Auswerten" statt „Erfassung/Kalkulation".
- **Ergänzt, weil es fehlte:** Löschen und Umbenennen für Betrieb, Prozess und
  Arbeitsschritt; Nachmessung aus der Erstmessung erzeugen; eigene
  Absenderangaben im Programm; Prüfliste offener Punkte vor dem PDF.
- **Aufgeräumt:** doppelte Betriebsauswahl zusammengeführt, ungenutzte
  Konstanten entfernt, Systemdialoge durch Meldungen in der Seite ersetzt,
  Pluralformen korrigiert, leere Tabellen vermieden.
- **Behoben:** Schrift auf invertierten Flächen war unsichtbar (CSS-Regeln
  außerhalb der Layer setzten die Textfarben außer Kraft).

## Was NICHT fertig ist (ehrlich)
- **Adversariale Gegenprüfung der Recherche: ausgefallen** — die elf
  Prüfdurchläufe scheiterten am Monats-Ausgabenlimit. Die Angaben in
  QUELLEN.md sind Selbsteinschätzung ohne Zweitmeinung; nichts wurde
  hochgestuft. Ersatz ist die Handprüf-Liste OPEN.md O5. (OPEN.md O8)
- **Lernkurven-Literatur** unrecherchiert → im Programm bewusst keine
  Prozentwerte daraus (OPEN.md O7).
- **Produktivstunden-Rechner** (Urlaub, Feiertage, Krankheit einzeln) nicht
  gebaut; die produktiven Stunden werden direkt eingegeben, die belegte
  Referenz 1.455–1.503 steht als Hilfetext im Feld.
- **Rechtliche Textbausteine im PDF** sind fest hinterlegt und nur im Quelltext
  änderbar (OPEN.md O9).
- **pdfmake 0.2.23 statt 0.3.x** — funktioniert nachweislich, Umstieg optional
  (OPEN.md O6).

## Offene Annahmen
OPEN.md O1 (Netzlage → Prüftiefe der Quellen), O4 (löscht das Entfernen des
Symbols vom Home-Bildschirm die Daten? auf einem Testgerät prüfen), O5–O9.
Entscheidungen mit Begründung: ENTSCHEIDUNGEN.md E1–E11 — besonders **E6**
(nicht automatisierbare Schritte bleiben im Soll enthalten; die wörtliche
Auftragslesart hätte die Ersparnis überhöht).
