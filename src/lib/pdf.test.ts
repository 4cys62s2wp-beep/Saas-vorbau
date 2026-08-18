import { describe, expect, it } from 'vitest'
import type { Audit } from '../types'
import { NBSP } from './format'
import { erzeugeAuditPdfDefinition } from './pdf'

const audit: Audit = {
  id: 'a1',
  betrieb: 'Mustermann SHK',
  gewerk: 'SHK',
  datum: '2026-08-17',
  phase: 'baseline',
  stundensatzIntern: 60,
  konservativFaktor: 0.8,
  konservativBegruendung: 'n=5, Einlernphase',
  stundensatzHerleitung: {
    bruttoJahreslohn: 45_000,
    lohnnebenkostenProzent: 30,
    gemeinkostenProzent: 40,
    produktiveStundenProJahr: 1_550,
  },
  prozesse: [
    {
      id: 'p1',
      name: 'Angebot erstellen',
      haeufigkeitProMonat: 20,
      schritte: [
        {
          id: 's1',
          name: 'Aufmaß übertragen',
          messungenSek: [290, 300, 310, 300, 300],
          automatisierbar: true,
          restaufwandProzent: 20,
        },
        {
          id: 's2',
          name: 'Material raussuchen',
          messungenSek: [120, 120, 120, 120, 120],
          automatisierbar: false,
          restaufwandProzent: 100,
        },
      ],
    },
  ],
}

function alsText(def: unknown): string {
  return JSON.stringify(def)
}

describe('erzeugeAuditPdfDefinition — voller Rechenweg im Dokument', () => {
  const text = alsText(erzeugeAuditPdfDefinition(audit))

  it('enthält Kopf, Betrieb und Phase', () => {
    expect(text).toContain('Prozess-Audit — Ergebnis und Rechenweg')
    expect(text).toContain('Mustermann SHK')
    expect(text).toContain('Erstmessung vom 17.08.2026')
  })

  it('druckt die Rohmesswerte ab (Nachrechenbarkeit)', () => {
    expect(text).toContain('290; 300; 310; 300; 300')
    expect(text).toContain('120; 120; 120; 120; 120')
  })

  it('zeigt den kompletten Rechenweg mit Zwischenergebnissen', () => {
    // Ist 140, Soll 60, Ersparnis 80 min/Monat → 16 h/Jahr → 960 € → ×0,8 = 768 €
    // (zwischen Zahl und Einheit steht das geschützte Leerzeichen aus format.ts)
    expect(text).toContain(`140,0${NBSP}min`)
    expect(text).toContain(`60,0${NBSP}min`)
    expect(text).toContain(`80,0${NBSP}min`)
    expect(text).toContain(`16,0${NBSP}h`)
    expect(text).toContain(`960,00${NBSP}€`)
    expect(text).toContain(`768,00${NBSP}€`)
    expect(text).toContain('Sicherheitsabschlag')
    expect(text).toContain('n=5, Einlernphase')
  })

  it('zeigt die Stundensatz-Herleitung', () => {
    expect(text).toContain(`58.500,00${NBSP}€`)
    expect(text).toContain(`81.900,00${NBSP}€`)
    expect(text).toContain('1.550')
  })

  it('zeigt das Preisband 10/15/20 %', () => {
    expect(text).toContain(`76,80${NBSP}€`)
    expect(text).toContain(`115,20${NBSP}€`)
    expect(text).toContain(`153,60${NBSP}€`)
  })

  it('enthält den Quellen-/Annahmenblock (oder den Platzhalter, solange leer)', () => {
    expect(text).toContain('Quellen und Annahmen')
  })

  it('Nachmessung: Vergleich wird eingebettet', () => {
    const nachmessung: Audit = {
      ...audit,
      id: 'a2',
      phase: 'nachmessung',
      prozesse: [
        {
          ...audit.prozesse[0]!,
          schritte: audit.prozesse[0]!.schritte.map((s) => ({
            ...s,
            messungenSek: s.messungenSek.map((m) => m / 2),
          })),
        },
      ],
    }
    const mitVergleich = alsText(erzeugeAuditPdfDefinition(audit, nachmessung))
    expect(mitVergleich).toContain('Nachmessung: gemessene Wirkung')
    expect(mitVergleich).toContain('Zielerreichung')
  })

  it('fehlende Abschlags-Begründung wird sachlich ausgewiesen, nicht verschwiegen', () => {
    const ohne = alsText(erzeugeAuditPdfDefinition({ ...audit, konservativBegruendung: '  ' }))
    expect(ohne).toContain('nicht angegeben')
  })

  it('nennt den Sicherheitsabschlag als Prozentwert UND als Faktor', () => {
    // Der Kunde versteht "20 %", der Steuerberater rechnet mit dem Faktor nach.
    expect(text).toContain('Sicherheitsabschlag 20')
    expect(text).toContain('Faktor 0,80')
  })
})
