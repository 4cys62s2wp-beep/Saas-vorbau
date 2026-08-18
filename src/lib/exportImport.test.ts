import { describe, expect, it } from 'vitest'
import type { Audit } from '../types'
import { parseImport, serialisiereExport } from './exportImport'

const beispielAudit: Audit = {
  id: 'a1',
  betrieb: 'Mustermann SHK',
  gewerk: 'SHK',
  datum: '2026-08-17',
  phase: 'baseline',
  stundensatzIntern: 58.5,
  konservativFaktor: 0.75,
  konservativBegruendung: 'n=5 je Schritt, Einlernphase nach Umstellung',
  prozesse: [
    {
      id: 'p1',
      name: 'Angebot erstellen',
      haeufigkeitProMonat: 12,
      schritte: [
        {
          id: 's1',
          name: 'Aufmaß übertragen',
          messungenSek: [180, 200, 190, 185, 210],
          automatisierbar: true,
          restaufwandProzent: 25,
        },
      ],
    },
  ],
}

describe('Export → Import Roundtrip', () => {
  it('erhält alle Daten unverändert', () => {
    const json = serialisiereExport([beispielAudit], '2026-08-17T12:00:00.000Z')
    const zurueck = parseImport(json)
    expect(zurueck.formatVersion).toBe(1)
    expect(zurueck.exportiertAm).toBe('2026-08-17T12:00:00.000Z')
    expect(zurueck.audits).toEqual([beispielAudit])
  })

  it('erhält die Herleitung des Stundensatzes — sie ist der Rechenweg im PDF', () => {
    const mitHerleitung: Audit = {
      ...beispielAudit,
      stundensatzHerleitung: {
        bruttoJahreslohn: 45_000,
        lohnnebenkostenProzent: 24,
        gemeinkostenProzent: 40,
        produktiveStundenProJahr: 1_455,
      },
    }
    const zurueck = parseImport(serialisiereExport([mitHerleitung], 'x')).audits[0]!
    expect(zurueck.stundensatzHerleitung).toEqual(mitHerleitung.stundensatzHerleitung)
    expect(zurueck).toEqual(mitHerleitung)
  })

  it('kommt ohne Herleitung aus (sie ist freiwillig)', () => {
    const zurueck = parseImport(serialisiereExport([beispielAudit], 'x')).audits[0]!
    expect(zurueck.stundensatzHerleitung).toBeUndefined()
  })

  it('weist eine unvollständige Herleitung ab, statt halbe Angaben zu übernehmen', () => {
    const kaputt = JSON.parse(serialisiereExport([beispielAudit], 'x')) as never as {
      audits: Record<string, unknown>[]
    }
    kaputt.audits[0]!['stundensatzHerleitung'] = { bruttoJahreslohn: 45_000 }
    expect(() => parseImport(JSON.stringify(kaputt))).toThrow(/lohnnebenkostenProzent/)
  })

  it('zweimaliges Einlesen derselben Datei erzeugt keine Doppel', () => {
    // Die Anwendung ersetzt Datensätze mit gleicher Kennung — hier wird geprüft,
    // dass die Kennungen dafür stabil bleiben.
    const einmal = parseImport(serialisiereExport([beispielAudit], 'x')).audits
    const zweimal = parseImport(serialisiereExport(einmal, 'x')).audits
    expect(zweimal.map((a) => a.id)).toEqual([beispielAudit.id])
  })
})

describe('parseImport weist kaputte Dateien mit klarer Meldung ab', () => {
  it('kein JSON', () => {
    expect(() => parseImport('{{{')).toThrow(/kein gültiges JSON/)
  })

  it('falsche formatVersion', () => {
    expect(() => parseImport(JSON.stringify({ formatVersion: 2, exportiertAm: 'x', audits: [] }))).toThrow(
      /formatVersion/,
    )
  })

  it('Audit ohne Pflichtfeld', () => {
    const kaputt = JSON.parse(serialisiereExport([beispielAudit], 'x')) as {
      audits: Record<string, unknown>[]
    } & Record<string, unknown>
    delete kaputt.audits[0]!['stundensatzIntern']
    expect(() => parseImport(JSON.stringify(kaputt))).toThrow(/stundensatzIntern/)
  })

  it('negative Messung wird abgewiesen', () => {
    const kaputt = JSON.parse(serialisiereExport([beispielAudit], 'x')) as never as {
      audits: { prozesse: { schritte: { messungenSek: number[] }[] }[] }[]
    }
    kaputt.audits[0]!.prozesse[0]!.schritte[0]!.messungenSek.push(-5)
    expect(() => parseImport(JSON.stringify(kaputt))).toThrow(/≥ 0/)
  })

  it('konservativFaktor außerhalb 0–1 wird abgewiesen', () => {
    const kaputt = JSON.parse(serialisiereExport([beispielAudit], 'x')) as never as {
      audits: { konservativFaktor: number }[]
    }
    kaputt.audits[0]!.konservativFaktor = 1.5
    expect(() => parseImport(JSON.stringify(kaputt))).toThrow(/0–1/)
  })

  it('ungültige phase wird abgewiesen', () => {
    const kaputt = JSON.parse(serialisiereExport([beispielAudit], 'x')) as never as {
      audits: { phase: string }[]
    }
    kaputt.audits[0]!.phase = 'zwischenmessung'
    expect(() => parseImport(JSON.stringify(kaputt))).toThrow(/baseline.*nachmessung/)
  })
})
