import { describe, expect, it } from 'vitest'
import {
  anzeigeName,
  formatiereDatum,
  formatiereDauer,
  formatiereEuro,
  formatiereProzent,
  mehrzahl,
  NBSP,
} from './format'

describe('anzeigeName', () => {
  it('ersetzt leere Namen durch einen Platzhalter', () => {
    expect(anzeigeName('')).toBe('(ohne Namen)')
    expect(anzeigeName('   ')).toBe('(ohne Namen)')
  })

  it('lässt echte Namen unverändert und entfernt nur Leerraum an den Rändern', () => {
    expect(anzeigeName('Angebot schreiben')).toBe('Angebot schreiben')
    expect(anzeigeName('  Aufmaß  ')).toBe('Aufmaß')
  })
})

describe('mehrzahl', () => {
  it('unterscheidet Ein- und Mehrzahl', () => {
    expect(mehrzahl(1, 'Messung', 'Messungen')).toBe('1 Messung')
    expect(mehrzahl(0, 'Messung', 'Messungen')).toBe('0 Messungen')
    expect(mehrzahl(5, 'Messung', 'Messungen')).toBe('5 Messungen')
  })
})

describe('formatiereDauer', () => {
  it('zeigt kurze Dauern in Sekunden', () => {
    expect(formatiereDauer(0.7)).toBe(`42,0${NBSP}s`)
    expect(formatiereDauer(0.05)).toBe(`3,0${NBSP}s`)
  })

  it('zeigt längere Dauern in Minuten', () => {
    expect(formatiereDauer(1)).toBe(`1,0${NBSP}min`)
    expect(formatiereDauer(7.5)).toBe(`7,5${NBSP}min`)
  })

  it('null bleibt null Minuten', () => {
    expect(formatiereDauer(0)).toBe(`0,0${NBSP}min`)
  })
})

describe('Formatierung nach DIN 5008 (QUELLEN.md, Thema 8)', () => {
  it('Geldbeträge mit Punktgliederung, Dezimalkomma und nachgestelltem Zeichen', () => {
    expect(formatiereEuro(1234.56)).toBe(`1.234,56${NBSP}€`)
    expect(formatiereEuro(0)).toBe(`0,00${NBSP}€`)
  })

  it('Prozent mit geschütztem Leerzeichen', () => {
    expect(formatiereProzent(20)).toBe(`20${NBSP}%`)
  })

  it('Datum als TT.MM.JJJJ', () => {
    expect(formatiereDatum('2026-08-18')).toBe('18.08.2026')
    expect(formatiereDatum('2026-08-18T12:00:00.000Z')).toBe('18.08.2026')
  })
})
