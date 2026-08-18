# STATUS — Stand 2026-08-18

**In einem Satz:** Fertig und geprüft. Nach der Umstellung auf die
Schwarz-Weiß-Oberfläche habe ich das Programm noch einmal gezielt auf Fehler
durchgesehen und dabei sechs echte gefunden und behoben — darunter zwei, die
das Angebot verfälscht oder das Programm auf dem iPad unbrauchbar gemacht
hätten. 94 Tests der Rechenlogik und 35 Prüfungen im echten Browser laufen
durch, einschließlich PDF-Erstellung und Sicherungsdatei.

## Was du als Erstes tun solltest
1. `./RUNME.sh` laufen lassen (installieren, prüfen, testen, bauen).
2. Im Programm unter **Auswerten → PDF → Meine Angaben** Namen und Anschrift
   eintragen — Pflichtangabe auf Geschäftsbriefen. Fehlt sie, meldet das
   Programm es vor jedem PDF.
3. QUELLEN.md lesen; vor dem ersten echten Angebot die Liste in OPEN.md O5
   abarbeiten (rund zehn Klicks auf die Quellen, die hier nicht direkt
   abrufbar waren).

## Gefundene und behobene Fehler (letzter Durchgang)
1. **Stundensatz konnte hundertfach zu hoch werden.** „52.84“ mit Punkt
   getippt ergab 5284 €/h — das ganze Angebot wäre falsch gewesen. Zahlen
   werden jetzt zentral eingelesen (`src/lib/zahlen.ts`, mit Tests für
   deutsche und englische Schreibweise).
2. **Kein Komma eingebbar.** In gebundenen Feldern wurde „52,“ sofort zu
   „52“ — Nachkommastellen waren nicht tippbar.
3. **Auf dem iPad war gar nichts anzulegen.** `crypto.randomUUID` gibt es nur
   bei verschlüsselter Verbindung; beim Zugriff über die lokale IP-Adresse
   (genau der Weg aus dem README) fehlte die Funktion. Jetzt mit Rückfallweg.
4. **Rechenweg ging beim Einlesen verloren.** Die Herleitung des Stundensatzes
   stand in der Sicherungsdatei, wurde beim Import aber verworfen — im PDF
   fehlte danach genau das Argument für den Steuerberater.
5. **Ältere Sicherungsdatei überschrieb die Bewertung wortlos.** Jetzt
   Rückfrage mit Angabe der betroffenen Betriebe.
6. **Fehler beim Speichern blieben unbemerkt**, ebenso ein nicht lesbarer
   Gerätespeicher (die Anwendung hing dann dauerhaft im Ladezustand).

Kleinere Korrekturen: Warnung bei Häufigkeit 0, Platzhalter statt leerer
Namen, leeres Datum wird nicht übernommen, kein leeres Tabellengerüst im PDF
für Prozesse ohne Schritte, kurze Dauern in Sekunden statt „0,0 min“,
Tabellenziffern nur noch in Zahlenfeldern, zuletzt benutzte Ansicht wird
gemerkt, bei mehreren Nachmessungen wird die jüngste verglichen.

Der Browser-Test war zudem an diese Umgebung gebunden (fehlende Abhängigkeit,
fest verdrahteter Browser-Pfad) — er läuft jetzt auch auf deinem Mac:
`npm run test:browser`.

## Fertig — alles hier ausgeführt, nicht nur geschrieben
**Geprüft:** `tsc` ohne Beanstandung · 94 Tests grün · `vite build` inklusive
Offline-Fähigkeit · 35 Browser-Prüfungen grün (Betrieb anlegen, messen,
umbenennen, löschen, Neustart, Zahleneingabe, Stundensatz rechnen, bewerten,
Abschlag, PDF mit gültiger Signatur, Sicherungsdatei schreiben **und
einlesen**, Nachmessung, Vergleich).

- **Rechenlogik:** `types.ts`, `lib/statistik.ts`, `lib/kennzahlen.ts`,
  `lib/stundensatz.ts`, `lib/audit.ts`, `lib/zahlen.ts`, `lib/format.ts`,
  `lib/exportImport.ts`, `lib/storage.ts`, `lib/konstanten.ts`, `lib/quellen.ts`
- **Oberfläche:** `components/ui.tsx`, `AuditLeiste.tsx`, `Erfassung.tsx`,
  `Stoppuhr.tsx`, `Kalkulation.tsx`, `App.tsx`
- **PDF:** `lib/pdf.ts` — Messwerte, Dauer je Durchlauf, vollständiger
  Rechenweg, Stundensatz-Herleitung, Preisrahmen, Vergleich, Quellenanhang ab
  neuer Seite. Ein Test prüft jedes Zeichen gegen die eingebettete Schrift.
- **Tests:** zehn Dateien mit 94 Tests, `scripts/smoke.mjs` mit 35 Prüfungen
- **Unterlagen:** QUELLEN.md (11 Themen), README.md, ENTSCHEIDUNGEN.md (E1–E11),
  OPEN.md (O1–O9), RUNME.sh

## Was NICHT fertig ist (ehrlich)
- **Adversariale Gegenprüfung der Recherche: ausgefallen** — die elf
  Prüfdurchläufe scheiterten am Monats-Ausgabenlimit. Die Angaben in
  QUELLEN.md sind Selbsteinschätzung ohne Zweitmeinung; nichts wurde
  hochgestuft. Ersatz ist die Handprüf-Liste OPEN.md O5. (OPEN.md O8)
- **Lernkurven-Literatur** unrecherchiert → im Programm bewusst keine
  Prozentwerte daraus (OPEN.md O7).
- **Produktivstunden-Rechner** (Urlaub, Feiertage, Krankheit einzeln) nicht
  gebaut; die Stunden werden direkt eingegeben, die belegte Referenz
  1.455–1.503 steht als Hilfetext im Feld.
- **Rechtliche Textbausteine im PDF** sind fest hinterlegt und nur im Quelltext
  änderbar (OPEN.md O9).
- **pdfmake 0.2.23 statt 0.3.x** — funktioniert nachweislich, Umstieg optional
  (OPEN.md O6).
- **Nicht auf einem echten iPad geprüft.** Getestet wurde in Chromium im
  iPad-Format; Safari-Eigenheiten (siehe OPEN.md O4) bleiben offen.

## Offene Annahmen
OPEN.md O1 (Netzlage → Prüftiefe der Quellen), O4 (löscht das Entfernen des
Symbols vom Home-Bildschirm die Daten?), O5–O9. Entscheidungen mit Begründung:
ENTSCHEIDUNGEN.md E1–E11 — besonders **E6** (nicht automatisierbare Schritte
bleiben im Soll enthalten; die wörtliche Auftragslesart hätte die Ersparnis
überhöht).
