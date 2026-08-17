/**
 * Statistik-Grundfunktionen für Messreihen (Sekundenwerte aus der Stoppuhr).
 *
 * Median statt Mittelwert: robust gegen Ausreißer (Bruchpunkt 50 % vs. 0 %),
 * Beleg siehe QUELLEN.md Thema 4. Ausreißer werden nur MARKIERT, nie
 * automatisch gestrichen — Streichen ist eine dokumentationspflichtige
 * Nutzerentscheidung (REFA-Konvention, QUELLEN.md Thema 4).
 */

export function median(werte: readonly number[]): number {
  if (werte.length === 0) {
    throw new Error('median: leere Messreihe — Median ist nicht definiert')
  }
  const s = [...werte].sort((a, b) => a - b)
  const mitte = Math.floor(s.length / 2)
  return s.length % 2 === 1 ? s[mitte]! : (s[mitte - 1]! + s[mitte]!) / 2
}

/** Wie median(), aber null statt Exception bei leerer Reihe (für UI-Anzeigen). */
export function medianOderNull(werte: readonly number[]): number | null {
  return werte.length === 0 ? null : median(werte)
}

export function mittelwert(werte: readonly number[]): number {
  if (werte.length === 0) {
    throw new Error('mittelwert: leere Messreihe')
  }
  return werte.reduce((a, b) => a + b, 0) / werte.length
}

/**
 * Quantil nach Typ 7 (lineare Interpolation; Default in R und Excel).
 * Erwartet aufsteigend sortierte Werte. p in [0, 1].
 */
export function quantilTyp7(werteSortiert: readonly number[], p: number): number {
  if (werteSortiert.length === 0) {
    throw new Error('quantilTyp7: leere Messreihe')
  }
  if (p < 0 || p > 1) {
    throw new Error(`quantilTyp7: p muss in [0,1] liegen, war ${p}`)
  }
  const n = werteSortiert.length
  const h = (n - 1) * p
  const lo = Math.floor(h)
  const hi = Math.min(lo + 1, n - 1)
  const unten = werteSortiert[lo]!
  const oben = werteSortiert[hi]!
  return unten + (h - lo) * (oben - unten)
}

/**
 * Indizes der Ausreißer nach Tukey-Zäunen: außerhalb
 * [Q1 − 1,5·IQR, Q3 + 1,5·IQR]. Bei n < 4 ist keine sinnvolle
 * Quartilsbildung möglich → keine Markierung.
 * Reihenfolge der Indizes = Original-Messreihenfolge.
 */
export function ausreisserIndizes(werte: readonly number[]): number[] {
  if (werte.length < 4) return []
  const s = [...werte].sort((a, b) => a - b)
  const q1 = quantilTyp7(s, 0.25)
  const q3 = quantilTyp7(s, 0.75)
  const iqr = q3 - q1
  const untererZaun = q1 - 1.5 * iqr
  const obererZaun = q3 + 1.5 * iqr
  const indizes: number[] = []
  werte.forEach((w, i) => {
    if (w < untererZaun || w > obererZaun) indizes.push(i)
  })
  return indizes
}
