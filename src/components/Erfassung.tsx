import { useState } from 'react'
import type { Audit, Prozess, Schritt } from '../types'
import { neueId } from '../lib/storage'
import { ausreisserIndizes } from '../lib/statistik'
import { MIN_MESSUNGEN_WARNSCHWELLE } from '../lib/konstanten'
import { Stoppuhr, formatiereStoppuhr } from './Stoppuhr'

/**
 * Erfassungs-Ansicht (iPad, offline): Audit → Prozesse → Schritte → Messungen.
 * Große Touch-Targets, hoher Kontrast. Jede Aktion läuft über aktualisiereAudit
 * und wird damit sofort per Autosave in IndexedDB geschrieben.
 */
interface ErfassungProps {
  audits: Audit[]
  setAudits: (f: (alt: Audit[]) => Audit[]) => void
  aktualisiereAudit: (id: string, f: (a: Audit) => Audit) => void
  aktivesAuditId: string | null
  setAktivesAuditId: (id: string | null) => void
}

const eingabeKlasse =
  'min-h-14 w-full rounded-xl border-2 border-slate-400 bg-white px-4 text-lg text-slate-900'
const primaerKnopf =
  'min-h-14 rounded-xl bg-slate-800 px-6 text-lg font-bold text-white active:bg-slate-900 disabled:opacity-40'

export function Erfassung({
  audits,
  setAudits,
  aktualisiereAudit,
  aktivesAuditId,
  setAktivesAuditId,
}: ErfassungProps) {
  const aktivesAudit = audits.find((a) => a.id === aktivesAuditId) ?? null
  const [aktiverProzessId, setAktiverProzessId] = useState<string | null>(null)
  const [aktiverSchrittId, setAktiverSchrittId] = useState<string | null>(null)

  const aktiverProzess = aktivesAudit?.prozesse.find((p) => p.id === aktiverProzessId) ?? null
  const aktiverSchritt = aktiverProzess?.schritte.find((s) => s.id === aktiverSchrittId) ?? null

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <AuditWahl
        audits={audits}
        aktivesAudit={aktivesAudit}
        setAudits={setAudits}
        waehleAudit={(id) => {
          setAktivesAuditId(id)
          setAktiverProzessId(null)
          setAktiverSchrittId(null)
        }}
      />

      {aktivesAudit && (
        <ProzessListe
          audit={aktivesAudit}
          aktiverProzessId={aktiverProzessId}
          aktualisiereAudit={aktualisiereAudit}
          waehleProzess={(id) => {
            setAktiverProzessId(id)
            setAktiverSchrittId(null)
          }}
        />
      )}

      {aktivesAudit && aktiverProzess && (
        <SchrittListe
          audit={aktivesAudit}
          prozess={aktiverProzess}
          aktiverSchrittId={aktiverSchrittId}
          aktualisiereAudit={aktualisiereAudit}
          waehleSchritt={setAktiverSchrittId}
        />
      )}

      {aktivesAudit && aktiverProzess && aktiverSchritt && (
        <MessBereich
          audit={aktivesAudit}
          prozess={aktiverProzess}
          schritt={aktiverSchritt}
          aktualisiereAudit={aktualisiereAudit}
        />
      )}
    </div>
  )
}

function AuditWahl({
  audits,
  aktivesAudit,
  setAudits,
  waehleAudit,
}: {
  audits: Audit[]
  aktivesAudit: Audit | null
  setAudits: (f: (alt: Audit[]) => Audit[]) => void
  waehleAudit: (id: string) => void
}) {
  const [zeigeFormular, setZeigeFormular] = useState(audits.length === 0)
  const [betrieb, setBetrieb] = useState('')
  const [gewerk, setGewerk] = useState('')
  const [phase, setPhase] = useState<'baseline' | 'nachmessung'>('baseline')

  const anlegen = () => {
    const neu: Audit = {
      id: neueId(),
      betrieb: betrieb.trim(),
      gewerk: gewerk.trim(),
      datum: new Date().toISOString().slice(0, 10),
      phase,
      // Kein Default-Stundensatz: 0 zwingt in der Kalkulation zur bewussten Eingabe.
      stundensatzIntern: 0,
      // Kein Default-Abschlag: 1 = „noch nicht festgelegt", Pflichtfeld in der Kalkulation.
      konservativFaktor: 1,
      konservativBegruendung: '',
      prozesse: [],
    }
    setAudits((alt) => [...alt, neu])
    waehleAudit(neu.id)
    setBetrieb('')
    setGewerk('')
    setZeigeFormular(false)
  }

  return (
    <section className="rounded-xl border-2 border-slate-300 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900">
          {aktivesAudit
            ? `${aktivesAudit.betrieb} — ${aktivesAudit.phase === 'baseline' ? 'Baseline' : 'Nachmessung'} (${aktivesAudit.datum})`
            : 'Kein Audit gewählt'}
        </h2>
        <button
          type="button"
          className="min-h-12 rounded-xl border-2 border-slate-400 px-4 text-base font-semibold text-slate-700 active:bg-slate-100"
          onClick={() => setZeigeFormular((z) => !z)}
        >
          {zeigeFormular ? 'Schließen' : 'Neu / Wechseln'}
        </button>
      </div>

      {zeigeFormular && (
        <div className="mt-4 flex flex-col gap-4">
          {audits.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold uppercase text-slate-500">Vorhandene Audits</span>
              {audits.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className="min-h-14 rounded-xl border-2 border-slate-400 bg-white px-4 text-left text-lg text-slate-900 active:bg-slate-100"
                  onClick={() => waehleAudit(a.id)}
                >
                  {a.betrieb} ({a.gewerk}) — {a.phase === 'baseline' ? 'Baseline' : 'Nachmessung'},{' '}
                  {a.datum}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t-2 border-slate-200 pt-4">
            <span className="text-sm font-semibold uppercase text-slate-500">Neues Audit</span>
            <input
              className={eingabeKlasse}
              placeholder="Betrieb (z. B. Mustermann SHK)"
              value={betrieb}
              onChange={(e) => setBetrieb(e.target.value)}
            />
            <input
              className={eingabeKlasse}
              placeholder="Gewerk (z. B. SHK, Elektro, Schreinerei)"
              value={gewerk}
              onChange={(e) => setGewerk(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              {(['baseline', 'nachmessung'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPhase(p)}
                  className={`min-h-14 rounded-xl border-2 text-lg font-semibold ${
                    phase === p
                      ? 'border-slate-800 bg-slate-800 text-white'
                      : 'border-slate-400 bg-white text-slate-700'
                  }`}
                >
                  {p === 'baseline' ? 'Baseline' : 'Nachmessung'}
                </button>
              ))}
            </div>
            <button type="button" className={primaerKnopf} disabled={betrieb.trim() === ''} onClick={anlegen}>
              Audit anlegen
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

function ProzessListe({
  audit,
  aktiverProzessId,
  aktualisiereAudit,
  waehleProzess,
}: {
  audit: Audit
  aktiverProzessId: string | null
  aktualisiereAudit: (id: string, f: (a: Audit) => Audit) => void
  waehleProzess: (id: string) => void
}) {
  const [name, setName] = useState('')
  const [haeufigkeit, setHaeufigkeit] = useState('')

  const anlegen = () => {
    const h = Number(haeufigkeit.replace(',', '.'))
    const neu: Prozess = {
      id: neueId(),
      name: name.trim(),
      haeufigkeitProMonat: Number.isFinite(h) && h > 0 ? h : 0,
      schritte: [],
    }
    aktualisiereAudit(audit.id, (a) => ({ ...a, prozesse: [...a.prozesse, neu] }))
    waehleProzess(neu.id)
    setName('')
    setHaeufigkeit('')
  }

  return (
    <section className="rounded-xl border-2 border-slate-300 bg-white p-4">
      <h3 className="text-lg font-bold text-slate-900">Prozesse</h3>
      <div className="mt-3 flex flex-col gap-2">
        {audit.prozesse.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => waehleProzess(p.id)}
            className={`min-h-14 rounded-xl border-2 px-4 text-left text-lg ${
              p.id === aktiverProzessId
                ? 'border-slate-800 bg-slate-800 text-white'
                : 'border-slate-400 bg-white text-slate-900 active:bg-slate-100'
            }`}
          >
            {p.name}{' '}
            <span className={p.id === aktiverProzessId ? 'text-slate-300' : 'text-slate-500'}>
              — {p.haeufigkeitProMonat}×/Monat, {p.schritte.length} Schritt(e)
            </span>
          </button>
        ))}
        {audit.prozesse.length === 0 && (
          <p className="text-slate-500">Noch keine Prozesse — unten anlegen.</p>
        )}
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-3">
        <input
          className={eingabeKlasse}
          placeholder="Prozessname (z. B. Angebot erstellen)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className={`${eingabeKlasse} w-28`}
          placeholder="×/Monat"
          inputMode="decimal"
          value={haeufigkeit}
          onChange={(e) => setHaeufigkeit(e.target.value)}
        />
        <button type="button" className={primaerKnopf} disabled={name.trim() === ''} onClick={anlegen}>
          +
        </button>
      </div>
      {haeufigkeit !== '' && !(Number(haeufigkeit.replace(',', '.')) > 0) && (
        <p className="mt-2 text-sm font-semibold text-red-700">
          Häufigkeit pro Monat muss eine Zahl &gt; 0 sein — sonst wird der Prozess mit 0 gerechnet.
        </p>
      )}
    </section>
  )
}

function SchrittListe({
  audit,
  prozess,
  aktiverSchrittId,
  aktualisiereAudit,
  waehleSchritt,
}: {
  audit: Audit
  prozess: Prozess
  aktiverSchrittId: string | null
  aktualisiereAudit: (id: string, f: (a: Audit) => Audit) => void
  waehleSchritt: (id: string) => void
}) {
  const [name, setName] = useState('')

  const anlegen = () => {
    const neu: Schritt = {
      id: neueId(),
      name: name.trim(),
      messungenSek: [],
      // Konservative Defaults: nichts gilt als automatisierbar, bis es in der
      // Kalkulation bewusst markiert wird.
      automatisierbar: false,
      restaufwandProzent: 100,
    }
    aktualisiereAudit(audit.id, (a) => ({
      ...a,
      prozesse: a.prozesse.map((p) =>
        p.id === prozess.id ? { ...p, schritte: [...p.schritte, neu] } : p,
      ),
    }))
    waehleSchritt(neu.id)
    setName('')
  }

  return (
    <section className="rounded-xl border-2 border-slate-300 bg-white p-4">
      <h3 className="text-lg font-bold text-slate-900">Schritte in „{prozess.name}"</h3>
      <div className="mt-3 flex flex-col gap-2">
        {prozess.schritte.map((s) => {
          const zuWenig = s.messungenSek.length < MIN_MESSUNGEN_WARNSCHWELLE
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => waehleSchritt(s.id)}
              className={`min-h-14 rounded-xl border-2 px-4 text-left text-lg ${
                s.id === aktiverSchrittId
                  ? 'border-slate-800 bg-slate-800 text-white'
                  : 'border-slate-400 bg-white text-slate-900 active:bg-slate-100'
              }`}
            >
              {s.name}{' '}
              <span
                className={
                  s.id === aktiverSchrittId
                    ? 'text-slate-300'
                    : zuWenig
                      ? 'font-semibold text-amber-700'
                      : 'text-slate-500'
                }
              >
                — {s.messungenSek.length} Messung(en)
                {zuWenig ? ` (< ${MIN_MESSUNGEN_WARNSCHWELLE})` : ''}
              </span>
            </button>
          )
        })}
        {prozess.schritte.length === 0 && (
          <p className="text-slate-500">Noch keine Schritte — unten per Tap anlegen.</p>
        )}
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-3">
        <input
          className={eingabeKlasse}
          placeholder="Schrittname (z. B. Aufmaß ins Angebot übertragen)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="button" className={primaerKnopf} disabled={name.trim() === ''} onClick={anlegen}>
          +
        </button>
      </div>
    </section>
  )
}

function MessBereich({
  audit,
  prozess,
  schritt,
  aktualisiereAudit,
}: {
  audit: Audit
  prozess: Prozess
  schritt: Schritt
  aktualisiereAudit: (id: string, f: (a: Audit) => Audit) => void
}) {
  const setzeMessungen = (f: (alt: number[]) => number[]) => {
    aktualisiereAudit(audit.id, (a) => ({
      ...a,
      prozesse: a.prozesse.map((p) =>
        p.id === prozess.id
          ? {
              ...p,
              schritte: p.schritte.map((s) =>
                s.id === schritt.id ? { ...s, messungenSek: f(s.messungenSek) } : s,
              ),
            }
          : p,
      ),
    }))
  }

  const ausreisser = new Set(ausreisserIndizes(schritt.messungenSek))
  const zuWenig = schritt.messungenSek.length < MIN_MESSUNGEN_WARNSCHWELLE

  return (
    <section className="rounded-xl border-2 border-slate-800 bg-slate-50 p-4">
      <h3 className="text-lg font-bold text-slate-900">Messen: „{schritt.name}"</h3>

      <div className="mt-3">
        <Stoppuhr onMessung={(sek) => setzeMessungen((alt) => [...alt, sek])} />
      </div>

      {zuWenig && (
        <p className="mt-3 rounded-lg bg-amber-100 p-3 text-base font-semibold text-amber-900">
          Erst {schritt.messungenSek.length} von mindestens {MIN_MESSUNGEN_WARNSCHWELLE} Messungen —
          unterhalb dieser Schwelle ist die Aussage statistisch nicht belastbar (siehe QUELLEN.md,
          Messreihen).
        </p>
      )}

      <div className="mt-4">
        <span className="text-sm font-semibold uppercase text-slate-500">
          Messungen (Tap zum Löschen)
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {schritt.messungenSek.map((m, i) => (
            <button
              key={`${i}-${m}`}
              type="button"
              onClick={() => {
                if (window.confirm(`Messung ${i + 1} (${formatiereStoppuhr(m)}) löschen?`)) {
                  setzeMessungen((alt) => alt.filter((_, j) => j !== i))
                }
              }}
              className={`min-h-12 rounded-lg border-2 px-3 font-mono text-lg tabular-nums ${
                ausreisser.has(i)
                  ? 'border-red-700 bg-red-50 text-red-800'
                  : 'border-slate-400 bg-white text-slate-900'
              }`}
              title={ausreisser.has(i) ? 'Auffälliger Wert (Tukey-Zaun)' : undefined}
            >
              {formatiereStoppuhr(m)}
              {ausreisser.has(i) ? ' ⚠' : ''}
            </button>
          ))}
          {schritt.messungenSek.length === 0 && (
            <span className="text-slate-500">Noch keine Messungen.</span>
          )}
        </div>
        {ausreisser.size > 0 && (
          <p className="mt-2 text-sm text-red-800">
            ⚠ = auffälliger Wert (außerhalb der Tukey-Zäune). Nur löschen, wenn es einen
            dokumentierbaren Sondereinfluss gab (Telefonat, Unterbrechung …) — sonst stehen lassen;
            der Median bleibt davon weitgehend unberührt.
          </p>
        )}
      </div>
    </section>
  )
}
