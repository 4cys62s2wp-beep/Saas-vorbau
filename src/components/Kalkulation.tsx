import { useMemo, useState } from 'react'
import type { Audit } from '../types'
import { berechneAudit, vergleicheAudits } from '../lib/kennzahlen'
import { berechneStundensatz } from '../lib/stundensatz'
import {
  formatiereEuro,
  formatiereMinuten,
  formatiereProzent,
  formatiereSekunden,
  formatiereStunden,
  formatiereZahl,
} from '../lib/format'

/**
 * Kalkulations-Ansicht (Mac): Schritttabelle, Automatisierbarkeit,
 * Restaufwand-Slider, Stundensatzrechner, Konservativ-Abschlag mit
 * Pflicht-Begründung, Ergebnisblock, Baseline-Nachmessung-Vergleich.
 */
interface KalkulationProps {
  audits: Audit[]
  aktualisiereAudit: (id: string, f: (a: Audit) => Audit) => void
  aktivesAuditId: string | null
  setAktivesAuditId: (id: string | null) => void
}

const feldKlasse = 'min-h-11 rounded-lg border-2 border-slate-400 bg-white px-3 text-base'

export function Kalkulation({
  audits,
  aktualisiereAudit,
  aktivesAuditId,
  setAktivesAuditId,
}: KalkulationProps) {
  const audit = audits.find((a) => a.id === aktivesAuditId) ?? null

  if (audits.length === 0) {
    return <p className="text-lg text-slate-600">Noch keine Audits — erst in der Erfassung messen oder JSON importieren.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border-2 border-slate-300 bg-white p-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase text-slate-500">Audit</span>
          <select
            className={feldKlasse}
            value={aktivesAuditId ?? ''}
            onChange={(e) => setAktivesAuditId(e.target.value === '' ? null : e.target.value)}
          >
            <option value="">— wählen —</option>
            {audits.map((a) => (
              <option key={a.id} value={a.id}>
                {a.betrieb} ({a.gewerk}) — {a.phase === 'baseline' ? 'Baseline' : 'Nachmessung'}, {a.datum}
              </option>
            ))}
          </select>
        </label>
      </section>

      {audit && (
        <>
          <StundensatzBereich audit={audit} aktualisiereAudit={aktualisiereAudit} />
          <SchrittTabelle audit={audit} aktualisiereAudit={aktualisiereAudit} />
          <AbschlagBereich audit={audit} aktualisiereAudit={aktualisiereAudit} />
          <ErgebnisBlock audit={audit} />
          <VergleichBereich audit={audit} audits={audits} />
        </>
      )}
    </div>
  )
}

function StundensatzBereich({
  audit,
  aktualisiereAudit,
}: {
  audit: Audit
  aktualisiereAudit: KalkulationProps['aktualisiereAudit']
}) {
  const [brutto, setBrutto] = useState('45000')
  const [lnk, setLnk] = useState('')
  const [gemein, setGemein] = useState('')
  const [stunden, setStunden] = useState('')

  const zahl = (s: string) => Number(s.replace(/\./g, '').replace(',', '.'))
  const eingaben = {
    bruttoJahreslohn: zahl(brutto),
    lohnnebenkostenProzent: zahl(lnk),
    gemeinkostenProzent: zahl(gemein),
    produktiveStundenProJahr: zahl(stunden),
  }
  const rechenbar =
    Number.isFinite(eingaben.bruttoJahreslohn) &&
    eingaben.bruttoJahreslohn >= 0 &&
    Number.isFinite(eingaben.lohnnebenkostenProzent) &&
    eingaben.lohnnebenkostenProzent >= 0 &&
    Number.isFinite(eingaben.gemeinkostenProzent) &&
    eingaben.gemeinkostenProzent >= 0 &&
    Number.isFinite(eingaben.produktiveStundenProJahr) &&
    eingaben.produktiveStundenProJahr > 0

  const ergebnis = rechenbar ? berechneStundensatz(eingaben) : null

  return (
    <section className="rounded-xl border-2 border-slate-300 bg-white p-4">
      <h3 className="text-lg font-bold text-slate-900">Interner Stundensatz</h3>
      <p className="mt-1 text-sm text-slate-600">
        Kostensatz ohne Gewinn/Wagnis — die konservative Basis für eine Ersparnis-Rechnung
        (Herleitung und Belege: QUELLEN.md, Themen 1–3). Entweder direkt eintragen oder unten
        herleiten.
      </p>
      <div className="mt-3 flex items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-slate-600">Stundensatz intern (€/h)</span>
          <input
            className={`${feldKlasse} w-40`}
            inputMode="decimal"
            value={audit.stundensatzIntern === 0 ? '' : String(audit.stundensatzIntern).replace('.', ',')}
            placeholder="z. B. 52,84"
            onChange={(e) => {
              const v = zahl(e.target.value)
              aktualisiereAudit(audit.id, (a) => ({
                ...a,
                stundensatzIntern: Number.isFinite(v) && v >= 0 ? v : 0,
              }))
            }}
          />
        </label>
        {audit.stundensatzIntern === 0 && (
          <p className="pb-2 font-semibold text-red-700">
            Pflichtfeld — ohne Stundensatz keine €-Rechnung.
          </p>
        )}
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer font-semibold text-slate-700">
          Stundensatz herleiten (Rechner)
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Bruttojahreslohn (€)</span>
            <input className={feldKlasse} inputMode="decimal" value={brutto} onChange={(e) => setBrutto(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Lohnnebenkosten (%)</span>
            <input className={feldKlasse} inputMode="decimal" value={lnk} placeholder="siehe QUELLEN.md" onChange={(e) => setLnk(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Gemeinkosten (%)</span>
            <input className={feldKlasse} inputMode="decimal" value={gemein} placeholder="aus BWA des Betriebs" onChange={(e) => setGemein(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Produktive h/Jahr</span>
            <input className={feldKlasse} inputMode="decimal" value={stunden} placeholder="siehe QUELLEN.md" onChange={(e) => setStunden(e.target.value)} />
          </label>
        </div>
        {ergebnis && (
          <div className="mt-3 rounded-lg bg-slate-50 p-3 text-base text-slate-800">
            <p>
              Personalkosten {formatiereEuro(ergebnis.personalkostenProJahr)} + Gemeinkosten{' '}
              {formatiereEuro(ergebnis.gemeinkostenProJahr)} ={' '}
              {formatiereEuro(ergebnis.gesamtkostenProJahr)} ÷ {formatiereZahl(eingaben.produktiveStundenProJahr)} h ={' '}
              <strong>{formatiereEuro(ergebnis.stundensatz)}/h</strong>
            </p>
            <button
              type="button"
              className="mt-2 min-h-11 rounded-lg bg-slate-800 px-4 font-semibold text-white active:bg-slate-900"
              onClick={() =>
                aktualisiereAudit(audit.id, (a) => ({
                  ...a,
                  stundensatzIntern: Math.round(ergebnis.stundensatz * 100) / 100,
                }))
              }
            >
              Als Stundensatz übernehmen
            </button>
          </div>
        )}
      </details>
    </section>
  )
}

function SchrittTabelle({
  audit,
  aktualisiereAudit,
}: {
  audit: Audit
  aktualisiereAudit: KalkulationProps['aktualisiereAudit']
}) {
  const kennzahlen = useMemo(() => berechneAudit(audit), [audit])

  const setzeSchritt = (
    prozessId: string,
    schrittId: string,
    f: (s: Audit['prozesse'][number]['schritte'][number]) => Audit['prozesse'][number]['schritte'][number],
  ) => {
    aktualisiereAudit(audit.id, (a) => ({
      ...a,
      prozesse: a.prozesse.map((p) =>
        p.id === prozessId
          ? { ...p, schritte: p.schritte.map((s) => (s.id === schrittId ? f(s) : s)) }
          : p,
      ),
    }))
  }

  const setzeHaeufigkeit = (prozessId: string, wert: number) => {
    aktualisiereAudit(audit.id, (a) => ({
      ...a,
      prozesse: a.prozesse.map((p) =>
        p.id === prozessId ? { ...p, haeufigkeitProMonat: wert } : p,
      ),
    }))
  }

  return (
    <section className="rounded-xl border-2 border-slate-300 bg-white p-4">
      <h3 className="text-lg font-bold text-slate-900">Schritte</h3>
      {kennzahlen.prozesse.map((pk) => {
        const prozess = audit.prozesse.find((p) => p.id === pk.prozessId)
        if (!prozess) return null
        return (
          <div key={pk.prozessId} className="mt-4">
            <div className="flex flex-wrap items-center gap-3">
              <h4 className="font-bold text-slate-800">{pk.name}</h4>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                Häufigkeit/Monat:
                <input
                  className={`${feldKlasse} w-24`}
                  inputMode="decimal"
                  value={String(prozess.haeufigkeitProMonat).replace('.', ',')}
                  onChange={(e) => {
                    const v = Number(e.target.value.replace(',', '.'))
                    setzeHaeufigkeit(pk.prozessId, Number.isFinite(v) && v >= 0 ? v : 0)
                  }}
                />
              </label>
            </div>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-slate-500">
                    <th className="py-2 pr-3 font-semibold">Schritt</th>
                    <th className="py-2 pr-3 font-semibold">n</th>
                    <th className="py-2 pr-3 font-semibold">Median</th>
                    <th className="py-2 pr-3 font-semibold">Ist min/Monat</th>
                    <th className="py-2 pr-3 font-semibold">automatisierbar</th>
                    <th className="py-2 pr-3 font-semibold">Restaufwand</th>
                    <th className="py-2 pr-3 font-semibold">Soll min/Monat</th>
                    <th className="py-2 font-semibold">Ersparnis</th>
                  </tr>
                </thead>
                <tbody>
                  {pk.schritte.map((sk) => {
                    const schritt = prozess.schritte.find((s) => s.id === sk.schrittId)
                    if (!schritt) return null
                    return (
                      <tr key={sk.schrittId} className="border-b border-slate-200 align-middle">
                        <td className="py-2 pr-3 font-semibold text-slate-900">
                          {sk.name}
                          {sk.warnungen.length > 0 && (
                            <span className="ml-1 text-amber-700" title={sk.warnungen.join('\n')}>
                              ⚠
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-3 tabular-nums">{sk.anzahlMessungen}</td>
                        <td className="py-2 pr-3 tabular-nums">
                          {sk.medianSek === null ? '—' : formatiereSekunden(sk.medianSek)}
                        </td>
                        <td className="py-2 pr-3 tabular-nums">{formatiereMinuten(sk.istMinutenProMonat)}</td>
                        <td className="py-2 pr-3">
                          <button
                            type="button"
                            onClick={() =>
                              setzeSchritt(pk.prozessId, sk.schrittId, (s) => ({
                                ...s,
                                automatisierbar: !s.automatisierbar,
                              }))
                            }
                            className={`min-h-10 rounded-lg border-2 px-3 font-semibold ${
                              schritt.automatisierbar
                                ? 'border-green-700 bg-green-700 text-white'
                                : 'border-slate-400 bg-white text-slate-600'
                            }`}
                          >
                            {schritt.automatisierbar ? 'ja' : 'nein'}
                          </button>
                        </td>
                        <td className="py-2 pr-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={5}
                              disabled={!schritt.automatisierbar}
                              value={schritt.restaufwandProzent}
                              onChange={(e) =>
                                setzeSchritt(pk.prozessId, sk.schrittId, (s) => ({
                                  ...s,
                                  restaufwandProzent: Number(e.target.value),
                                }))
                              }
                            />
                            <span className="w-14 tabular-nums">
                              {schritt.automatisierbar ? formatiereProzent(schritt.restaufwandProzent) : '—'}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 pr-3 tabular-nums">{formatiereMinuten(sk.sollMinutenProMonat)}</td>
                        <td className="py-2 font-semibold tabular-nums text-green-800">
                          {formatiereMinuten(sk.ersparnisMinutenProMonat)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
      {kennzahlen.warnungen.length > 0 && (
        <ul className="mt-4 flex flex-col gap-1 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          {kennzahlen.warnungen.map((w, i) => (
            <li key={i}>⚠ {w}</li>
          ))}
        </ul>
      )}
    </section>
  )
}

function AbschlagBereich({
  audit,
  aktualisiereAudit,
}: {
  audit: Audit
  aktualisiereAudit: KalkulationProps['aktualisiereAudit']
}) {
  return (
    <section className="rounded-xl border-2 border-slate-300 bg-white p-4">
      <h3 className="text-lg font-bold text-slate-900">Konservativ-Abschlag (Pflicht)</h3>
      <p className="mt-1 text-sm text-slate-600">
        Faktor auf die Jahresersparnis (0–1). Kein Vorgabewert — du musst ihn selbst setzen und
        begründen; die Begründung wird im PDF mitgedruckt. Belegbare Argumente: QUELLEN.md,
        Abschnitt Konservativ-Abschlag.
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-slate-600">Faktor (z. B. 0,75)</span>
          <input
            className={`${feldKlasse} w-28`}
            inputMode="decimal"
            value={String(audit.konservativFaktor).replace('.', ',')}
            onChange={(e) => {
              const v = Number(e.target.value.replace(',', '.'))
              aktualisiereAudit(audit.id, (a) => ({
                ...a,
                konservativFaktor: Number.isFinite(v) && v >= 0 && v <= 1 ? v : a.konservativFaktor,
              }))
            }}
          />
        </label>
        <label className="flex grow flex-col gap-1">
          <span className="text-sm font-semibold text-slate-600">Begründung (geht ins PDF)</span>
          <textarea
            className="min-h-14 rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-base"
            value={audit.konservativBegruendung}
            placeholder="z. B.: n=5 je Schritt (kleine Stichprobe), Einlernphase nach Umstellung, Häufigkeit saisonal geschätzt"
            onChange={(e) =>
              aktualisiereAudit(audit.id, (a) => ({ ...a, konservativBegruendung: e.target.value }))
            }
          />
        </label>
      </div>
      {audit.konservativFaktor === 1 && (
        <p className="mt-2 font-semibold text-red-700">
          Faktor steht auf 1,0 — es wird nichts abgeschlagen. Bewusst so gewollt? Sonst setzen und
          begründen.
        </p>
      )}
      {audit.konservativBegruendung.trim() === '' && (
        <p className="mt-1 font-semibold text-red-700">Begründung fehlt — Pflicht fürs PDF.</p>
      )}
    </section>
  )
}

function ErgebnisBlock({ audit }: { audit: Audit }) {
  const k = useMemo(() => berechneAudit(audit), [audit])
  const zeile = (label: string, wert: string, betont = false) => (
    <div className={`flex items-baseline justify-between gap-4 ${betont ? 'text-xl font-bold' : ''}`}>
      <span className="text-slate-600">{label}</span>
      <span className="tabular-nums text-slate-900">{wert}</span>
    </div>
  )
  return (
    <section className="rounded-xl border-2 border-slate-800 bg-white p-4">
      <h3 className="text-lg font-bold text-slate-900">Ergebnis</h3>
      <div className="mt-3 flex flex-col gap-2">
        {zeile('Ist', `${formatiereMinuten(k.istMinutenProMonat)} / Monat`)}
        {zeile('Soll (nach Automatisierung)', `${formatiereMinuten(k.sollMinutenProMonat)} / Monat`)}
        {zeile('Ersparnis', `${formatiereMinuten(k.ersparnisMinutenProMonat)} / Monat = ${formatiereStunden(k.ersparnisStundenProJahr)} / Jahr`)}
        {zeile('Ersparnis vor Abschlag', `${formatiereEuro(k.ersparnisEuroProJahrVorAbschlag)} / Jahr`)}
        {zeile(
          `× Konservativ-Faktor ${formatiereZahl(audit.konservativFaktor, 2)}`,
          `${formatiereEuro(k.ersparnisEuroProJahr)} / Jahr`,
          true,
        )}
      </div>
      <div className="mt-4 rounded-lg bg-slate-50 p-3">
        <span className="text-sm font-semibold uppercase text-slate-500">Preisband (10 / 15 / 20 %)</span>
        <div className="mt-1 flex flex-wrap gap-6 text-lg font-bold tabular-nums text-slate-900">
          <span>{formatiereEuro(k.preisband.untergrenze)}</span>
          <span>{formatiereEuro(k.preisband.mitte)}</span>
          <span>{formatiereEuro(k.preisband.obergrenze)}</span>
        </div>
      </div>
    </section>
  )
}

function VergleichBereich({ audit, audits }: { audit: Audit; audits: Audit[] }) {
  // Partner-Audit: gleicher Betrieb, andere Phase.
  const partner = audits.filter((a) => a.betrieb === audit.betrieb && a.phase !== audit.phase)
  if (partner.length === 0) return null
  const baseline = audit.phase === 'baseline' ? audit : partner[0]!
  const nachmessung = audit.phase === 'nachmessung' ? audit : partner[0]!

  let inhalt
  try {
    const v = vergleicheAudits(baseline, nachmessung)
    inhalt = (
      <div className="mt-3 flex flex-col gap-2 text-base">
        <p>
          Ist Baseline: <strong>{formatiereMinuten(v.istBaselineMinutenProMonat)}/Monat</strong> → Ist
          Nachmessung: <strong>{formatiereMinuten(v.istNachmessungMinutenProMonat)}/Monat</strong>
        </p>
        <p>
          Gemessene Ersparnis:{' '}
          <strong className={v.gemesseneErsparnisEuroProJahr >= 0 ? 'text-green-800' : 'text-red-700'}>
            {formatiereMinuten(v.gemesseneErsparnisMinutenProMonat)}/Monat ={' '}
            {formatiereEuro(v.gemesseneErsparnisEuroProJahr)}/Jahr
          </strong>{' '}
          (ohne Abschlag — sie ist gemessen)
        </p>
        <p>
          Prognose war {formatiereEuro(v.prognoseEuroProJahr)}/Jahr →{' '}
          {v.zielerreichungProzent === null ? (
            'keine Zielerreichung berechenbar (Prognose war 0)'
          ) : (
            <strong>Zielerreichung {formatiereProzent(v.zielerreichungProzent)}</strong>
          )}
        </p>
      </div>
    )
  } catch (fehler) {
    inhalt = (
      <p className="mt-3 text-red-700">
        Vergleich nicht berechenbar: {fehler instanceof Error ? fehler.message : String(fehler)}
      </p>
    )
  }

  return (
    <section className="rounded-xl border-2 border-slate-300 bg-white p-4">
      <h3 className="text-lg font-bold text-slate-900">Baseline ↔ Nachmessung ({audit.betrieb})</h3>
      {inhalt}
    </section>
  )
}
