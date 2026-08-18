# Entscheidungen (statt Rückfragen)

Format: Frage / gewählte Option / Alternative / Grund / Revidierbarkeit.

## E1: Reihenfolge — Gerüst und Logik vor QUELLEN.md-Finalisierung
- **Frage:** Vorgabe war „1. QUELLEN.md finalisieren". Der Recherche-Workflow (11 Themen + 11 Gegenprüfer) läuft aber noch. Warten oder vorziehen?
- **Gewählt:** Forschungsunabhängige Einheiten (Projektgerüst, types.ts, Kennzahlenlogik, Tests) vorziehen; QUELLEN.md wird finalisiert, sobald die Verifikationsrunde durch ist. Forschungsabhängige Konstanten (Mindest-Messreihenlänge für die UI-Warnung) sind bis dahin als klar markierte, an QUELLEN.md gekoppelte Parameter angelegt.
- **Alternative:** Leerlauf bis Workflow-Ende.
- **Grund:** Begrenztes Zeitfenster (Limit-Reset 19:00); Leerlauf riskiert, dass gar nichts Lauffähiges entsteht. Das Datenmodell ist laut Auftrag ohnehin bindend vorgegeben, hängt also nicht an der Recherche.
- **Revidierbar:** Trivial — QUELLEN.md kommt als eigener Commit; Konstanten werden dann angepasst.

## E2: Tailwind v4 mit @tailwindcss/vite (statt v3 + PostCSS)
- **Gewählt:** Tailwind v4, eingebunden über das offizielle Vite-Plugin, CSS-Import per `@import "tailwindcss"`.
- **Alternative:** Tailwind v3 mit tailwind.config.js + PostCSS.
- **Grund:** v4 ist seit Anfang 2025 stabil, braucht keine Config-Dateien, weniger Fehlerquellen bei einem Setup, das ich hier nicht interaktiv debuggen kann.
- **Revidierbar:** Mittel — betrifft nur Build-Setup, keine Komponenten-API.

## E3: vite-plugin-pwa statt handgeschriebenem Service Worker
- **Gewählt:** vite-plugin-pwa (Workbox, `registerType: autoUpdate`), Manifest im Plugin konfiguriert.
- **Alternative:** Eigener Service Worker + manuelles Manifest.
- **Grund:** Vite hasht Dateinamen im Build; eine handgepflegte Precache-Liste bricht bei jedem Build. Workbox generiert sie korrekt. Offline-Fähigkeit auf dem iPad ist Kernanforderung.
- **Revidierbar:** Mittel — Plugin ließe sich gegen eigenen SW tauschen, ohne App-Code anzufassen.

## E4: Kein Router — zwei Ansichten über lokalen State
- **Gewählt:** Umschalter Erfassung/Kalkulation als App-State.
- **Alternative:** react-router.
- **Grund:** Einzelnutzer-Tool mit zwei Ansichten; ein Router ist Overhead und eine Abhängigkeit mehr, die offline nichts beiträgt.
- **Revidierbar:** Leicht.

## E6: „Soll-Minuten" enthält nicht-automatisierbare Schritte in voller Höhe
- **Frage:** Auftragstext: „Soll-Minuten = nur automatisierbare Schritte × restaufwandProzent". Wörtlich gelesen fielen nicht-automatisierbare Schritte aus dem Soll komplett heraus — dann stünde ihre volle Zeit als „Ersparnis" im Angebot.
- **Gewählt:** Soll = nicht-automatisierbare Schritte voll + automatisierbare × Restaufwand. Ersparnis entsteht damit ausschließlich aus automatisierbaren Schritten.
- **Alternative:** Wörtliche Lesart.
- **Grund:** Die wörtliche Lesart überhöht die Ersparnis systematisch — genau der Fehler, den ein skeptischer Meister sofort zerlegt. Konservativere Variante gewählt.
- **Revidierbar:** Leicht — eine Zeile in `berechneSchritt` (`kennzahlen.ts`), Tests decken beide Größen ab.

## E7: Ausreißer werden markiert, nie automatisch gestrichen
- **Gewählt:** Tukey-Zäune (1,5 × IQR, Quartile Typ 7) markieren verdächtige Werte im UI; Streichen bleibt Nutzerentscheidung. Bei n < 4 keine Markierung (Quartile nicht sinnvoll).
- **Alternative:** Automatisches Trimmen / Winsorizing.
- **Grund:** REFA-Konvention (Messwerte nur mit dokumentierbarem Sondereinfluss streichen, siehe QUELLEN.md Thema 4) + Nachvollziehbarkeit vor dem Kunden: eine automatisch bereinigte Messreihe ist nicht mehr die Messung.
- **Revidierbar:** Leicht — reine Zusatzinformation, ändert keine Kennzahl.

## E8: Gestaltung ausschließlich in Schwarz, Weiß und Grau
- **Frage:** Wie werden Zustände (ausgewählt, aktiv, Warnung) ohne Farbe unterscheidbar?
- **Gewählt:** Kontrast statt Farbe — ausgewählte Elemente sind invertiert (weiß auf schwarz), Warnungen tragen einen kräftigen Balken links und ein fettes Schlagwort, auffällige Messwerte einen doppelten Rahmen und einen Stern mit Legende.
- **Alternative:** Grün/Rot/Gelb für Zustände.
- **Grund:** Vorgabe „nur schwarz und weiß". Nebeneffekt: bleibt im Schwarz-Weiß-Ausdruck und bei Farbfehlsichtigkeit eindeutig.
- **Revidierbar:** Leicht — Farbwerte stehen zentral in `src/styles.css`.

## E9: Fachbegriffe durch Alltagssprache ersetzt (Rechengrößen unverändert)
- **Gewählt:** „Sicherheitsabschlag 20 %" statt „konservativFaktor 0,8"; „Messung speichern" statt „Runde"; „Messen/Auswerten" statt „Erfassung/Kalkulation"; „Erstmessung" statt „Baseline". Der Rechenfaktor wird daneben angezeigt und im PDF mitgedruckt.
- **Alternative:** Fachbegriffe beibehalten.
- **Grund:** Das Programm soll ohne Einarbeitung bedienbar sein. Der Steuerberater braucht trotzdem den Faktor — deshalb beides, nicht entweder/oder. Gerechnet wird unverändert mit dem Faktor (`faktorAusAbschlagProzent`, getestet).
- **Revidierbar:** Leicht — reine Beschriftungen; die Umrechnung liegt in `lib/audit.ts`.

## E10: Absenderangaben gehören in die Oberfläche, nicht in den Quelltext
- **Frage:** Die für Geschäftsbriefe verpflichtenden Angaben (Name, ladungsfähige Anschrift) standen als leere Konstante im Code.
- **Gewählt:** Eingabe im Programm (Auswertung → PDF → „Meine Angaben"), gespeichert auf dem Gerät; fehlen sie, erscheint das als offener Punkt vor dem PDF-Export.
- **Alternative:** Weiterhin im Quelltext pflegen.
- **Grund:** Eine Pflichtangabe, die nur mit einem Editor zu setzen ist, wird in der Praxis vergessen — und das Dokument wäre unvollständig.
- **Revidierbar:** Leicht.

## E11: Eine gemeinsame Betriebsauswahl für beide Ansichten
- **Gewählt:** Auswahl und Verwaltung des Betriebs stehen als Leiste über beiden Ansichten.
- **Alternative:** Bisheriger Zustand — eigene Auswahl in der Erfassung, ein zweites Auswahlfeld in der Kalkulation.
- **Grund:** Zwei Bedienstellen für dieselbe Sache sind eine Fehlerquelle (unterschiedliche Auswahl je Ansicht). Nebeneffekt: weniger Oberfläche.
- **Revidierbar:** Mittel.

## E5: Vitest ohne globals, Tests neben den Modulen
- **Gewählt:** Explizite Imports (`import { describe, it, expect } from 'vitest'`), Tests als `*.test.ts` unter `src/lib/`.
- **Alternative:** globals: true.
- **Grund:** Keine zusätzliche tsconfig-Magie; Tests bleiben ohne Setup lesbar korrekt — wichtig, falls sie hier nicht ausgeführt werden können.
- **Revidierbar:** Trivial.
