import { describe, expect, it } from 'vitest'
import type { Audit } from '../types'
import {
  abschlagProzentAusFaktor,
  erzeugeNachmessung,
  faktorAusAbschlagProzent,
  offenePunkte,
} from './audit'

const baseline: Audit = {
  id: 'a1',
  betrieb: 'Mustermann SHK',
  gewerk: 'SHK',
  datum: '2026-08-17',
  phase: 'baseline',
  stundensatzIntern: 58.5,
  konservativFaktor: 0.8,
  konservativBegruendung: 'Kleine Stichprobe',
  prozesse: [
    {
      id: 'p1',
      name: 'Angebot erstellen',
      haeufigkeitProMonat: 12,
      schritte: [
        {
          id: 's1',
          name: 'Aufmaß übertragen',
          messungenSek: [180, 200, 190],
          automatisierbar: true,
          restaufwandProzent: 25,
        },
        {
          id: 's2',
          name: 'Material suchen',
          messungenSek: [90, 95],
          automatisierbar: false,
          restaufwandProzent: 100,
        },
      ],
    },
  ],
}

describe('erzeugeNachmessung', () => {
  let zaehler = 0
  const neueId = () => `neu-${++zaehler}`

  it('übernimmt Struktur und Bewertung, aber KEINE Messwerte', () => {
    zaehler = 0
    const n = erzeugeNachmessung(baseline, '2026-09-28', neueId)
    expect(n.phase).toBe('nachmessung')
    expect(n.datum).toBe('2026-09-28')
    expect(n.betrieb).toBe('Mustermann SHK')
    expect(n.stundensatzIntern).toBe(58.5)
    expect(n.prozesse).toHaveLength(1)
    expect(n.prozesse[0]!.name).toBe('Angebot erstellen')
    expect(n.prozesse[0]!.haeufigkeitProMonat).toBe(12)
    expect(n.prozesse[0]!.schritte).toHaveLength(2)
    expect(n.prozesse[0]!.schritte[0]!.name).toBe('Aufmaß übertragen')
    expect(n.prozesse[0]!.schritte[0]!.automatisierbar).toBe(true)
    expect(n.prozesse[0]!.schritte[0]!.restaufwandProzent).toBe(25)
    // Kernpunkt: alle Messreihen sind leer
    for (const s of n.prozesse[0]!.schritte) {
      expect(s.messungenSek).toEqual([])
    }
  })

  it('vergibt überall neue Kennungen und lässt die Baseline unverändert', () => {
    zaehler = 0
    const n = erzeugeNachmessung(baseline, '2026-09-28', neueId)
    expect(n.id).not.toBe(baseline.id)
    expect(n.prozesse[0]!.id).not.toBe('p1')
    expect(n.prozesse[0]!.schritte[0]!.id).not.toBe('s1')
    // Baseline bleibt unberührt (keine gemeinsam genutzten Arrays)
    expect(baseline.prozesse[0]!.schritte[0]!.messungenSek).toEqual([180, 200, 190])
  })
})

describe('Sicherheitsabschlag: Prozent ↔ Faktor', () => {
  it('rechnet in beide Richtungen', () => {
    expect(faktorAusAbschlagProzent(20)).toBe(0.8)
    expect(faktorAusAbschlagProzent(0)).toBe(1)
    expect(faktorAusAbschlagProzent(100)).toBe(0)
    expect(faktorAusAbschlagProzent(12.5)).toBe(0.875)
    expect(abschlagProzentAusFaktor(0.8)).toBe(20)
    expect(abschlagProzentAusFaktor(1)).toBe(0)
    expect(abschlagProzentAusFaktor(0.875)).toBe(12.5)
  })

  it('begrenzt Eingaben auf 0–100 % statt ungültige Faktoren zu erzeugen', () => {
    expect(faktorAusAbschlagProzent(-10)).toBe(1)
    expect(faktorAusAbschlagProzent(150)).toBe(0)
  })

  it('wirft bei unbrauchbarer Eingabe', () => {
    expect(() => faktorAusAbschlagProzent(Number.NaN)).toThrow()
  })
})

describe('offenePunkte', () => {
  it('meldet nichts, wenn alles ausgefüllt ist', () => {
    expect(offenePunkte(baseline)).toEqual([])
  })

  it('meldet fehlenden Stundensatz, fehlende Begründung und Abschlag 0 %', () => {
    const punkte = offenePunkte({
      ...baseline,
      stundensatzIntern: 0,
      konservativFaktor: 1,
      konservativBegruendung: '   ',
    })
    expect(punkte).toHaveLength(3)
    expect(punkte.join(' ')).toContain('Stundensatz')
    expect(punkte.join(' ')).toContain('Begründung')
    expect(punkte.join(' ')).toContain('0')
  })

  it('meldet ein Audit ohne Prozesse', () => {
    expect(offenePunkte({ ...baseline, prozesse: [] }).join(' ')).toContain('kein Prozess')
  })
})
