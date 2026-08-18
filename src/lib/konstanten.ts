/**
 * Forschungsabhängige Konstanten. Jede Zahl hier MUSS in QUELLEN.md belegt
 * oder als unverifiziert markiert sein — sonst gehört sie nicht in den Code.
 */

/**
 * Warnschwelle: unter dieser Anzahl Messungen pro Schritt zeigt das UI eine
 * Warnung ("Messreihe zu kurz für belastbare Aussage").
 *
 * Herleitung (QUELLEN.md Thema 4): REFA kennt KEINE fixe Mindestzyklenzahl
 * (iteratives Vertrauensbereichs-Verfahren, üblich 95 % Aussagewahrscheinlichkeit).
 * n = 5 ist eine begründete Konvention, keine Norm: ab n = 3 ist der Median
 * erstmals robust gegen einen Ausreißer, bei n = 5 liegt der t-Faktor (95 %)
 * noch bei ≈ 2,78 — kleine Reihen bleiben Orientierungswerte. Im PDF wird die
 * Schwelle deshalb als "Konvention der Arbeitsmessung" deklariert, nicht als
 * "REFA-Vorschrift".
 */
export const MIN_MESSUNGEN_WARNSCHWELLE = 5

/** Preisband als Anteile der konservativen Jahresersparnis (Auftrag: 10/15/20 %). */
export const PREISBAND_ANTEILE = [0.10, 0.15, 0.20] as const
