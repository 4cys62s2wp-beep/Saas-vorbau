import { describe, expect, it } from 'vitest'
import type { Audit, Prozess, Schritt } from '../types'
import { berechneAudit, berechneProzess, berechneSchritt, vergleicheAudits } from './kennzahlen'

function schritt(teil: Partial<Schritt>): Schritt {
  return {
    id: 's1',
    name: 'Testschritt',
    messungenSek: [60, 60, 60, 60, 60],
    automatisierbar: false,
    restaufwandProzent: 0,
    ...teil,
  }
}

function prozess(teil: Partial<Prozess>): Prozess {
  return { id: 'p1', name: 'Testprozess', haeufigkeitProMonat: 10, schritte: [], ...teil }
}

function audit(teil: Partial<Audit>): Audit {
  return {
    id: 'a1',
    betrieb: 'Testbetrieb',
    gewerk: 'SHK',
    datum: '2026-08-17',
    phase: 'baseline',
    stundensatzIntern: 60,
    konservativFaktor: 0.8,
    konservativBegruendung: 'Kleine Stichprobe, Einlernphase',
    prozesse: [],
    ...teil,
  }
}

describe('berechneSchritt', () => {
  it('Ist = median/60 × Häufigkeit; nicht automatisierbar → Soll = Ist, Ersparnis 0', () => {
    const k = berechneSchritt(schritt({ messungenSek: [90, 120, 100, 110, 95] }), 10)
    expect(k.medianSek).toBe(100)
    expect(k.istMinutenProMonat).toBeCloseTo((100 / 60) * 10)
    expect(k.sollMinutenProMonat).toBeCloseTo(k.istMinutenProMonat)
    expect(k.ersparnisMinutenProMonat).toBe(0)
  })

  it('Restaufwand 0 %: automatisierbarer Schritt spart die volle Zeit', () => {
    const k = berechneSchritt(
      schritt({ automatisierbar: true, restaufwandProzent: 0, messungenSek: [120, 120, 120, 120, 120] }),
      5,
    )
    expect(k.istMinutenProMonat).toBeCloseTo(10)
    expect(k.sollMinutenProMonat).toBe(0)
    expect(k.ersparnisMinutenProMonat).toBeCloseTo(10)
  })

  it('Restaufwand 100 %: automatisierbar, aber keinerlei Ersparnis', () => {
    const k = berechneSchritt(
      schritt({ automatisierbar: true, restaufwandProzent: 100, messungenSek: [120, 120, 120, 120, 120] }),
      5,
    )
    expect(k.sollMinutenProMonat).toBeCloseTo(k.istMinutenProMonat)
    expect(k.ersparnisMinutenProMonat).toBe(0)
  })

  it('eine einzige Messung: rechnet, aber warnt (Warnschwelle)', () => {
    const k = berechneSchritt(schritt({ messungenSek: [80] }), 10)
    expect(k.medianSek).toBe(80)
    expect(k.istMinutenProMonat).toBeCloseTo((80 / 60) * 10)
    expect(k.warnungen.some((w) => w.includes('unter der Warnschwelle'))).toBe(true)
  })

  it('leere Messreihe: 0 in Ist und Soll, Warnung, kein Fallback-Wert', () => {
    const k = berechneSchritt(schritt({ messungenSek: [], automatisierbar: true, restaufwandProzent: 20 }), 10)
    expect(k.medianSek).toBeNull()
    expect(k.istMinutenProMonat).toBe(0)
    expect(k.sollMinutenProMonat).toBe(0)
    expect(k.warnungen.some((w) => w.includes('keine Messungen'))).toBe(true)
  })

  it('Ausreißer verfälscht den Median nicht, wird aber gemeldet', () => {
    const k = berechneSchritt(schritt({ messungenSek: [110, 118, 112, 120, 672] }), 1)
    expect(k.medianSek).toBe(118)
    expect(k.ausreisserIndizes).toEqual([4])
    expect(k.warnungen.some((w) => w.includes('auffällige'))).toBe(true)
  })

  it('validiert Restaufwand und Messwerte', () => {
    expect(() => berechneSchritt(schritt({ restaufwandProzent: 101 }), 1)).toThrow(/zwischen 0 und 100/)
    expect(() => berechneSchritt(schritt({ restaufwandProzent: -1 }), 1)).toThrow(/zwischen 0 und 100/)
    expect(() => berechneSchritt(schritt({ messungenSek: [10, -5] }), 1)).toThrow(/≥ 0/)
  })
})

describe('berechneProzess', () => {
  it('summiert Schritte; Häufigkeit wirkt auf jeden Schritt', () => {
    const p = prozess({
      haeufigkeitProMonat: 20,
      schritte: [
        schritt({ id: 'a', messungenSek: [60, 60, 60, 60, 60], automatisierbar: true, restaufwandProzent: 25 }),
        schritt({ id: 'b', messungenSek: [30, 30, 30, 30, 30] }),
      ],
    })
    const k = berechneProzess(p)
    // a: 1 min × 20 = 20; b: 0,5 min × 20 = 10 → Ist 30
    expect(k.istMinutenProMonat).toBeCloseTo(30)
    // a: 20 × 0,25 = 5; b voll 10 → Soll 15
    expect(k.sollMinutenProMonat).toBeCloseTo(15)
    expect(k.ersparnisMinutenProMonat).toBeCloseTo(15)
  })

  it('warnt, wenn ein Prozess mit Schritten die Häufigkeit 0 hat', () => {
    const k = berechneProzess(
      prozess({ haeufigkeitProMonat: 0, schritte: [schritt({})] }),
    )
    expect(k.istMinutenProMonat).toBe(0)
    expect(k.warnungen.join(' ')).toContain('Häufigkeit steht auf 0')
    // Ohne Schritte gibt es nichts zu warnen.
    expect(berechneProzess(prozess({ haeufigkeitProMonat: 0 })).warnungen).toEqual([])
  })

  it('validiert die Häufigkeit', () => {
    expect(() => berechneProzess(prozess({ haeufigkeitProMonat: -1 }))).toThrow(/endlicher Wert/)
  })
})

describe('berechneAudit — durchgerechnetes Beispiel (Rechenweg wie im PDF)', () => {
  const beispiel = audit({
    stundensatzIntern: 60,
    konservativFaktor: 0.8,
    prozesse: [
      prozess({
        haeufigkeitProMonat: 20,
        schritte: [
          // Median 300 s = 5 min → Ist 100 min/Monat, automatisierbar, Rest 20 % → Soll 20
          schritt({ id: 'a', messungenSek: [290, 300, 310, 300, 300], automatisierbar: true, restaufwandProzent: 20 }),
          // Median 120 s = 2 min → Ist 40 min/Monat, nicht automatisierbar
          schritt({ id: 'b', messungenSek: [120, 120, 120, 120, 120] }),
        ],
      }),
    ],
  })

  it('Ist/Soll/Ersparnis, €-Jahresersparnis und Preisband', () => {
    const k = berechneAudit(beispiel)
    expect(k.istMinutenProMonat).toBeCloseTo(140)
    expect(k.sollMinutenProMonat).toBeCloseTo(60)
    expect(k.ersparnisMinutenProMonat).toBeCloseTo(80)
    // 80 min/Monat ÷ 60 × 12 = 16 h/Jahr
    expect(k.ersparnisStundenProJahr).toBeCloseTo(16)
    // 16 h × 60 € = 960 € vor Abschlag; × 0,8 = 768 €
    expect(k.ersparnisEuroProJahrVorAbschlag).toBeCloseTo(960)
    expect(k.ersparnisEuroProJahr).toBeCloseTo(768)
    expect(k.preisband.untergrenze).toBeCloseTo(76.8)
    expect(k.preisband.mitte).toBeCloseTo(115.2)
    expect(k.preisband.obergrenze).toBeCloseTo(153.6)
  })

  it('Ersparnis 0, wenn nichts automatisierbar ist — mit klarer Warnung', () => {
    const k = berechneAudit(
      audit({ prozesse: [prozess({ schritte: [schritt({})] })] }),
    )
    expect(k.ersparnisEuroProJahr).toBe(0)
    expect(k.preisband.obergrenze).toBe(0)
    expect(k.warnungen.some((w) => w.includes('Ersparnis ≤ 0'))).toBe(true)
  })

  it('konservativFaktor 0 ist zulässig (maximal konservativ) und führt zu Ersparnis 0', () => {
    const k = berechneAudit(
      audit({
        konservativFaktor: 0,
        prozesse: [
          prozess({ schritte: [schritt({ automatisierbar: true, restaufwandProzent: 0 })] }),
        ],
      }),
    )
    expect(k.ersparnisEuroProJahrVorAbschlag).toBeGreaterThan(0)
    expect(k.ersparnisEuroProJahr).toBe(0)
  })

  it('validiert Stundensatz und konservativFaktor', () => {
    expect(() => berechneAudit(audit({ konservativFaktor: 1.2 }))).toThrow(/zwischen 0 und 1/)
    expect(() => berechneAudit(audit({ stundensatzIntern: Number.NaN }))).toThrow(/stundensatzIntern/)
  })
})

describe('vergleicheAudits (Baseline ↔ Nachmessung)', () => {
  const baseline = audit({
    stundensatzIntern: 60,
    konservativFaktor: 0.8,
    prozesse: [
      prozess({
        haeufigkeitProMonat: 10,
        schritte: [schritt({ messungenSek: [600, 600, 600, 600, 600], automatisierbar: true, restaufwandProzent: 10 })],
      }),
    ],
  })

  it('positive gemessene Ersparnis und Zielerreichung', () => {
    const nachmessung = audit({
      phase: 'nachmessung',
      prozesse: [
        prozess({
          haeufigkeitProMonat: 10,
          schritte: [schritt({ messungenSek: [120, 120, 120, 120, 120], automatisierbar: true, restaufwandProzent: 10 })],
        }),
      ],
    })
    const v = vergleicheAudits(baseline, nachmessung)
    // Ist: 100 → 20 min/Monat, Delta 80 min/Monat = 16 h/Jahr × 60 € = 960 €
    expect(v.gemesseneErsparnisMinutenProMonat).toBeCloseTo(80)
    expect(v.gemesseneErsparnisEuroProJahr).toBeCloseTo(960)
    // Prognose war konservativ: Ersparnis 90 min/Monat × 0,8 → 864 €
    expect(v.prognoseEuroProJahr).toBeCloseTo(864)
    expect(v.zielerreichungProzent).toBeCloseTo((960 / 864) * 100)
  })

  it('negative Ersparnis (langsamer geworden) wird nicht schöngerechnet', () => {
    const nachmessung = audit({
      phase: 'nachmessung',
      prozesse: [
        prozess({
          haeufigkeitProMonat: 10,
          schritte: [schritt({ messungenSek: [900, 900, 900, 900, 900] })],
        }),
      ],
    })
    const v = vergleicheAudits(baseline, nachmessung)
    expect(v.gemesseneErsparnisMinutenProMonat).toBeCloseTo(-50)
    expect(v.gemesseneErsparnisEuroProJahr).toBeLessThan(0)
  })

  it('Zielerreichung ist null, wenn die Prognose 0 war (keine Division durch 0)', () => {
    const b = audit({ prozesse: [prozess({ schritte: [schritt({})] })] })
    const n = audit({ phase: 'nachmessung', prozesse: [prozess({ schritte: [schritt({})] })] })
    expect(vergleicheAudits(b, n).zielerreichungProzent).toBeNull()
  })
})
