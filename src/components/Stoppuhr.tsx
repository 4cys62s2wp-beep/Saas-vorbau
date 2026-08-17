import { useEffect, useRef, useState } from 'react'

/**
 * Stoppuhr für die Vor-Ort-Messung. Jede Runde (Lap) = eine Messung.
 * „Stopp" schreibt die laufende Runde ebenfalls als Messung.
 * „Verwerfen" beendet ohne die laufende Runde zu speichern.
 * Auflösung: 0,1 s (mehr gibt die Handmessung nicht her).
 */
interface StoppuhrProps {
  onMessung: (sekunden: number) => void
}

export function formatiereStoppuhr(sekunden: number): string {
  const min = Math.floor(sekunden / 60)
  const rest = sekunden - min * 60
  const restStr = rest.toFixed(1).padStart(4, '0').replace('.', ',')
  return `${min}:${restStr}`
}

export function Stoppuhr({ onMessung }: StoppuhrProps) {
  const [laeuft, setLaeuft] = useState(false)
  const [anzeigeSek, setAnzeigeSek] = useState(0)
  const [rundenDieseSitzung, setRundenDieseSitzung] = useState(0)
  const rundenStart = useRef(0)

  useEffect(() => {
    if (!laeuft) return
    const timer = setInterval(() => {
      setAnzeigeSek((performance.now() - rundenStart.current) / 1000)
    }, 100)
    return () => clearInterval(timer)
  }, [laeuft])

  const rundeSek = () => Math.round(((performance.now() - rundenStart.current) / 1000) * 10) / 10

  const start = () => {
    rundenStart.current = performance.now()
    setAnzeigeSek(0)
    setLaeuft(true)
  }

  const runde = () => {
    onMessung(rundeSek())
    setRundenDieseSitzung((n) => n + 1)
    rundenStart.current = performance.now()
    setAnzeigeSek(0)
  }

  const stopp = () => {
    onMessung(rundeSek())
    setRundenDieseSitzung((n) => n + 1)
    setLaeuft(false)
    setAnzeigeSek(0)
  }

  const verwerfen = () => {
    setLaeuft(false)
    setAnzeigeSek(0)
  }

  return (
    <div className="rounded-xl border-2 border-slate-300 bg-white p-4">
      <div
        className="text-center font-mono text-6xl font-bold tabular-nums text-slate-900"
        aria-live="off"
      >
        {formatiereStoppuhr(anzeigeSek)}
      </div>
      <div className="mt-1 text-center text-sm text-slate-500">
        {laeuft ? `läuft — ${rundenDieseSitzung} Messung(en) in dieser Sitzung` : 'bereit'}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {!laeuft ? (
          <button
            type="button"
            onClick={start}
            className="col-span-2 min-h-20 rounded-xl bg-green-700 text-2xl font-bold text-white active:bg-green-800"
          >
            Start
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={runde}
              className="min-h-20 rounded-xl bg-blue-700 text-2xl font-bold text-white active:bg-blue-800"
            >
              Runde
            </button>
            <button
              type="button"
              onClick={stopp}
              className="min-h-20 rounded-xl bg-slate-800 text-2xl font-bold text-white active:bg-slate-900"
            >
              Stopp
            </button>
            <button
              type="button"
              onClick={verwerfen}
              className="col-span-2 min-h-14 rounded-xl border-2 border-slate-400 text-lg font-semibold text-slate-700 active:bg-slate-100"
            >
              Runde verwerfen und anhalten
            </button>
          </>
        )}
      </div>
    </div>
  )
}
