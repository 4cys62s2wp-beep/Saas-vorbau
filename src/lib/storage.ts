import { get, set } from 'idb-keyval'
import type { Absender, Audit } from '../types'

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

const ABSENDER_KEY = 'prozess-audit:absender'

export const LEERER_ABSENDER: Absender = { name: '', strasse: '', ort: '', kontakt: '' }

export async function ladeAbsender(): Promise<Absender> {
  return (await get<Absender>(ABSENDER_KEY)) ?? LEERER_ABSENDER
}

export async function speichereAbsender(absender: Absender): Promise<void> {
  await set(ABSENDER_KEY, absender)
}

const LETZTER_EXPORT_KEY = 'prozess-audit:letzter-export'

export async function ladeLetztenExport(): Promise<string | null> {
  return (await get<string>(LETZTER_EXPORT_KEY)) ?? null
}

export async function merkeExport(zeitpunktIso: string): Promise<void> {
  await set(LETZTER_EXPORT_KEY, zeitpunktIso)
}

/**
 * Erzeugt eine Kennung für Betrieb, Prozess und Arbeitsschritt.
 *
 * Achtung: `crypto.randomUUID` steht nur in sicheren Kontexten zur Verfügung
 * (https oder localhost). Wird die Anwendung vom iPad über die lokale
 * IP-Adresse geöffnet — also über http —, fehlt die Funktion, und ohne
 * Rückfallweg ließe sich dort nichts anlegen. Deshalb die Abstufung.
 */
export function neueId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = crypto.getRandomValues(new Uint8Array(16))
    // Kennzeichnung als Zufalls-UUID (Version 4, Variante 1), wie es die Norm vorsieht.
    bytes[6] = (bytes[6]! & 0x0f) | 0x40
    bytes[8] = (bytes[8]! & 0x3f) | 0x80
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }
  // Letzter Rückfallweg: reicht für ein Werkzeug mit einem einzigen Benutzer.
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}
