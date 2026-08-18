import { useEffect, useRef, useState } from 'react'

/**
 * Stoppuhr für die Messung vor Ort.
 *
 * Jede gespeicherte Zeit ist eine Messung. Während der Messreihe läuft die Uhr
 * durch: "Messung speichern" schreibt die aktuelle Zeit weg und startet sofort
 * die nächste — so lassen sich mehrere Durchläufe hintereinander aufnehmen,
 * ohne die Uhr neu zu starten.
 *
 * Auflösung: Zehntelsekunden. Mehr gibt eine Messung per Hand nicht her.
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
  const [gespeichert, setGespeichert] = useState(0)
  const start = useRef(0)

  useEffect(() => {
    if (!laeuft) return
    const timer = setInterval(() => {
      setAnzeigeSek((performance.now() - start.current) / 1000)
    }, 100)
    return () => clearInterval(timer)
  }, [laeuft])

  const aktuelleZeit = () => Math.round(((performance.now() - start.current) / 1000) * 10) / 10

  const starten = () => {
    start.current = performance.now()
    setAnzeigeSek(0)
    setGespeichert(0)
    setLaeuft(true)
  }

  const speichernUndWeiter = () => {
    onMessung(aktuelleZeit())
    setGespeichert((n) => n + 1)
    start.current = performance.now()
    setAnzeigeSek(0)
  }

  const speichernUndAnhalten = () => {
    onMessung(aktuelleZeit())
    setGespeichert((n) => n + 1)
    setLaeuft(false)
    setAnzeigeSek(0)
  }

  const abbrechen = () => {
    setLaeuft(false)
    setAnzeigeSek(0)
  }

  return (
    <div className="border border-tinte bg-papier">
      <div className="border-b border-linie px-4 py-6 text-center">
        <div className="zahl text-7xl font-bold leading-none">{formatiereStoppuhr(anzeigeSek)}</div>
        <div className="mt-2 text-sm text-tinte-schwach">
          {laeuft
            ? gespeichert === 0
              ? 'Uhr läuft'
              : `Uhr läuft — ${gespeichert} Messung${gespeichert === 1 ? '' : 'en'} in diesem Durchgang gespeichert`
            : 'Bereit'}
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3">
        {!laeuft ? (
          <button
            type="button"
            onClick={starten}
            className="min-h-20 w-full border border-tinte bg-tinte text-2xl font-bold text-papier"
          >
            Start
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={speichernUndWeiter}
              className="min-h-20 w-full border border-tinte bg-tinte text-2xl font-bold text-papier"
            >
              Messung speichern — Uhr läuft weiter
            </button>
            <button
              type="button"
              onClick={speichernUndAnhalten}
              className="min-h-16 w-full border border-tinte bg-papier text-lg font-bold"
            >
              Messung speichern und anhalten
            </button>
            <button
              type="button"
              onClick={abbrechen}
              className="min-h-14 w-full border border-linie bg-papier text-base font-semibold text-tinte-schwach"
            >
              Abbrechen — diese Zeit nicht speichern
            </button>
          </>
        )}
      </div>
    </div>
  )
}
