import { describe, expect, it } from 'vitest'
import { berechneStundensatz, leseStundensatzEingaben } from './stundensatz'

describe('berechneStundensatz', () => {
  it('durchgerechnetes Beispiel (Schema aus QUELLEN.md)', () => {
    // 45.000 € brutto, 30 % Lohnnebenkosten, 40 % Gemeinkosten, 1.550 produktive h
    const e = berechneStundensatz({
      bruttoJahreslohn: 45_000,
      lohnnebenkostenProzent: 30,
      gemeinkostenProzent: 40,
      produktiveStundenProJahr: 1_550,
    })
    expect(e.personalkostenProJahr).toBeCloseTo(58_500)
    expect(e.gemeinkostenProJahr).toBeCloseTo(23_400)
    expect(e.gesamtkostenProJahr).toBeCloseTo(81_900)
    expect(e.stundensatz).toBeCloseTo(52.84, 2)
  })

  it('ohne Zuschläge: reiner Lohn ÷ Stunden', () => {
    const e = berechneStundensatz({
      bruttoJahreslohn: 40_000,
      lohnnebenkostenProzent: 0,
      gemeinkostenProzent: 0,
      produktiveStundenProJahr: 1_600,
    })
    expect(e.stundensatz).toBeCloseTo(25)
  })

  it('validiert Eingaben', () => {
    const basis = {
      bruttoJahreslohn: 40_000,
      lohnnebenkostenProzent: 30,
      gemeinkostenProzent: 40,
      produktiveStundenProJahr: 1_550,
    }
    expect(() => berechneStundensatz({ ...basis, bruttoJahreslohn: -1 })).toThrow()
    expect(() => berechneStundensatz({ ...basis, lohnnebenkostenProzent: -1 })).toThrow()
    expect(() => berechneStundensatz({ ...basis, gemeinkostenProzent: -1 })).toThrow()
    expect(() => berechneStundensatz({ ...basis, produktiveStundenProJahr: 0 })).toThrow(/> 0/)
  })
})

describe('leseStundensatzEingaben', () => {
  const vollstaendig = {
    bruttoJahreslohn: 45_000,
    lohnnebenkostenProzent: 24,
    gemeinkostenProzent: 40,
    produktiveStundenProJahr: 1_455,
  }

  it('gibt vollständige Eingaben zurück', () => {
    expect(leseStundensatzEingaben(vollstaendig)).toEqual(vollstaendig)
  })

  it('rechnet nicht mit halber Grundlage', () => {
    for (const feld of Object.keys(vollstaendig) as (keyof typeof vollstaendig)[]) {
      expect(leseStundensatzEingaben({ ...vollstaendig, [feld]: null })).toBeNull()
    }
  })

  it('null produktive Stunden ergeben keine Rechnung (Division durch null)', () => {
    expect(leseStundensatzEingaben({ ...vollstaendig, produktiveStundenProJahr: 0 })).toBeNull()
  })

  it('lässt Nullwerte bei Zuschlägen zu', () => {
    const ohneZuschlaege = { ...vollstaendig, lohnnebenkostenProzent: 0, gemeinkostenProzent: 0 }
    expect(leseStundensatzEingaben(ohneZuschlaege)).toEqual(ohneZuschlaege)
  })
})
