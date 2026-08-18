import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { Audit } from '../types'
import { erzeugeAuditPdfDefinition } from './pdf'

/**
 * Schutz gegen leere Kästchen im Kundendokument.
 *
 * Das PDF bettet die mitgelieferte Schrift Roboto ein. Enthält ein Text ein
 * Zeichen, das diese Schrift nicht kennt, erscheint im PDF ein leeres Rechteck —
 * im ausgedruckten Angebot besonders peinlich und beim Schreiben nicht sichtbar.
 * Dieser Test sammelt alle Zeichen aus einem vollständig gefüllten Dokument und
 * prüft sie gegen die Zeichentabelle (cmap) der Schriftdatei.
 *
 * So aufgefallen: das Pfeilzeichen „→“ ist in Roboto NICHT enthalten.
 */

function ladeSchriftzeichen(): Set<number> {
  // Die Schrift liegt in pdfmake als Base64 im virtuellen Dateisystem.
  const vfsModul = require('pdfmake/build/vfs_fonts.js') as Record<string, unknown>
  const verzeichnis = (vfsModul['vfs'] ?? vfsModul) as Record<string, string>
  const b = Buffer.from(verzeichnis['Roboto-Regular.ttf']!, 'base64')

  const tabellen = b.readUInt16BE(4)
  let cmap = 0
  for (let i = 0; i < tabellen; i++) {
    const p = 12 + i * 16
    if (b.toString('ascii', p, p + 4) === 'cmap') cmap = b.readUInt32BE(p + 8)
  }
  if (!cmap) throw new Error('Schriftdatei ohne Zeichentabelle')

  const codes = new Set<number>()
  const untertabellen = b.readUInt16BE(cmap + 2)
  for (let i = 0; i < untertabellen; i++) {
    const p = cmap + 4 + i * 8
    const off = cmap + b.readUInt32BE(p + 4)
    const format = b.readUInt16BE(off)

    if (format === 4) {
      const segX2 = b.readUInt16BE(off + 6)
      const endeBasis = off + 14
      const startBasis = endeBasis + segX2 + 2
      const deltaBasis = startBasis + segX2
      const rangeBasis = deltaBasis + segX2
      for (let s = 0; s < segX2 / 2; s++) {
        const ende = b.readUInt16BE(endeBasis + s * 2)
        const start = b.readUInt16BE(startBasis + s * 2)
        const delta = b.readInt16BE(deltaBasis + s * 2)
        const rangeOff = b.readUInt16BE(rangeBasis + s * 2)
        if (start === 0xffff) continue
        for (let c = start; c <= ende && c !== 0x10000; c++) {
          let glyph: number
          if (rangeOff === 0) {
            glyph = (c + delta) & 0xffff
          } else {
            const gi = rangeBasis + s * 2 + rangeOff + (c - start) * 2
            if (gi + 1 >= b.length) continue
            const g = b.readUInt16BE(gi)
            glyph = g === 0 ? 0 : (g + delta) & 0xffff
          }
          if (glyph !== 0) codes.add(c)
        }
      }
    }

    if (format === 12) {
      const gruppen = b.readUInt32BE(off + 12)
      for (let g = 0; g < gruppen; g++) {
        const p2 = off + 16 + g * 12
        const von = b.readUInt32BE(p2)
        const bis = b.readUInt32BE(p2 + 4)
        // Sehr große Bereiche (CJK) interessieren hier nicht und würden nur bremsen.
        if (bis - von > 5000) continue
        for (let c = von; c <= bis; c++) codes.add(c)
      }
    }
  }
  return codes
}

/** Sammelt jeden Text aus der pdfmake-Dokumentstruktur. */
function sammleTexte(knoten: unknown, hinein: string[]): void {
  if (typeof knoten === 'string') {
    hinein.push(knoten)
    return
  }
  if (Array.isArray(knoten)) {
    for (const k of knoten) sammleTexte(k, hinein)
    return
  }
  if (knoten && typeof knoten === 'object') {
    for (const [schluessel, wert] of Object.entries(knoten as Record<string, unknown>)) {
      // Stilnamen und Layoutbezeichner werden nicht gedruckt.
      if (['style', 'layout', 'font', 'pageSize', 'pageBreak', 'alignment'].includes(schluessel)) continue
      sammleTexte(wert, hinein)
    }
  }
}

const beispiel: Audit = {
  id: 'a1',
  betrieb: 'Huber Sanitär & Heizung',
  gewerk: 'Sanitär',
  datum: '2026-08-18',
  phase: 'baseline',
  stundensatzIntern: 53.69,
  konservativFaktor: 0.75,
  konservativBegruendung:
    'Kaufmännisches Vorsichtsprinzip (Rechtsgedanke § 252 Abs. 1 Nr. 4 HGB): noch nicht realisierte Vorteile werden zurückhaltend angesetzt.',
  stundensatzHerleitung: {
    bruttoJahreslohn: 45_000,
    lohnnebenkostenProzent: 24,
    gemeinkostenProzent: 40,
    produktiveStundenProJahr: 1_455,
  },
  prozesse: [
    {
      id: 'p1',
      name: 'Stundenzettel erfassen',
      haeufigkeitProMonat: 40,
      schritte: [
        {
          id: 's1',
          name: 'Zettel aus Fahrzeug sammeln — inkl. Nachfragen',
          messungenSek: [180, 200, 190, 185, 900],
          automatisierbar: true,
          restaufwandProzent: 20,
        },
      ],
    },
  ],
}

describe('Schriftabdeckung des PDF', () => {
  const vorhanden = ladeSchriftzeichen()

  it('die Schriftdatei ist lesbar und enthält die deutschen Sonderzeichen', () => {
    for (const z of ['ä', 'ö', 'ü', 'Ä', 'Ö', 'Ü', 'ß', '€', '§', '„', '“', '–', '·', '−']) {
      expect(vorhanden.has(z.codePointAt(0)!), `Zeichen ${z} fehlt in der Schrift`).toBe(true)
    }
  })

  it('kennt die bekannte Lücke: das Pfeilzeichen fehlt in Roboto', () => {
    // Absichtlich festgehalten — deshalb wird im PDF kein Pfeil verwendet.
    expect(vorhanden.has('→'.codePointAt(0)!)).toBe(false)
  })

  it('jedes Zeichen im erzeugten Dokument ist in der Schrift enthalten', () => {
    const nachmessung: Audit = {
      ...beispiel,
      id: 'a2',
      phase: 'nachmessung',
      prozesse: [
        {
          ...beispiel.prozesse[0]!,
          schritte: beispiel.prozesse[0]!.schritte.map((s) => ({ ...s, messungenSek: [60, 62, 61, 59, 60] })),
        },
      ],
    }
    const dokument = erzeugeAuditPdfDefinition(beispiel, nachmessung, {
      name: 'Max Mustermann',
      strasse: 'Beispielweg 4',
      ort: '84028 Landshut',
      kontakt: '0871 1234567 · post@beispiel.de',
    })

    const texte: string[] = []
    sammleTexte(dokument.content, texte)
    sammleTexte(dokument.info, texte)

    const fehlend = new Set<string>()
    for (const text of texte) {
      for (const zeichen of text) {
        const code = zeichen.codePointAt(0)!
        // Zeilenumbrüche und geschützte Leerzeichen sind unkritisch.
        if (code === 10 || code === 13 || code === 0xa0) continue
        if (!vorhanden.has(code)) fehlend.add(`${zeichen} (U+${code.toString(16).toUpperCase()})`)
      }
    }

    expect(
      [...fehlend],
      'Diese Zeichen würden im PDF als leeres Kästchen erscheinen',
    ).toEqual([])
  })
})
