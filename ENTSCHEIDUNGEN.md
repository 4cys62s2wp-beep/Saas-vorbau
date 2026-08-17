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

## E5: Vitest ohne globals, Tests neben den Modulen
- **Gewählt:** Explizite Imports (`import { describe, it, expect } from 'vitest'`), Tests als `*.test.ts` unter `src/lib/`.
- **Alternative:** globals: true.
- **Grund:** Keine zusätzliche tsconfig-Magie; Tests bleiben ohne Setup lesbar korrekt — wichtig, falls sie hier nicht ausgeführt werden können.
- **Revidierbar:** Trivial.
