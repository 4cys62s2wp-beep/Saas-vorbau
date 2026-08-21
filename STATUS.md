# STATUS — Stand 2026-08-18

**In einem Satz:** Fertig und geprüft. Nach der Umstellung auf die
Schwarz-Weiß-Oberfläche habe ich das Programm noch einmal gezielt auf Fehler
durchgesehen und dabei sieben echte gefunden und behoben — darunter drei, die
falsche Zahlen ins Angebot gebracht oder das Programm auf dem iPad unbrauchbar
gemacht hätten. 98 Tests der Rechenlogik und 39 Prüfungen im echten Browser
laufen durch; abgedeckt ist der vollständige Methodenzyklus vom Messen über
das Angebot bis zum Nachweis-PDF nach der Nachmessung.

## Was du als Erstes tun solltest

Dieses Programm liegt im Repository **Saas-vorbau** — nicht zu verwechseln mit
anderen Projekten auf dem Rechner.

```bash
cd ~
git clone https://github.com/4cys62s2wp-beep/Saas-vorbau.git
cd Saas-vorbau
git checkout claude/audit-tool-research-phase-wh2r5z
./RUNME.sh          # installiert, prüft, testet, baut — dauert ein bis zwei Minuten
npm run dev         # startet das Programm, Adresse steht im Terminal
```

Ist das Repository schon geklont, genügt beim nächsten Mal:

```bash
cd ~/Saas-vorbau
git fetch origin
git checkout claude/audit-tool-research-phase-wh2r5z
git pull
```

1. **Absenderangaben eintragen** — im Programm unter **Auswerten → PDF →
   Meine Angaben**: ausgeschriebener Vor- und Nachname, Straße, PLZ und Ort,
   Telefon und E-Mail. Pflichtangabe auf Geschäftsbriefen; fehlt sie, meldet
   das Programm es vor jedem PDF. Wird auf dem Gerät gespeichert, also einmalig.
2. **Einmal durchspielen** — Betrieb anlegen, Prozess, zwei Arbeitsschritte,
   je fünf Messungen, dann auswerten und ein PDF erzeugen. So siehst du in
   fünf Minuten, ob dir an der Bedienung etwas fehlt.
3. **QUELLEN.md lesen** und vor dem ersten echten Angebot die Liste in
   OPEN.md O5 abarbeiten (rund zehn Klicks auf die Quellen, die aus dieser
   Umgebung nicht direkt abrufbar waren).

Fürs iPad: `npm run build`, dann `npm run preview -- --host`. Die angezeigte
Adresse (`http://192.168.…`) am iPad in Safari öffnen und über *Teilen → Zum
Home-Bildschirm* ablegen. Erst als Home-Bildschirm-App läuft es offline und
ist von der Sieben-Tage-Löschung ausgenommen (QUELLEN.md, Thema 9). Der Mac
muss dafür laufen und im selben WLAN sein.

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
7. **Die Stoppuhr hing nicht am Arbeitsschritt.** Lief die Uhr und man
   wechselte den Schritt, wurde die Zeit beim Speichern dem *neuen* Schritt
   zugeschlagen — eine falsche Zahl, die niemandem auffällt, weil sie
   plausibel aussieht. Beim Audit vor Ort wechselt man ständig. Ein Wechsel
   bricht die laufende Messung jetzt ab, und der Hinweistext sagt das.

Aufgeräumt: nie verwendete Funktion `mittelwert`, zwei nie gesetzte Schalter,
eine ungenutzte Knopf-Variante und ein ungenutztes Farb-Token entfernt; die
Eingabeprüfung des Stundensatzrechners aus der Oberfläche in eine geprüfte
Funktion gezogen; die Bewertungstabelle als eigene Komponente ausgelagert.

Kleinere Korrekturen: Warnung bei Häufigkeit 0, Platzhalter statt leerer
Namen, leeres Datum wird nicht übernommen, kein leeres Tabellengerüst im PDF
für Prozesse ohne Schritte, kurze Dauern in Sekunden statt „0,0 min“,
Tabellenziffern nur noch in Zahlenfeldern, zuletzt benutzte Ansicht wird
gemerkt, bei mehreren Nachmessungen wird die jüngste verglichen.

Der Browser-Test war zudem an diese Umgebung gebunden (fehlende Abhängigkeit,
fest verdrahteter Browser-Pfad) — er läuft jetzt auch auf deinem Mac:
`npm run test:browser`.

## Fertig — alles hier ausgeführt, nicht nur geschrieben
**Geprüft:** `tsc` ohne Beanstandung · 98 Tests grün · `vite build` inklusive
Offline-Fähigkeit · 39 Browser-Prüfungen grün, sowohl im gebauten Stand als
auch im Entwicklungsmodus (Betrieb anlegen, messen, Uhr am Arbeitsschritt,
umbenennen, löschen, Neustart, Zahleneingabe, Stundensatz rechnen, bewerten,
Abschlag, PDF mit gültiger Signatur, Sicherungsdatei schreiben **und
einlesen**, Nachmessung, Vergleich, Nachweis-PDF). `RUNME.sh` einmal
vollständig durchlaufen.

- **Rechenlogik:** `types.ts`, `lib/statistik.ts`, `lib/kennzahlen.ts`,
  `lib/stundensatz.ts`, `lib/audit.ts`, `lib/zahlen.ts`, `lib/format.ts`,
  `lib/exportImport.ts`, `lib/storage.ts`, `lib/konstanten.ts`, `lib/quellen.ts`
- **Oberfläche:** `components/ui.tsx`, `AuditLeiste.tsx`, `Erfassung.tsx`,
  `Stoppuhr.tsx`, `Kalkulation.tsx`, `App.tsx`
- **PDF:** `lib/pdf.ts` — Messwerte, Dauer je Durchlauf, vollständiger
  Rechenweg, Stundensatz-Herleitung, Preisrahmen, Vergleich, Quellenanhang ab
  neuer Seite. Ein Test prüft jedes Zeichen gegen die eingebettete Schrift.
- **Tests:** zehn Dateien mit 98 Tests, `scripts/smoke.mjs` mit 39 Prüfungen
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
