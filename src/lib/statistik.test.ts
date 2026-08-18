import { describe, expect, it } from 'vitest'
import { ausreisserIndizes, median, medianOderNull, quantilTyp7 } from './statistik'

describe('median', () => {
  it('ungerade Anzahl: mittlerer Wert', () => {
    expect(median([3, 1, 2])).toBe(2)
  })

  it('gerade Anzahl: Mittel der beiden mittleren Werte', () => {
    expect(median([4, 1, 3, 2])).toBe(2.5)
  })

  it('eine einzige Messung: der Wert selbst', () => {
    expect(median([42])).toBe(42)
  })

  it('robust gegen einen extremen Ausreißer (Kernargument fürs Tool)', () => {
    const werte = [110, 118, 112, 120, 672]
    const durchschnitt = werte.reduce((a, b) => a + b, 0) / werte.length
    // Der Durchschnitt läge bei 226,4 s — eine Dauer, die so nie gemessen wurde.
    expect(durchschnitt).toBeCloseTo(226.4)
    // Der Median bleibt bei der typischen Dauer.
    expect(median(werte)).toBe(118)
  })

  it('leere Messreihe wirft einen klaren Fehler', () => {
    expect(() => median([])).toThrow(/leere Messreihe/)
  })

  it('verändert das Eingabe-Array nicht', () => {
    const werte = [3, 1, 2]
    median(werte)
    expect(werte).toEqual([3, 1, 2])
  })
})

describe('medianOderNull', () => {
  it('liefert null für leere Reihe statt Exception', () => {
    expect(medianOderNull([])).toBeNull()
    expect(medianOderNull([7])).toBe(7)
  })
})

describe('quantilTyp7', () => {
  it('interpoliert linear (R/Excel-Default)', () => {
    // n=4: Q1 bei h=0,75 → 1 + 0,75·(2−1) = 1,75
    expect(quantilTyp7([1, 2, 3, 4], 0.25)).toBeCloseTo(1.75)
    expect(quantilTyp7([1, 2, 3, 4], 0.75)).toBeCloseTo(3.25)
  })

  it('Randfälle p=0 und p=1', () => {
    expect(quantilTyp7([1, 2, 3], 0)).toBe(1)
    expect(quantilTyp7([1, 2, 3], 1)).toBe(3)
  })

  it('wirft bei leerer Reihe und ungültigem p', () => {
    expect(() => quantilTyp7([], 0.5)).toThrow()
    expect(() => quantilTyp7([1], 1.5)).toThrow()
  })
})

describe('ausreisserIndizes', () => {
  it('markiert einen klaren Ausreißer, ohne ihn zu entfernen', () => {
    const werte = [110, 118, 112, 120, 672]
    expect(ausreisserIndizes(werte)).toEqual([4])
    expect(werte).toHaveLength(5)
  })

  it('markiert nichts bei enger Messreihe', () => {
    expect(ausreisserIndizes([100, 105, 98, 102, 101])).toEqual([])
  })

  it('bei n < 4 keine Markierung (Quartile nicht sinnvoll)', () => {
    expect(ausreisserIndizes([1, 1000])).toEqual([])
    expect(ausreisserIndizes([1, 2, 1000])).toEqual([])
  })

  it('markiert auch Ausreißer nach unten', () => {
    expect(ausreisserIndizes([2, 100, 102, 98, 101, 99])).toEqual([0])
  })
})
