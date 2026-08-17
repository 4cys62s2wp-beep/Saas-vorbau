import { get, set } from 'idb-keyval'
import type { Audit } from '../types'

/**
 * Persistenz: ein einziger Key in IndexedDB (idb-keyval) mit allen Audits.
 * Einzelnutzer, kleine Datenmengen — Einfachheit schlägt hier Granularität.
 * Autosave: die Views rufen nach JEDER Aktion speichereAudits() auf.
 *
 * Zum Datenverlust-Risiko auf iOS (Eviction) siehe QUELLEN.md Thema 9 —
 * deshalb gibt es die Export-Erinnerung im UI und persistentSpeicherAnfordern().
 */

const AUDITS_KEY = 'prozess-audit:audits'

export async function ladeAudits(): Promise<Audit[]> {
  const daten = await get<Audit[]>(AUDITS_KEY)
  return daten ?? []
}

export async function speichereAudits(audits: Audit[]): Promise<void> {
  await set(AUDITS_KEY, audits)
}

/**
 * Bittet den Browser, den Speicher als persistent zu markieren (Schutz vor
 * automatischer Eviction; Safari-Verhalten siehe QUELLEN.md Thema 9).
 * Liefert den Ist-Zustand zurück; scheitert leise, wo die API fehlt.
 */
export async function persistentSpeicherAnfordern(): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined' || !navigator.storage?.persist) return false
    if (await navigator.storage.persisted()) return true
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

const LETZTER_EXPORT_KEY = 'prozess-audit:letzter-export'

export async function ladeLetztenExport(): Promise<string | null> {
  return (await get<string>(LETZTER_EXPORT_KEY)) ?? null
}

export async function merkeExport(zeitpunktIso: string): Promise<void> {
  await set(LETZTER_EXPORT_KEY, zeitpunktIso)
}

export function neueId(): string {
  // crypto.randomUUID gibt es in allen Ziel-Browsern (Safari 15.4+, Chrome 92+)
  return crypto.randomUUID()
}
