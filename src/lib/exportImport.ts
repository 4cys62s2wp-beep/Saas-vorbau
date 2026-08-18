import type { Audit, AuditExport, Phase, Prozess, Schritt, StundensatzEingaben } from '../types'

/**
 * JSON-Export/-Import für den Transfer iPad → Mac.
 * Der Import validiert strukturell JEDES Feld — eine kaputte oder fremde Datei
 * darf niemals stillschweigend kaputte Audits erzeugen.
 */

export function serialisiereExport(audits: Audit[], exportiertAm: string): string {
  const daten: AuditExport = { formatVersion: 1, exportiertAm, audits }
  return JSON.stringify(daten, null, 2)
}

class ImportFehler extends Error {}

function istObjekt(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

function pflichtString(o: Record<string, unknown>, feld: string, kontext: string): string {
  const v = o[feld]
  if (typeof v !== 'string') throw new ImportFehler(`${kontext}: Feld "${feld}" fehlt oder ist kein String`)
  return v
}

function pflichtZahl(o: Record<string, unknown>, feld: string, kontext: string): number {
  const v = o[feld]
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    throw new ImportFehler(`${kontext}: Feld "${feld}" fehlt oder ist keine endliche Zahl`)
  }
  return v
}

function parseSchritt(x: unknown, kontext: string): Schritt {
  if (!istObjekt(x)) throw new ImportFehler(`${kontext}: Schritt ist kein Objekt`)
  const name = pflichtString(x, 'name', kontext)
  const messungenRoh = x['messungenSek']
  if (!Array.isArray(messungenRoh)) {
    throw new ImportFehler(`${kontext} "${name}": messungenSek fehlt oder ist kein Array`)
  }
  const messungenSek = messungenRoh.map((m, i) => {
    if (typeof m !== 'number' || !Number.isFinite(m) || m < 0) {
      throw new ImportFehler(`${kontext} "${name}": Messung ${i + 1} ist keine Zahl ≥ 0`)
    }
    return m
  })
  const restaufwandProzent = pflichtZahl(x, 'restaufwandProzent', `${kontext} "${name}"`)
  if (restaufwandProzent < 0 || restaufwandProzent > 100) {
    throw new ImportFehler(`${kontext} "${name}": restaufwandProzent außerhalb 0–100`)
  }
  if (typeof x['automatisierbar'] !== 'boolean') {
    throw new ImportFehler(`${kontext} "${name}": automatisierbar fehlt oder ist kein Boolean`)
  }
  return {
    id: pflichtString(x, 'id', kontext),
    name,
    messungenSek,
    automatisierbar: x['automatisierbar'],
    restaufwandProzent,
  }
}

function parseProzess(x: unknown, kontext: string): Prozess {
  if (!istObjekt(x)) throw new ImportFehler(`${kontext}: Prozess ist kein Objekt`)
  const name = pflichtString(x, 'name', kontext)
  const haeufigkeitProMonat = pflichtZahl(x, 'haeufigkeitProMonat', `${kontext} "${name}"`)
  if (haeufigkeitProMonat < 0) throw new ImportFehler(`${kontext} "${name}": haeufigkeitProMonat < 0`)
  const schritteRoh = x['schritte']
  if (!Array.isArray(schritteRoh)) throw new ImportFehler(`${kontext} "${name}": schritte fehlt`)
  return {
    id: pflichtString(x, 'id', kontext),
    name,
    haeufigkeitProMonat,
    schritte: schritteRoh.map((s, i) => parseSchritt(s, `Prozess "${name}", Schritt ${i + 1}`)),
  }
}

/**
 * Die Herleitung des Stundensatzes ist freiwillig — fehlt sie, ist das kein
 * Fehler. Ist sie da, muss sie vollständig sein, damit im PDF kein halber
 * Rechenweg steht.
 */
function parseHerleitung(x: unknown, kontext: string): StundensatzEingaben | undefined {
  if (x === undefined || x === null) return undefined
  if (!istObjekt(x)) throw new ImportFehler(`${kontext}: stundensatzHerleitung ist kein Objekt`)
  const felder = [
    'bruttoJahreslohn',
    'lohnnebenkostenProzent',
    'gemeinkostenProzent',
    'produktiveStundenProJahr',
  ] as const
  const werte = {} as Record<(typeof felder)[number], number>
  for (const feld of felder) {
    const wert = pflichtZahl(x, feld, `${kontext}, Stundensatz-Herleitung`)
    if (wert < 0) throw new ImportFehler(`${kontext}: ${feld} darf nicht negativ sein`)
    werte[feld] = wert
  }
  if (werte.produktiveStundenProJahr <= 0) {
    throw new ImportFehler(`${kontext}: produktiveStundenProJahr muss größer als 0 sein`)
  }
  return werte
}

function parseAudit(x: unknown, kontext: string): Audit {
  if (!istObjekt(x)) throw new ImportFehler(`${kontext}: Audit ist kein Objekt`)
  const betrieb = pflichtString(x, 'betrieb', kontext)
  const phase = pflichtString(x, 'phase', `${kontext} "${betrieb}"`)
  if (phase !== 'baseline' && phase !== 'nachmessung') {
    throw new ImportFehler(`${kontext} "${betrieb}": phase muss "baseline" oder "nachmessung" sein`)
  }
  const stundensatzIntern = pflichtZahl(x, 'stundensatzIntern', `${kontext} "${betrieb}"`)
  if (stundensatzIntern < 0) throw new ImportFehler(`${kontext} "${betrieb}": stundensatzIntern < 0`)
  const konservativFaktor = pflichtZahl(x, 'konservativFaktor', `${kontext} "${betrieb}"`)
  if (konservativFaktor < 0 || konservativFaktor > 1) {
    throw new ImportFehler(`${kontext} "${betrieb}": konservativFaktor außerhalb 0–1`)
  }
  const prozesseRoh = x['prozesse']
  if (!Array.isArray(prozesseRoh)) throw new ImportFehler(`${kontext} "${betrieb}": prozesse fehlt`)
  const herleitung = parseHerleitung(x['stundensatzHerleitung'], `${kontext} "${betrieb}"`)
  return {
    id: pflichtString(x, 'id', kontext),
    betrieb,
    gewerk: pflichtString(x, 'gewerk', `${kontext} "${betrieb}"`),
    datum: pflichtString(x, 'datum', `${kontext} "${betrieb}"`),
    phase: phase as Phase,
    stundensatzIntern,
    konservativFaktor,
    konservativBegruendung: pflichtString(x, 'konservativBegruendung', `${kontext} "${betrieb}"`),
    // Nur setzen, wenn vorhanden — das Feld ist als optional deklariert.
    ...(herleitung ? { stundensatzHerleitung: herleitung } : {}),
    prozesse: prozesseRoh.map((p, i) => parseProzess(p, `Audit "${betrieb}", Prozess ${i + 1}`)),
  }
}

/** Wirft mit verständlicher deutscher Fehlermeldung, wenn die Datei nicht passt. */
export function parseImport(json: string): AuditExport {
  let roh: unknown
  try {
    roh = JSON.parse(json)
  } catch {
    throw new ImportFehler('Die Datei ist kein gültiges JSON')
  }
  if (!istObjekt(roh)) throw new ImportFehler('Die Datei enthält kein JSON-Objekt')
  if (roh['formatVersion'] !== 1) {
    throw new ImportFehler(
      `Unbekannte formatVersion ${String(roh['formatVersion'])} — dieses Tool kennt nur Version 1`,
    )
  }
  const auditsRoh = roh['audits']
  if (!Array.isArray(auditsRoh)) throw new ImportFehler('Feld "audits" fehlt oder ist kein Array')
  return {
    formatVersion: 1,
    exportiertAm: pflichtString(roh, 'exportiertAm', 'Export'),
    audits: auditsRoh.map((a, i) => parseAudit(a, `Audit ${i + 1}`)),
  }
}
