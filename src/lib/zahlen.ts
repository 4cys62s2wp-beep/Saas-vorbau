/**
 * Zahleneingaben aus der Oberfläche einlesen.
 *
 * Menschen tippen Zahlen unterschiedlich: „52,84“ (deutsch), „52.84“ (vom
 * Zahlenblock oder aus Gewohnheit), „1.234,56“ (mit Tausenderpunkt), „1 234“
 * (mit Leerzeichen). Wird das falsch gedeutet, steht am Ende ein hundertfach
 * zu hoher Stundensatz im Angebot — deshalb ist das Einlesen hier zentral
 * geregelt und geprüft.
 *
 * Regeln, in dieser Reihenfolge:
 * 1. Kommt ein Komma vor, ist es das Dezimaltrennzeichen; Punkte und
 *    Leerzeichen gelten dann als Tausendertrennung.
 * 2. Kommt nur ein Punkt vor, wird geprüft, ob er wie eine Tausendertrennung
 *    aussieht (Dreiergruppen, z. B. „1.234“ oder „12.345.678“). Wenn ja:
 *    Tausendertrennung. Wenn nein (z. B. „52.84“): Dezimaltrennzeichen.
 * 3. Alles, was danach keine endliche Zahl ergibt, gilt als keine Eingabe.
 */

const NUR_TAUSENDERPUNKTE = /^\d{1,3}(\.\d{3})+$/

/** Liefert die Zahl oder null, wenn die Eingabe leer oder unbrauchbar ist. */
export function leseZahl(eingabe: string): number | null {
  // Geschützte und normale Leerzeichen entfernen (Tausendertrennung nach DIN 5008).
  const roh = eingabe.replace(/[\s ]/g, '')
  if (roh === '') return null

  let normalisiert: string
  if (roh.includes(',')) {
    normalisiert = roh.replace(/\./g, '').replace(',', '.')
  } else if (NUR_TAUSENDERPUNKTE.test(roh)) {
    normalisiert = roh.replace(/\./g, '')
  } else {
    normalisiert = roh
  }

  // Number('') wäre 0 und Number('1e3') wäre 1000 — beides hier unerwünscht.
  if (!/^-?\d*\.?\d+$/.test(normalisiert)) return null

  const wert = Number(normalisiert)
  return Number.isFinite(wert) ? wert : null
}

/** Wie leseZahl, aber nur Werte ab null (für Häufigkeiten, Beträge, Prozente). */
export function leseZahlNichtNegativ(eingabe: string): number | null {
  const wert = leseZahl(eingabe)
  return wert === null || wert < 0 ? null : wert
}

/**
 * Zahl für die Anzeige in einem Eingabefeld: deutsches Dezimalkomma,
 * ohne Tausendertrennung (die würde beim Weitertippen stören).
 */
export function schreibeZahl(wert: number): string {
  return String(wert).replace('.', ',')
}
