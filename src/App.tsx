import { useEffect, useRef, useState } from 'react'
import { Erfassung } from './components/Erfassung'
import { Kalkulation } from './components/Kalkulation'
import { parseImport, serialisiereExport } from './lib/exportImport'
import { ladeLetztenExport, merkeExport } from './lib/storage'
import { useAudits } from './state/useAudits'

type Ansicht = 'erfassung' | 'kalkulation'

export default function App() {
  const { geladen, audits, setAudits, aktualisiereAudit } = useAudits()
  const [ansicht, setAnsicht] = useState<Ansicht>('erfassung')
  const [aktivesAuditId, setAktivesAuditId] = useState<string | null>(null)
  const [letzterExport, setLetzterExport] = useState<string | null>(null)
  const dateiInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    void ladeLetztenExport().then(setLetzterExport)
  }, [])

  const exportieren = () => {
    const jetzt = new Date().toISOString()
    const json = serialisiereExport(audits, jetzt)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prozess-audit-export-${jetzt.slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    void merkeExport(jetzt)
    setLetzterExport(jetzt)
  }

  const importieren = async (datei: File) => {
    try {
      const text = await datei.text()
      const daten = parseImport(text)
      setAudits((alt) => {
        const importIds = new Set(daten.audits.map((a) => a.id))
        // Audits mit gleicher ID werden ersetzt, neue angehängt.
        return [...alt.filter((a) => !importIds.has(a.id)), ...daten.audits]
      })
      window.alert(`${daten.audits.length} Audit(s) importiert (Export vom ${daten.exportiertAm.slice(0, 10)}).`)
    } catch (fehler) {
      window.alert(`Import abgelehnt: ${fehler instanceof Error ? fehler.message : String(fehler)}`)
    }
  }

  // Export-Erinnerung: IndexedDB auf iOS ist nicht garantiert dauerhaft
  // (Belege: QUELLEN.md Thema 9) — bei ungesicherten Messungen deutlich warnen.
  const hatDaten = audits.some((a) => a.prozesse.length > 0)
  const exportAlt =
    letzterExport === null || Date.now() - new Date(letzterExport).getTime() > 24 * 60 * 60 * 1000

  if (!geladen) {
    return <p className="p-8 text-lg text-slate-500">Lade gespeicherte Audits …</p>
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      <header className="sticky top-0 z-10 border-b-2 border-slate-300 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3">
          <h1 className="mr-auto text-xl font-bold text-slate-900">Prozess-Audit</h1>
          <nav className="flex gap-2">
            {(['erfassung', 'kalkulation'] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAnsicht(a)}
                className={`min-h-12 rounded-xl border-2 px-4 text-base font-semibold ${
                  ansicht === a
                    ? 'border-slate-800 bg-slate-800 text-white'
                    : 'border-slate-400 bg-white text-slate-700 active:bg-slate-100'
                }`}
              >
                {a === 'erfassung' ? 'Erfassung' : 'Kalkulation'}
              </button>
            ))}
          </nav>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={exportieren}
              className="min-h-12 rounded-xl border-2 border-slate-400 px-4 text-base font-semibold text-slate-700 active:bg-slate-100"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => dateiInput.current?.click()}
              className="min-h-12 rounded-xl border-2 border-slate-400 px-4 text-base font-semibold text-slate-700 active:bg-slate-100"
            >
              Import
            </button>
            <input
              ref={dateiInput}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const datei = e.target.files?.[0]
                if (datei) void importieren(datei)
                e.target.value = ''
              }}
            />
          </div>
        </div>
        {hatDaten && exportAlt && (
          <p className="mx-auto mt-2 max-w-5xl rounded-lg bg-amber-100 p-2 text-sm font-semibold text-amber-900">
            Daten liegen nur auf diesem Gerät.{' '}
            {letzterExport
              ? `Letzter Export: ${letzterExport.slice(0, 10)}.`
              : 'Noch nie exportiert.'}{' '}
            iOS kann Browser-Speicher unter Umständen räumen — nach jeder Messreihe exportieren
            (Belege: QUELLEN.md, Speicher-Risiko).
          </p>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {ansicht === 'erfassung' ? (
          <Erfassung
            audits={audits}
            setAudits={setAudits}
            aktualisiereAudit={aktualisiereAudit}
            aktivesAuditId={aktivesAuditId}
            setAktivesAuditId={setAktivesAuditId}
          />
        ) : (
          <Kalkulation
            audits={audits}
            aktualisiereAudit={aktualisiereAudit}
            aktivesAuditId={aktivesAuditId}
            setAktivesAuditId={setAktivesAuditId}
          />
        )}
      </main>
    </div>
  )
}
