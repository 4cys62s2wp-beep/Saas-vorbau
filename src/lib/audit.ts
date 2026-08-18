import type { Audit, Prozess, Schritt } from '../types'

/**
 * Arbeiten am Audit-Datensatz, die mehr als eine Zeile brauchen —
 * bewusst als reine Funktionen, damit sie geprüft werden können.
 */

/**
 * Legt aus einer Baseline die Nachmessung an: gleiche Prozesse, gleiche
 * Arbeitsschritte, gleiche Häufigkeit, gleicher Stundensatz — aber OHNE
 * Messwerte. Nachgemessen wird neu; alte Zeiten dürfen nicht durchrutschen.
 *
 * Die Bewertung (automatisierbar, Restaufwand) wird mitgenommen, damit der
 * Vergleich dieselbe Struktur hat. Der Sicherheitsabschlag der Baseline wird
 * ebenfalls übernommen, spielt in der Nachmessung aber keine Rolle: dort wird
 * die tatsächlich gemessene Ersparnis ausgewiesen.
 */
export function erzeugeNachmessung(
  baseline: Audit,
  datum: string,
  neueId: () => string,
): Audit {
  const schrittOhneMessungen = (s: Schritt): Schritt => ({
    ...s,
    id: neueId(),
    messungenSek: [],
  })
  const prozessOhneMessungen = (p: Prozess): Prozess => ({
    ...p,
    id: neueId(),
    schritte: p.schritte.map(schrittOhneMessungen),
  })
  return {
    ...baseline,
    id: neueId(),
    datum,
    phase: 'nachmessung',
    prozesse: baseline.prozesse.map(prozessOhneMessungen),
  }
}

/**
 * Der Sicherheitsabschlag wird im Programm als Prozentzahl eingegeben
 * ("20 % Abschlag"), gespeichert wird der Faktor (0,8). Das ist dieselbe
 * Rechnung, nur verständlicher formuliert.
 */
export function faktorAusAbschlagProzent(prozent: number): number {
  if (!Number.isFinite(prozent)) throw new Error('Abschlag: keine gültige Zahl')
  const begrenzt = Math.min(100, Math.max(0, prozent))
  // Auf zwei Nachkommastellen runden, damit z. B. 12,5 % exakt 0,875 ergibt
  // und keine Fließkomma-Reste im gespeicherten Audit landen.
  return Math.round((1 - begrenzt / 100) * 10000) / 10000
}

export function abschlagProzentAusFaktor(faktor: number): number {
  return Math.round((1 - faktor) * 1000) / 10
}

/**
 * Sucht zu einer Messung die Gegenmessung desselben Betriebs (Erstmessung ↔
 * Nachmessung). Gibt es mehrere — etwa nach sechs und nach zwölf Wochen —,
 * wird die zeitlich jüngste genommen.
 */
export function findePartnerAudit(audit: Audit, alle: Audit[]): Audit | undefined {
  return alle
    .filter((a) => a.id !== audit.id && a.betrieb === audit.betrieb && a.phase !== audit.phase)
    .sort((a, b) => b.datum.localeCompare(a.datum))[0]
}

/** Prüfpunkte, die vor dem PDF-Versand erledigt sein sollten. */
export function offenePunkte(audit: Audit): string[] {
  const punkte: string[] = []
  if (audit.stundensatzIntern <= 0) {
    punkte.push('Der interne Stundensatz ist noch nicht eingetragen.')
  }
  if (audit.konservativBegruendung.trim() === '') {
    punkte.push('Die Begründung für den Sicherheitsabschlag fehlt.')
  }
  if (audit.konservativFaktor === 1) {
    punkte.push('Der Sicherheitsabschlag steht auf 0 %.')
  }
  if (audit.prozesse.length === 0) {
    punkte.push('Es ist noch kein Prozess erfasst.')
  }
  return punkte
}
