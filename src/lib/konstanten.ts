/**
 * Forschungsabhängige Konstanten. Jede Zahl hier MUSS in QUELLEN.md belegt
 * oder als unverifiziert markiert sein — sonst gehört sie nicht in den Code.
 */

/**
 * Warnschwelle: unter dieser Anzahl Messungen pro Schritt zeigt das UI eine
 * Warnung ("Messreihe zu kurz für belastbare Aussage").
 * Herleitung: QUELLEN.md, Thema 4 (REFA-Zeitaufnahme / Statistik kleiner Stichproben).
 * VORLÄUFIG bis QUELLEN.md finalisiert ist — Wert wird dort festgezogen.
 */
export const MIN_MESSUNGEN_WARNSCHWELLE = 5

/** Preisband als Anteile der konservativen Jahresersparnis (Auftrag: 10/15/20 %). */
export const PREISBAND_ANTEILE = [0.10, 0.15, 0.20] as const
