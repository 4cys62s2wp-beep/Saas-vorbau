import type { Audit, Prozess, Schritt } from '../types'
import { ausreisserIndizes, medianOderNull } from './statistik'
import { MIN_MESSUNGEN_WARNSCHWELLE, PREISBAND_ANTEILE } from './konstanten'

/**
 * Abgeleitete Kennzahlen — werden IMMER frisch gerechnet, nie gespeichert.
 *
 * Formeln (Auftrag, bindend; Belege QUELLEN.md):
 *   Ist-Minuten/Monat  = Σ über alle Schritte: median(messungenSek)/60 × haeufigkeitProMonat
 *   Soll-Minuten/Monat = nicht automatisierbare Schritte voll
 *                        + automatisierbare × restaufwandProzent/100
 *   Ersparnis €/Jahr   = (Ist − Soll) Minuten/Monat ÷ 60 × stundensatzIntern × 12
 *                        × konservativFaktor
 *   Preisband          = 10/15/20 % der konservativen Jahresersparnis
 *
 * Interpretationsentscheidung (ENTSCHEIDUNGEN.md E6): Soll enthält die nicht
 * automatisierbaren Schritte in voller Höhe. Die wörtliche Lesart „Soll = nur
 * automatisierbare × Rest" würde die Zeit nicht automatisierbarer Schritte als
 * Ersparnis ausweisen — das überhöht die Ersparnis und wäre vor dem Kunden
 * nicht haltbar.
 *
 * Schritte ohne Messungen fließen mit 0 in Ist UND Soll ein und erzeugen eine
 * Warnung — niemals einen Schätz- oder Fallback-Wert (Auftrag: Prozesszeiten
 * sind ausschließlich gemessene Werte).
 */

export interface SchrittKennzahlen {
  schrittId: string
  name: string
  anzahlMessungen: number
  medianSek: number | null
  istMinutenProMonat: number
  sollMinutenProMonat: number
  ersparnisMinutenProMonat: number
  /** Indizes verdächtiger Messwerte (Tukey-Zäune); nur Markierung, keine Streichung. */
  ausreisserIndizes: number[]
  warnungen: string[]
}

export interface ProzessKennzahlen {
  prozessId: string
  name: string
  haeufigkeitProMonat: number
  /** Dauer eines einzelnen Durchlaufs — die Zahl, die im Betrieb jeder kennt. */
  istMinutenProDurchlauf: number
  sollMinutenProDurchlauf: number
  istMinutenProMonat: number
  sollMinutenProMonat: number
  ersparnisMinutenProMonat: number
  schritte: SchrittKennzahlen[]
  warnungen: string[]
}

export interface Preisband {
  /** 10 % der konservativen Jahresersparnis */
  untergrenze: number
  /** 15 % */
  mitte: number
  /** 20 % */
  obergrenze: number
}

export interface AuditKennzahlen {
  istMinutenProMonat: number
  sollMinutenProMonat: number
  ersparnisMinutenProMonat: number
  ersparnisStundenProJahr: number
  /** Jahresersparnis in € VOR Konservativ-Abschlag (für den Rechenweg im PDF). */
  ersparnisEuroProJahrVorAbschlag: number
  /** Jahresersparnis in € NACH Konservativ-Abschlag — die Zahl fürs Angebot. */
  ersparnisEuroProJahr: number
  preisband: Preisband
  prozesse: ProzessKennzahlen[]
  /** Aggregierte Warnungen aller Schritte plus Audit-weite Warnungen. */
  warnungen: string[]
}

function pruefeSchritt(s: Schritt): void {
  if (s.restaufwandProzent < 0 || s.restaufwandProzent > 100) {
    throw new Error(
      `Schritt "${s.name}": restaufwandProzent muss zwischen 0 und 100 liegen, war ${s.restaufwandProzent}`,
    )
  }
  if (s.messungenSek.some((m) => m < 0 || !Number.isFinite(m))) {
    throw new Error(`Schritt "${s.name}": Messungen müssen endliche Werte ≥ 0 sein`)
  }
}

export function berechneSchritt(
  s: Schritt,
  haeufigkeitProMonat: number,
  minMessungen: number = MIN_MESSUNGEN_WARNSCHWELLE,
): SchrittKennzahlen {
  pruefeSchritt(s)
  const warnungen: string[] = []
  const medianSek = medianOderNull(s.messungenSek)

  if (medianSek === null) {
    warnungen.push(`Schritt "${s.name}": keine Messungen — fließt mit 0 in die Rechnung ein`)
  } else if (s.messungenSek.length < minMessungen) {
    warnungen.push(
      `Schritt "${s.name}": nur ${s.messungenSek.length} Messung(en) — unter der Warnschwelle von ${minMessungen} (siehe QUELLEN.md, Messreihen)`,
    )
  }

  const ausreisser = ausreisserIndizes(s.messungenSek)
  if (ausreisser.length > 0) {
    warnungen.push(
      `Schritt "${s.name}": ${ausreisser.length} auffällige(r) Messwert(e) (Tukey-Zäune) — prüfen, ob Sondereinfluss dokumentierbar ist`,
    )
  }

  const istMinutenProMonat = medianSek === null ? 0 : (medianSek / 60) * haeufigkeitProMonat
  const sollMinutenProMonat = s.automatisierbar
    ? istMinutenProMonat * (s.restaufwandProzent / 100)
    : istMinutenProMonat

  return {
    schrittId: s.id,
    name: s.name,
    anzahlMessungen: s.messungenSek.length,
    medianSek,
    istMinutenProMonat,
    sollMinutenProMonat,
    ersparnisMinutenProMonat: istMinutenProMonat - sollMinutenProMonat,
    ausreisserIndizes: ausreisser,
    warnungen,
  }
}

export function berechneProzess(
  p: Prozess,
  minMessungen: number = MIN_MESSUNGEN_WARNSCHWELLE,
): ProzessKennzahlen {
  if (p.haeufigkeitProMonat < 0 || !Number.isFinite(p.haeufigkeitProMonat)) {
    throw new Error(`Prozess "${p.name}": haeufigkeitProMonat muss ein endlicher Wert ≥ 0 sein`)
  }
  const schritte = p.schritte.map((s) => berechneSchritt(s, p.haeufigkeitProMonat, minMessungen))
  const summe = (f: (s: SchrittKennzahlen) => number) => schritte.reduce((a, s) => a + f(s), 0)
  const ist = summe((s) => s.istMinutenProMonat)
  const soll = summe((s) => s.sollMinutenProMonat)
  const warnungen: string[] = []
  if (p.haeufigkeitProMonat === 0 && p.schritte.length > 0) {
    warnungen.push(
      `Prozess "${p.name}": Häufigkeit steht auf 0 — er fließt mit keiner Minute in die Rechnung ein.`,
    )
  }
  // Je Durchlauf: Summe der mittleren Schrittdauern, unabhängig von der Häufigkeit.
  const istProDurchlauf = schritte.reduce((a, s) => a + (s.medianSek ?? 0) / 60, 0)
  const sollProDurchlauf = schritte.reduce((a, s) => {
    const anteil = s.istMinutenProMonat === 0 ? 0 : s.sollMinutenProMonat / s.istMinutenProMonat
    return a + ((s.medianSek ?? 0) / 60) * anteil
  }, 0)

  return {
    prozessId: p.id,
    name: p.name,
    haeufigkeitProMonat: p.haeufigkeitProMonat,
    istMinutenProDurchlauf: istProDurchlauf,
    sollMinutenProDurchlauf: sollProDurchlauf,
    istMinutenProMonat: ist,
    sollMinutenProMonat: soll,
    ersparnisMinutenProMonat: ist - soll,
    schritte,
    warnungen,
  }
}

export function berechneAudit(
  audit: Audit,
  minMessungen: number = MIN_MESSUNGEN_WARNSCHWELLE,
): AuditKennzahlen {
  if (audit.stundensatzIntern < 0 || !Number.isFinite(audit.stundensatzIntern)) {
    throw new Error('Audit: stundensatzIntern muss ein endlicher Wert ≥ 0 sein')
  }
  if (audit.konservativFaktor < 0 || audit.konservativFaktor > 1) {
    throw new Error(
      `Audit: konservativFaktor muss zwischen 0 und 1 liegen, war ${audit.konservativFaktor}`,
    )
  }

  const prozesse = audit.prozesse.map((p) => berechneProzess(p, minMessungen))
  const ist = prozesse.reduce((a, p) => a + p.istMinutenProMonat, 0)
  const soll = prozesse.reduce((a, p) => a + p.sollMinutenProMonat, 0)
  const ersparnisMinutenProMonat = ist - soll
  const ersparnisStundenProJahr = (ersparnisMinutenProMonat / 60) * 12
  const vorAbschlag = ersparnisStundenProJahr * audit.stundensatzIntern
  const nachAbschlag = vorAbschlag * audit.konservativFaktor

  const warnungen = prozesse.flatMap((p) => [
    ...p.warnungen,
    ...p.schritte.flatMap((s) => s.warnungen),
  ])
  if (nachAbschlag <= 0) {
    warnungen.push(
      'Ersparnis ≤ 0 — es gibt nichts zu verkaufen. Prüfen: Sind Schritte als automatisierbar markiert? Restaufwand < 100 %?',
    )
  }

  return {
    istMinutenProMonat: ist,
    sollMinutenProMonat: soll,
    ersparnisMinutenProMonat,
    ersparnisStundenProJahr,
    ersparnisEuroProJahrVorAbschlag: vorAbschlag,
    ersparnisEuroProJahr: nachAbschlag,
    preisband: {
      untergrenze: nachAbschlag * PREISBAND_ANTEILE[0],
      mitte: nachAbschlag * PREISBAND_ANTEILE[1],
      obergrenze: nachAbschlag * PREISBAND_ANTEILE[2],
    },
    prozesse,
    warnungen,
  }
}

/** Vergleich Baseline ↔ Nachmessung (beide Kennzahlen-Sätze müssen vorliegen). */
export interface AuditVergleich {
  istBaselineMinutenProMonat: number
  istNachmessungMinutenProMonat: number
  /** Real gemessene Ersparnis (kann negativ sein, wenn es langsamer wurde). */
  gemesseneErsparnisMinutenProMonat: number
  /** Gemessene Ersparnis in €/Jahr, OHNE Konservativ-Abschlag (es ist ja gemessen). */
  gemesseneErsparnisEuroProJahr: number
  /** Die seinerzeit prognostizierte (konservative) Jahresersparnis. */
  prognoseEuroProJahr: number
  /** gemessen ÷ Prognose × 100; null, wenn Prognose 0 war. */
  zielerreichungProzent: number | null
}

export function vergleicheAudits(
  baseline: Audit,
  nachmessung: Audit,
  minMessungen: number = MIN_MESSUNGEN_WARNSCHWELLE,
): AuditVergleich {
  const kb = berechneAudit(baseline, minMessungen)
  const kn = berechneAudit(nachmessung, minMessungen)
  const deltaMinuten = kb.istMinutenProMonat - kn.istMinutenProMonat
  // Bewertung beider Zustände zum Baseline-Stundensatz, damit der Vergleich
  // eine reine Zeit-Aussage bleibt und nicht durch Satzänderungen verzerrt wird.
  const euroProJahr = (deltaMinuten / 60) * baseline.stundensatzIntern * 12
  return {
    istBaselineMinutenProMonat: kb.istMinutenProMonat,
    istNachmessungMinutenProMonat: kn.istMinutenProMonat,
    gemesseneErsparnisMinutenProMonat: deltaMinuten,
    gemesseneErsparnisEuroProJahr: euroProJahr,
    prognoseEuroProJahr: kb.ersparnisEuroProJahr,
    zielerreichungProzent:
      kb.ersparnisEuroProJahr === 0 ? null : (euroProJahr / kb.ersparnisEuroProJahr) * 100,
  }
}
