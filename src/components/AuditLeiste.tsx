import { useState } from 'react'
import type { Audit } from '../types'
import { erzeugeNachmessung } from '../lib/audit'
import { neueId } from '../lib/storage'
import { formatiereDatum } from '../lib/format'
import { Feld, Knopf, LoeschKnopf } from './ui'

/**
 * Auswahl und Verwaltung des Audits — gilt für beide Ansichten, damit überall
 * derselbe Betrieb eingestellt ist und die Auswahl nur an einer Stelle bedient
 * werden muss.
 */
interface AuditLeisteProps {
  audits: Audit[]
  aktivesAuditId: string | null
  setAktivesAuditId: (id: string | null) => void
  setAudits: (f: (alt: Audit[]) => Audit[]) => void
  aktualisiereAudit: (id: string, f: (a: Audit) => Audit) => void
}

function bezeichnung(a: Audit): string {
  const phase = a.phase === 'baseline' ? 'Erstmessung' : 'Nachmessung'
  const gewerk = a.gewerk.trim() === '' ? '' : `, ${a.gewerk}`
  return `${a.betrieb}${gewerk} — ${phase} vom ${formatiereDatum(a.datum)}`
}

export function AuditLeiste({
  audits,
  aktivesAuditId,
  setAktivesAuditId,
  setAudits,
  aktualisiereAudit,
}: AuditLeisteProps) {
  const audit = audits.find((a) => a.id === aktivesAuditId) ?? null
  const [modus, setModus] = useState<'zu' | 'neu' | 'bearbeiten'>(audits.length === 0 ? 'neu' : 'zu')
  const [betrieb, setBetrieb] = useState('')
  const [gewerk, setGewerk] = useState('')

  const anlegen = () => {
    const neu: Audit = {
      id: neueId(),
      betrieb: betrieb.trim(),
      gewerk: gewerk.trim(),
      datum: new Date().toISOString().slice(0, 10),
      phase: 'baseline',
      // Bewusst leer: der Stundensatz wird in der Kalkulation eingetragen
      // oder berechnet, es gibt keinen stillschweigenden Vorgabewert.
      stundensatzIntern: 0,
      // 1 bedeutet: noch kein Abschlag festgelegt (Pflichtangabe).
      konservativFaktor: 1,
      konservativBegruendung: '',
      prozesse: [],
    }
    setAudits((alt) => [...alt, neu])
    setAktivesAuditId(neu.id)
    setBetrieb('')
    setGewerk('')
    setModus('zu')
  }

  const nachmessungAnlegen = () => {
    if (!audit) return
    const neu = erzeugeNachmessung(audit, new Date().toISOString().slice(0, 10), neueId)
    setAudits((alt) => [...alt, neu])
    setAktivesAuditId(neu.id)
  }

  const loeschen = () => {
    if (!audit) return
    const rest = audits.filter((a) => a.id !== audit.id)
    setAudits(() => rest)
    setAktivesAuditId(rest[0]?.id ?? null)
    setModus(rest.length === 0 ? 'neu' : 'zu')
  }

  return (
    <section className="border border-linie bg-papier">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <label className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-sm font-semibold">Betrieb / Messung</span>
          <select
            className="min-h-11 w-full border border-tinte bg-papier px-3"
            value={aktivesAuditId ?? ''}
            onChange={(e) => setAktivesAuditId(e.target.value === '' ? null : e.target.value)}
          >
            {audits.length === 0 && <option value="">Noch keine Messung angelegt</option>}
            {audits.length > 0 && aktivesAuditId === null && <option value="">Bitte auswählen</option>}
            {audits.map((a) => (
              <option key={a.id} value={a.id}>
                {bezeichnung(a)}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-2 self-end">
          <Knopf onClick={() => setModus(modus === 'neu' ? 'zu' : 'neu')} aktiv={modus === 'neu'}>
            Neuer Betrieb
          </Knopf>
          {audit && (
            <Knopf
              onClick={() => setModus(modus === 'bearbeiten' ? 'zu' : 'bearbeiten')}
              aktiv={modus === 'bearbeiten'}
            >
              Ändern
            </Knopf>
          )}
        </div>
      </div>

      {modus === 'neu' && (
        <div className="flex flex-wrap items-end gap-3 border-t border-linie px-4 py-3">
          <Feld
            label="Betrieb"
            placeholder="z. B. Mustermann Sanitär"
            value={betrieb}
            breite="min-w-60 flex-1"
            onChange={(e) => setBetrieb(e.target.value)}
          />
          <Feld
            label="Gewerk"
            placeholder="z. B. Sanitär, Elektro, Schreinerei"
            value={gewerk}
            breite="min-w-60 flex-1"
            onChange={(e) => setGewerk(e.target.value)}
          />
          <Knopf art="primaer" disabled={betrieb.trim() === ''} onClick={anlegen}>
            Anlegen
          </Knopf>
        </div>
      )}

      {modus === 'bearbeiten' && audit && (
        <div className="border-t border-linie px-4 py-3">
          <div className="flex flex-wrap items-end gap-3">
            <Feld
              label="Betrieb"
              value={audit.betrieb}
              breite="min-w-60 flex-1"
              onChange={(e) => aktualisiereAudit(audit.id, (a) => ({ ...a, betrieb: e.target.value }))}
            />
            <Feld
              label="Gewerk"
              value={audit.gewerk}
              breite="min-w-60 flex-1"
              onChange={(e) => aktualisiereAudit(audit.id, (a) => ({ ...a, gewerk: e.target.value }))}
            />
            <Feld
              label="Datum der Messung"
              type="date"
              value={audit.datum}
              breite="w-52"
              onChange={(e) => aktualisiereAudit(audit.id, (a) => ({ ...a, datum: e.target.value }))}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {audit.phase === 'baseline' && (
              <Knopf onClick={nachmessungAnlegen}>
                Nachmessung anlegen (gleiche Schritte, ohne Zeiten)
              </Knopf>
            )}
            <span className="ml-auto">
              <LoeschKnopf was="Diese Messung mit allen Zeiten" onLoeschen={loeschen} />
            </span>
          </div>
        </div>
      )}
    </section>
  )
}
