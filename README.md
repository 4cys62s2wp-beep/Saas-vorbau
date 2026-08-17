# Prozess-Audit-Tool

Erfassungs- und Kalkulationswerkzeug für Digitalisierungs-Audits in Handwerksbetrieben.
Einzelnutzer-Tool, kein Backend, keine Anmeldung. Prozesse werden **vor Ort gemessen**
(Stoppuhr, iPad), am Mac kalkuliert und als PDF mit vollständigem Rechenweg exportiert.

## Was das Tool tut

1. **Erfassung (iPad, offline):** Audit → Prozesse → Schritte anlegen, jede
   Schrittdauer mehrfach stoppen (jede Runde = eine Messung). Alles wird nach
   jeder Aktion automatisch in IndexedDB gespeichert. Messreihen unter der
   Warnschwelle (siehe `src/lib/konstanten.ts` und QUELLEN.md) werden markiert;
   auffällige Messwerte (Tukey-Zäune) werden angezeigt, aber nie automatisch
   gestrichen.
2. **Transfer:** Export als JSON auf dem iPad, Import am Mac (Header-Buttons).
   Der Import validiert jede Datei vollständig.
3. **Kalkulation (Mac):** Schritte als automatisierbar markieren, Restaufwand
   je Schritt einstellen, internen Stundensatz herleiten (Rechner) oder
   eintragen, Konservativ-Abschlag **mit Pflicht-Begründung** setzen.
   Ergebnis: Ist/Soll-Minuten, Jahresersparnis in €, Preisband 10/15/20 %.
   Liegen Baseline und Nachmessung desselben Betriebs vor, wird die gemessene
   Wirkung gegen die Prognose gestellt.
4. **PDF:** druckt Rohmesswerte, jeden Rechenschritt, die Stundensatz-Herleitung,
   das Preisband, Messqualitäts-Hinweise und den Quellen-/Annahmenblock.

## Starten

```bash
./RUNME.sh        # einmalig: Install, Typecheck, Tests, Build
npm run dev       # Entwicklung am Mac
npm run dev -- --host   # zusätzlich vom iPad im selben WLAN erreichbar
```

Fürs iPad als PWA: Seite in Safari öffnen → Teilen → „Zum Home-Bildschirm".
Der Offline-Cache (Service Worker) greift beim Produktions-Build
(`npm run build` + `npm run preview -- --host` oder echtes Deploy), nicht im
Dev-Server.

## Woher die Zahlen kommen

- **Prozesszeiten:** ausschließlich eigene Messungen. Es gibt bewusst keine
  Branchen-Defaults im Code — das Datenmodell kennt nur gemessene Werte.
- **Stundensatz:** wird aus Bruttolohn, Lohnnebenkosten-, Gemeinkostenzuschlag
  und produktiven Stunden hergeleitet (Schema und belegte Spannweiten:
  **QUELLEN.md**) oder manuell gesetzt.
- **Konservativ-Abschlag:** kein Vorgabewert. Pflicht-Eingabe mit Begründung,
  die im PDF mitgedruckt wird (belegbare Argumente: QUELLEN.md).
- **Alle recherchierten Zahlen** (Lohnnebenkosten, produktive Stunden,
  Messreihen-Konventionen, Rechtliches, Technisches) stehen mit Quelle, URL,
  Stand und Verifikationsstatus in **QUELLEN.md**. Was nicht belegbar war, ist
  dort ausdrücklich als NICHT VERIFIZIERT gekennzeichnet und im Tool ein
  freies Eingabefeld statt eines Defaults.

## Projektstruktur (Kern)

| Pfad | Inhalt |
| --- | --- |
| `src/types.ts` | Datenmodell (Audit → Prozess → Schritt → Messungen) |
| `src/lib/statistik.ts` | Median, Quartile, Ausreißer-Markierung |
| `src/lib/kennzahlen.ts` | Ist/Soll/Ersparnis/Preisband, Baseline↔Nachmessung |
| `src/lib/stundensatz.ts` | Stundensatzrechner (interner Kostensatz) |
| `src/lib/exportImport.ts` | JSON-Export/-Import mit Validierung |
| `src/lib/pdf.ts` | PDF-Definition (voller Rechenweg) + Export |
| `src/lib/quellen.ts` | Quellen-/Annahmenblock fürs PDF (aus QUELLEN.md) |
| `src/components/` | Erfassung (iPad), Kalkulation (Mac), Stoppuhr |

## Projekt-Dokumente

- **QUELLEN.md** — jede verwendete Zahl mit Quelle und Verifikationsstatus
- **ENTSCHEIDUNGEN.md** — getroffene Entscheidungen mit Begründung
- **OPEN.md** — offene Annahmen und bekannte Einschränkungen
- **STATUS.md** — aktueller Arbeitsstand
- **RUNME.sh** — reproduzierbarer Einstieg (Install → Tests → Build)

## Bewusst nicht enthalten (v1)

Rechnungsstellung, Kundenverwaltung, Mehrbenutzer, Charts.
