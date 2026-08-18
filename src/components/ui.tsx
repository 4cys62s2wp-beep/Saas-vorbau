import { useEffect, useRef, useState, type ReactNode } from 'react'
import { leseZahl, schreibeZahl } from '../lib/zahlen'

/**
 * Gemeinsame Bausteine der Oberfläche.
 *
 * Ziel: ein ruhiges, gedrucktes Erscheinungsbild — Schwarz auf Weiß, klare
 * Linien, keine Farbakzente und keine Dekoration. Jede Schaltfläche ist
 * mindestens 44 px hoch, damit sie auf dem iPad sicher getroffen wird.
 */

export function Abschnitt({
  nummer,
  titel,
  hinweis,
  aktionen,
  children,
}: {
  nummer?: number
  titel: string
  hinweis?: string
  aktionen?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="border border-linie bg-papier">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-linie px-4 py-3">
        {nummer !== undefined && (
          <span className="zahl text-sm font-bold text-tinte-schwach">Schritt {nummer}</span>
        )}
        <h2 className="text-lg font-bold">{titel}</h2>
        {aktionen && <div className="ml-auto flex gap-2">{aktionen}</div>}
      </header>
      {hinweis && (
        <p className="border-b border-linie px-4 py-2 text-sm text-tinte-schwach">{hinweis}</p>
      )}
      <div className="p-4">{children}</div>
    </section>
  )
}

type KnopfArt = 'primaer' | 'sekundaer' | 'still'

const knopfKlassen: Record<KnopfArt, string> = {
  primaer: 'bg-tinte text-papier border-tinte',
  sekundaer: 'bg-papier text-tinte border-tinte',
  still: 'bg-papier text-tinte-schwach border-linie',
}

export function Knopf({
  art = 'sekundaer',
  breit = false,
  gross = false,
  aktiv = false,
  children,
  ...rest
}: {
  art?: KnopfArt
  breit?: boolean
  gross?: boolean
  aktiv?: boolean
  children: ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const basis = aktiv ? knopfKlassen.primaer : knopfKlassen[art]
  return (
    <button
      type="button"
      {...rest}
      className={[
        'border font-semibold',
        gross ? 'min-h-16 px-6 text-xl' : 'min-h-11 px-4 text-base',
        breit ? 'w-full' : '',
        basis,
        // Deaktiviert: neutrale Fläche statt abgedunkeltem Schwarz — bleibt lesbar.
        'disabled:border-linie disabled:bg-flaeche disabled:text-tinte-schwach',
        rest.className ?? '',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

export function Feld({
  label,
  hinweis,
  breite,
  ...rest
}: {
  label: string
  hinweis?: string
  breite?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`flex flex-col gap-1 ${breite ?? ''}`}>
      <span className="text-sm font-semibold">{label}</span>
      <input
        {...rest}
        className={`min-h-11 w-full border border-tinte bg-papier px-3 ${rest.className ?? ''}`}
      />
      {hinweis && <span className="text-sm text-tinte-schwach">{hinweis}</span>}
    </label>
  )
}

/**
 * Eingabefeld für Zahlen.
 *
 * Der getippte Text bleibt stehen, solange die Eingabe unfertig ist: Wer
 * „52," tippt, um danach die Nachkommastelle zu ergänzen, darf das Komma
 * nicht verlieren. Gemeldet wird nur, was sich als Zahl lesen lässt
 * (siehe `lib/zahlen.ts` — dort auch die Punkt/Komma-Regel).
 *
 * `leerWert` ist der Wert, den der übergeordnete Bereich speichert, wenn das
 * Feld geleert wird. Er wird hier mitgeführt, damit das Feld nicht sofort
 * wieder mit einer Null gefüllt wird.
 */
export function ZahlFeld({
  label,
  hinweis,
  wert,
  onWert,
  leerWert,
  breite,
  ...rest
}: {
  label: string
  hinweis?: string
  wert: number
  onWert: (wert: number | null) => void
  leerWert: number
  breite?: string
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  const [text, setText] = useState(() => (wert === leerWert ? '' : schreibeZahl(wert)))
  const gemeldet = useRef(wert)

  useEffect(() => {
    // Nur nachziehen, wenn der Wert von außen kam (anderer Datensatz,
    // „Stundensatz übernehmen“) — nicht beim eigenen Tippen.
    if (wert === gemeldet.current) return
    setText(wert === leerWert ? '' : schreibeZahl(wert))
    gemeldet.current = wert
  }, [wert, leerWert])

  const aendern = (eingabe: string) => {
    setText(eingabe)
    if (eingabe.trim() === '') {
      gemeldet.current = leerWert
      onWert(null)
      return
    }
    const gelesen = leseZahl(eingabe)
    // Unfertige Eingabe („52,“): stehen lassen, noch nichts melden.
    if (gelesen === null) return
    gemeldet.current = gelesen
    onWert(gelesen)
  }

  return (
    <label className={`flex flex-col gap-1 ${breite ?? ''}`}>
      <span className="text-sm font-semibold">{label}</span>
      <input
        inputMode="decimal"
        {...rest}
        value={text}
        onChange={(e) => aendern(e.target.value)}
        className={`zahl min-h-11 w-full border border-tinte bg-papier px-3 ${rest.className ?? ''}`}
      />
      {hinweis && <span className="text-sm text-tinte-schwach">{hinweis}</span>}
    </label>
  )
}

export function Textfeld({
  label,
  hinweis,
  ...rest
}: {
  label: string
  hinweis?: string
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-semibold">{label}</span>
      <textarea
        {...rest}
        className={`min-h-24 w-full border border-tinte bg-papier px-3 py-2 ${rest.className ?? ''}`}
      />
      {hinweis && <span className="text-sm text-tinte-schwach">{hinweis}</span>}
    </label>
  )
}

/**
 * Hinweis-/Warnblock. Unterschieden wird über die Linienstärke links,
 * nicht über Farbe: "wichtig" bekommt einen kräftigen Balken.
 */
export function Hinweis({
  titel = 'Hinweis',
  wichtig = false,
  children,
}: {
  titel?: string
  wichtig?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={`bg-flaeche px-3 py-2 text-sm ${
        wichtig ? 'border-l-4 border-tinte' : 'border-l border-linie'
      }`}
    >
      <span className="font-bold">{titel}: </span>
      <span className={wichtig ? 'font-semibold' : ''}>{children}</span>
    </div>
  )
}

/**
 * Löschen mit Rückfrage direkt an Ort und Stelle — kein Systemdialog,
 * keine versehentliche Löschung durch einen einzelnen Fehlgriff.
 */
export function LoeschKnopf({
  was,
  onLoeschen,
  klein = false,
}: {
  was: string
  onLoeschen: () => void
  klein?: boolean
}) {
  const [gefragt, setGefragt] = useState(false)

  if (!gefragt) {
    return (
      <button
        type="button"
        onClick={() => setGefragt(true)}
        className={`border border-linie font-semibold text-tinte-schwach ${
          klein ? 'min-h-11 px-3 text-sm' : 'min-h-11 px-4 text-base'
        }`}
      >
        Löschen
      </button>
    )
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2 border border-tinte px-2 py-1">
      <span className="text-sm font-semibold">{was} wirklich löschen?</span>
      <button
        type="button"
        onClick={() => {
          setGefragt(false)
          onLoeschen()
        }}
        className="min-h-11 border border-tinte bg-tinte px-3 text-sm font-bold text-papier"
      >
        Ja, löschen
      </button>
      <button
        type="button"
        onClick={() => setGefragt(false)}
        className="min-h-11 border border-tinte px-3 text-sm font-semibold"
      >
        Abbrechen
      </button>
    </span>
  )
}

/** Zeile in einer Auswahlliste — ausgewählte Zeile ist invertiert. */
export function ListenKnopf({
  aktiv,
  titel,
  zusatz,
  onClick,
}: {
  aktiv: boolean
  titel: string
  zusatz?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-14 w-full items-baseline gap-3 border px-4 py-2 text-left ${
        aktiv ? 'border-tinte bg-tinte text-papier' : 'border-linie bg-papier text-tinte'
      }`}
    >
      <span className="font-semibold">{titel}</span>
      {zusatz && (
        <span className={`zahl ml-auto text-sm ${aktiv ? 'text-papier' : 'text-tinte-schwach'}`}>
          {zusatz}
        </span>
      )}
    </button>
  )
}
