# Prozess-Audit

Werkzeug für Digitalisierungs-Audits in Handwerksbetrieben: Prozesse vor Ort
messen, Ersparnis vorsichtig in Euro rechnen, Angebots-PDF mit vollständigem
Rechenweg erzeugen. Läuft ohne Internet, ohne Anmeldung, ohne Server — alle
Daten bleiben auf dem Gerät.

## Bedienung in Kurzform

Das Programm hat zwei Ansichten, oben umschaltbar:

**Messen** (auf dem iPad, beim Kunden)
1. **Prozess** anlegen — ein Vorgang, der regelmäßig anfällt, mit Angabe, wie
   oft er im Monat vorkommt.
2. **Arbeitsschritte** anlegen — den Prozess in einzelne Handgriffe zerlegen.
3. **Zeit messen** — Stoppuhr starten, jede Wiederholung speichern. Ab fünf
   Messungen je Schritt gilt die Reihe als ausreichend; darunter warnt das
   Programm. Auffällige Werte werden markiert, aber nicht heimlich entfernt.

**Auswerten** (am Rechner)
1. **Interner Stundensatz** — direkt eintragen oder aus Bruttolohn,
   Lohnnebenkosten, Gemeinkosten und produktiven Stunden ausrechnen lassen.
2. **Was lässt sich automatisieren?** — je Arbeitsschritt festlegen, ob und wie
   viel Zeit danach noch übrig bleibt.
3. **Sicherheitsabschlag** — in Prozent, mit Begründung. Beides steht im PDF.
4. **Ergebnis** — Zeitgewinn, Jahresersparnis, Preisrahmen (10 / 15 / 20 %).
5. **PDF** — mit allen Messwerten, dem kompletten Rechenweg und dem
   Quellenanhang.

Liegen zu einem Betrieb Erstmessung und Nachmessung vor, erscheint zusätzlich
der Vergleich: gemessene Ersparnis gegen die seinerzeitige Vorhersage.

### Vor dem ersten Kunden-PDF
Unter **Auswerten → PDF → Meine Angaben** den eigenen Namen und die Anschrift
eintragen. Auf Geschäftsbriefen sind ausgeschriebener Vor- und Nachname sowie
eine ladungsfähige Anschrift verpflichtend (Beleg: QUELLEN.md, Thema 5).

### Nach sechs Wochen nachmessen
Betrieb auswählen → **Ändern** → **Nachmessung anlegen**. Das übernimmt alle
Prozesse und Arbeitsschritte, aber **keine** Zeiten — nachgemessen wird neu.

## Starten

```bash
./RUNME.sh        # einmalig: installieren, prüfen, testen, bauen
npm run dev       # Entwicklung am Rechner
```

Fürs iPad: `npm run build` und `npm run preview -- --host`, dann am iPad die
angezeigte Adresse in Safari öffnen und über *Teilen → Zum Home-Bildschirm*
ablegen. Erst dann läuft das Programm offline und ist von der automatischen
Löschung nach sieben Tagen ausgenommen (Beleg: QUELLEN.md, Thema 9).

**Wichtig:** Die Daten liegen nur auf dem Gerät. Regelmäßig **Daten sichern**
(erzeugt eine Datei), am Rechner **Daten einlesen**. Das ist zugleich der Weg
vom iPad zum Rechner.

## Woher die Zahlen kommen

- **Prozesszeiten:** ausschließlich eigene Messungen. Es gibt keine
  Branchen-Vorgabewerte im Programm — das Datenmodell kennt nur gemessene Werte.
- **Gerechnet wird mit dem Median** je Arbeitsschritt, nicht mit dem
  Durchschnitt: ein einzelner Ausreißer kann den Durchschnitt beliebig
  verzerren, den Median nicht (Beleg: QUELLEN.md, Thema 4).
- **Stundensatz:** interner Kostensatz ohne Gewinnaufschlag — die vorsichtige
  Grundlage, weil eingesparte Zeit Kosten spart, nicht Umsatz.
- **Sicherheitsabschlag:** kein Vorgabewert. Für die Höhe gibt es keinen
  belegbaren Standard; belegt ist die Methode (Risikoabschlag nach dem
  Korrekturverfahren, Vorsichtsprinzip § 252 HGB) — QUELLEN.md, Thema 11.
- **Alle übrigen Zahlen** stehen mit Quelle, Stand und Prüfstand in
  **QUELLEN.md** und werden im PDF-Anhang mitgedruckt.

## Aufbau

| Pfad | Inhalt |
| --- | --- |
| `src/types.ts` | Datenmodell (Betrieb → Prozess → Arbeitsschritt → Messungen) |
| `src/lib/statistik.ts` | Median, Quartile, Markierung auffälliger Werte |
| `src/lib/kennzahlen.ts` | Ist/Soll/Ersparnis, Preisrahmen, Vergleich beider Messungen |
| `src/lib/stundensatz.ts` | Stundensatzrechner |
| `src/lib/audit.ts` | Nachmessung erzeugen, Abschlag in Prozent, offene Punkte |
| `src/lib/exportImport.ts` | Sicherungsdatei schreiben und prüfend einlesen |
| `src/lib/pdf.ts` | PDF-Aufbau mit vollständigem Rechenweg |
| `src/lib/quellen.ts` | Quellenanhang und rechtliche Hinweise fürs PDF |
| `src/components/` | Oberfläche: Betriebsleiste, Messen, Auswerten, Stoppuhr |
| `src/lib/zahlen.ts` | Zahleneingaben einlesen (Punkt/Komma, Tausendertrennung) |
| `scripts/smoke.mjs` | Funktionsprüfung im echten Browser (39 Prüfungen) |

## Prüfen

```bash
npm run test:run          # 98 Tests der Rechenlogik und des PDF
# Für die Browser-Prüfung einmalig: npx playwright install chromium
npm run preview           # und in einem zweiten Fenster:
npm run test:browser      # kompletter Ablauf im Browser bis zum PDF (39 Prüfungen)
```

## Weitere Unterlagen

- **QUELLEN.md** — Belege für jede verwendete Zahl, mit Prüfstand
- **ENTSCHEIDUNGEN.md** — getroffene Entscheidungen mit Begründung
- **OPEN.md** — offene Punkte und bekannte Grenzen
- **STATUS.md** — aktueller Arbeitsstand

## Bewusst nicht enthalten

Rechnungsstellung, Kundenverwaltung, mehrere Benutzer, Diagramme.
