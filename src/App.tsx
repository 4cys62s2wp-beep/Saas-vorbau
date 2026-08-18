import { useEffect, useRef, useState } from 'react'
import { AuditLeiste } from './components/AuditLeiste'
import { Erfassung } from './components/Erfassung'
import { Kalkulation } from './components/Kalkulation'
import { Hinweis, Knopf } from './components/ui'
import type { AuditExport } from './types'
import { parseImport, serialisiereExport } from './lib/exportImport'
import { formatiereDatum } from './lib/format'
import { ladeLetztenExport, merkeExport } from './lib/storage'
import { useAudits } from './state/useAudits'

type Ansicht = 'messen' | 'auswerten'

/** Nach so vielen Tagen ohne Sicherung wird daran erinnert (Begründung: QUELLEN.md, Thema 9). */
const ERINNERUNG_NACH_TAGEN = 1

const ANSICHT_SCHLUESSEL = 'prozess-audit:ansicht'

/**
 * Die zuletzt benutzte Ansicht wird gemerkt: Am Rechner wird ausgewertet, auf
 * dem iPad gemessen — nach einem Neustart soll man dort weitermachen, wo man
 * war, und nicht jedes Mal umschalten müssen.
 */
function ladeAnsicht(): Ansicht {
  try {
    return localStorage.getItem(ANSICHT_SCHLUESSEL) === 'auswerten' ? 'auswerten' : 'messen'
  } catch {
    return 'messen'
  }
}

export default function App() {
  const { geladen, audits, setAudits, aktualisiereAudit, speicherFehler } = useAudits()
  const [ansicht, setAnsichtIntern] = useState<Ansicht>(ladeAnsicht)

  const setAnsicht = (neu: Ansicht) => {
    setAnsichtIntern(neu)
    try {
      localStorage.setItem(ANSICHT_SCHLUESSEL, neu)
    } catch {
      // Ohne gemerkte Ansicht funktioniert alles weiter — kein Grund zu stören.
    }
  }
  const [aktivesAuditId, setAktivesAuditId] = useState<string | null>(null)
  const [letzterExport, setLetzterExport] = useState<string | null>(null)
  const [meldung, setMeldung] = useState<string | null>(null)
  const [importAnfrage, setImportAnfrage] = useState<
    { daten: AuditExport; ersetzt: string[] } | null
  >(null)
  const dateiInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    void ladeLetztenExport().then(setLetzterExport)
  }, [])

  // Ist nichts ausgewählt, aber etwas vorhanden: erste Messung vorbelegen,
  // damit die Ansicht nie ohne erkennbaren Grund leer bleibt.
  useEffect(() => {
    if (geladen && aktivesAuditId === null && audits.length > 0) {
      setAktivesAuditId(audits[0]!.id)
    }
  }, [geladen, aktivesAuditId, audits])

  const audit = audits.find((a) => a.id === aktivesAuditId) ?? null

  const sichern = () => {
    const jetzt = new Date().toISOString()
    const blob = new Blob([serialisiereExport(audits, jetzt)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prozess-audit-${jetzt.slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    void merkeExport(jetzt)
    setLetzterExport(jetzt)
    setMeldung('Sicherungsdatei wurde erstellt.')
  }

  const uebernehmen = (daten: AuditExport) => {
    setAudits((alt) => {
      const ids = new Set(daten.audits.map((a) => a.id))
      // Gleiche Kennung ersetzt den vorhandenen Stand, alles andere kommt hinzu.
      return [...alt.filter((a) => !ids.has(a.id)), ...daten.audits]
    })
    const ersteId = daten.audits[0]?.id
    if (ersteId) setAktivesAuditId(ersteId)
    setImportAnfrage(null)
    setMeldung(
      `${daten.audits.length} Messung${daten.audits.length === 1 ? '' : 'en'} eingelesen (Stand ${formatiereDatum(daten.exportiertAm)}).`,
    )
  }

  const einlesen = async (datei: File) => {
    try {
      const daten = parseImport(await datei.text())
      const vorhandene = new Set(audits.map((a) => a.id))
      const ersetzt = daten.audits.filter((a) => vorhandene.has(a.id))
      if (ersetzt.length > 0) {
        // Nicht wortlos überschreiben: Eine ältere Datei würde sonst die am
        // Rechner vorgenommene Bewertung zunichtemachen.
        setImportAnfrage({ daten, ersetzt: ersetzt.map((a) => a.betrieb) })
        return
      }
      uebernehmen(daten)
    } catch (fehler) {
      setMeldung(
        `Die Datei konnte nicht eingelesen werden: ${fehler instanceof Error ? fehler.message : String(fehler)}`,
      )
    }
  }

  const hatDaten = audits.some((a) => a.prozesse.length > 0)
  const erinnern =
    hatDaten &&
    (letzterExport === null ||
      Date.now() - new Date(letzterExport).getTime() > ERINNERUNG_NACH_TAGEN * 86_400_000)

  if (!geladen) {
    return <p className="p-6 text-tinte-schwach">Gespeicherte Daten werden geladen …</p>
  }

  return (
    <div className="min-h-screen pb-16">
      <header className="border-b-2 border-tinte bg-papier">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
          <h1 className="text-xl font-bold tracking-tight">Prozess-Audit</h1>

          <nav className="flex" aria-label="Ansicht">
            {(
              [
                ['messen', 'Messen'],
                ['auswerten', 'Auswerten'],
              ] as const
            ).map(([wert, text], i) => (
              <button
                key={wert}
                type="button"
                onClick={() => setAnsicht(wert)}
                className={`min-h-11 border px-5 font-semibold ${i === 0 ? '' : '-ml-px'} ${
                  ansicht === wert
                    ? 'border-tinte bg-tinte text-papier'
                    : 'border-tinte bg-papier text-tinte'
                }`}
              >
                {text}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex gap-2">
            <Knopf onClick={sichern}>Daten sichern</Knopf>
            <Knopf onClick={() => dateiInput.current?.click()}>Daten einlesen</Knopf>
            <input
              ref={dateiInput}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const datei = e.target.files?.[0]
                if (datei) void einlesen(datei)
                e.target.value = ''
              }}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4">
        {speicherFehler && (
          <div className="border-2 border-tinte bg-papier px-4 py-3">
            <p className="font-bold">Achtung: Die Daten konnten nicht gespeichert werden.</p>
            <p className="mt-1 text-sm">
              Zuletzt gemeldet: {speicherFehler}. Bitte jetzt über <strong>Daten sichern</strong>{' '}
              eine Datei ablegen — sonst gehen die Messungen beim Schließen verloren. Häufigste
              Ursache ist ein voller Gerätespeicher.
            </p>
          </div>
        )}

        {importAnfrage && (
          <div className="border-2 border-tinte bg-papier px-4 py-3">
            <p className="font-bold">
              Vorhandene Messungen werden durch den Stand aus der Datei ersetzt.
            </p>
            <p className="mt-1 text-sm">
              Die Datei (Stand {formatiereDatum(importAnfrage.daten.exportiertAm)}) enthält{' '}
              {importAnfrage.daten.audits.length} Messung
              {importAnfrage.daten.audits.length === 1 ? '' : 'en'}. Davon {importAnfrage.ersetzt.length}{' '}
              bereits vorhanden: {[...new Set(importAnfrage.ersetzt)].join(', ')}. Am Rechner
              vorgenommene Bewertungen dieser Messungen gehen dabei verloren.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Knopf art="primaer" onClick={() => uebernehmen(importAnfrage.daten)}>
                Ersetzen
              </Knopf>
              <Knopf onClick={() => setImportAnfrage(null)}>Abbrechen</Knopf>
            </div>
          </div>
        )}

        {meldung && (
          <div className="flex items-start gap-3 border border-tinte bg-papier px-4 py-3">
            <p className="flex-1">{meldung}</p>
            <button
              type="button"
              onClick={() => setMeldung(null)}
              className="min-h-11 px-2 font-semibold underline"
            >
              Schließen
            </button>
          </div>
        )}

        {erinnern && (
          <Hinweis titel="Daten sichern" wichtig>
            Die Daten liegen nur auf diesem Gerät.{' '}
            {letzterExport
              ? `Zuletzt gesichert am ${formatiereDatum(letzterExport)}.`
              : 'Bisher wurde noch nicht gesichert.'}{' '}
            Über <strong>Daten sichern</strong> eine Datei ablegen — damit werden die Messungen auch
            auf den Rechner übertragen.
          </Hinweis>
        )}

        <AuditLeiste
          audits={audits}
          aktivesAuditId={aktivesAuditId}
          setAktivesAuditId={setAktivesAuditId}
          setAudits={setAudits}
          aktualisiereAudit={aktualisiereAudit}
        />

        {ansicht === 'messen' ? (
          <Erfassung audit={audit} aktualisiereAudit={aktualisiereAudit} />
        ) : (
          <Kalkulation audit={audit} audits={audits} aktualisiereAudit={aktualisiereAudit} />
        )}
      </div>
    </div>
  )
}
