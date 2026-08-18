import { useState } from 'react'
import type { Audit, Prozess, Schritt } from '../types'
import { neueId } from '../lib/storage'
import { ausreisserIndizes } from '../lib/statistik'
import { MIN_MESSUNGEN_WARNSCHWELLE } from '../lib/konstanten'
import { anzeigeName, formatiereSekunden, mehrzahl } from '../lib/format'
import { Stoppuhr, formatiereStoppuhr } from './Stoppuhr'
import { leseZahlNichtNegativ } from '../lib/zahlen'
import { Abschnitt, Feld, Hinweis, Knopf, ListenKnopf, LoeschKnopf, ZahlFeld } from './ui'

/**
 * Erfassung vor Ort (iPad, ohne Internet).
 *
 * Der Ablauf ist bewusst als nummerierte Folge aufgebaut: Prozess wählen,
 * Arbeitsschritt wählen, Zeit messen. Jede Änderung wird sofort gespeichert.
 */
interface ErfassungProps {
  audit: Audit | null
  aktualisiereAudit: (id: string, f: (a: Audit) => Audit) => void
}

export function Erfassung({ audit, aktualisiereAudit }: ErfassungProps) {
  const [prozessId, setProzessId] = useState<string | null>(null)
  const [schrittId, setSchrittId] = useState<string | null>(null)

  if (!audit) {
    return (
      <p className="border border-linie bg-papier p-4">
        Oben einen Betrieb auswählen oder über <strong>Neuer Betrieb</strong> anlegen.
      </p>
    )
  }

  const prozess = audit.prozesse.find((p) => p.id === prozessId) ?? null
  const schritt = prozess?.schritte.find((s) => s.id === schrittId) ?? null

  const setzeProzess = (id: string, f: (p: Prozess) => Prozess) => {
    aktualisiereAudit(audit.id, (a) => ({
      ...a,
      prozesse: a.prozesse.map((p) => (p.id === id ? f(p) : p)),
    }))
  }

  const setzeSchritt = (pId: string, sId: string, f: (s: Schritt) => Schritt) => {
    setzeProzess(pId, (p) => ({
      ...p,
      schritte: p.schritte.map((s) => (s.id === sId ? f(s) : s)),
    }))
  }

  return (
    <div className="flex flex-col gap-4">
      <ProzessAbschnitt
        audit={audit}
        prozess={prozess}
        aktualisiereAudit={aktualisiereAudit}
        setzeProzess={setzeProzess}
        waehle={(id) => {
          setProzessId(id)
          setSchrittId(null)
        }}
      />

      {prozess && (
        <SchrittAbschnitt
          prozess={prozess}
          schritt={schritt}
          setzeProzess={setzeProzess}
          setzeSchritt={setzeSchritt}
          waehle={setSchrittId}
        />
      )}

      {prozess && schritt && (
        <MessAbschnitt
          prozess={prozess}
          schritt={schritt}
          setzeSchritt={setzeSchritt}
        />
      )}
    </div>
  )
}

function ProzessAbschnitt({
  audit,
  prozess,
  aktualisiereAudit,
  setzeProzess,
  waehle,
}: {
  audit: Audit
  prozess: Prozess | null
  aktualisiereAudit: ErfassungProps['aktualisiereAudit']
  setzeProzess: (id: string, f: (p: Prozess) => Prozess) => void
  waehle: (id: string | null) => void
}) {
  const [name, setName] = useState('')
  const [haeufigkeit, setHaeufigkeit] = useState('')

  const gelesen = leseZahlNichtNegativ(haeufigkeit)
  const haeufigkeitOk = gelesen !== null && gelesen > 0

  const anlegen = () => {
    if (!haeufigkeitOk) return
    const neu: Prozess = {
      id: neueId(),
      name: name.trim(),
      haeufigkeitProMonat: gelesen,
      schritte: [],
    }
    aktualisiereAudit(audit.id, (a) => ({ ...a, prozesse: [...a.prozesse, neu] }))
    waehle(neu.id)
    setName('')
    setHaeufigkeit('')
  }

  const loeschen = (id: string) => {
    aktualisiereAudit(audit.id, (a) => ({ ...a, prozesse: a.prozesse.filter((p) => p.id !== id) }))
    waehle(null)
  }

  return (
    <Abschnitt
      nummer={1}
      titel="Prozess"
      hinweis="Ein Vorgang, der im Betrieb regelmäßig anfällt — zum Beispiel „Angebot schreiben“ oder „Stundenzettel erfassen“."
    >
      <div className="flex flex-col gap-2">
        {audit.prozesse.map((p) => (
          <ListenKnopf
            key={p.id}
            aktiv={p.id === prozess?.id}
            titel={anzeigeName(p.name)}
            zusatz={`${p.haeufigkeitProMonat.toLocaleString('de-DE')}× im Monat · ${mehrzahl(p.schritte.length, 'Arbeitsschritt', 'Arbeitsschritte')}`}
            onClick={() => waehle(p.id)}
          />
        ))}
        {audit.prozesse.length === 0 && (
          <p className="text-tinte-schwach">Noch kein Prozess erfasst.</p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-linie pt-4">
        <Feld
          label="Neuer Prozess"
          placeholder="z. B. Angebot schreiben"
          value={name}
          breite="min-w-60 flex-1"
          onChange={(e) => setName(e.target.value)}
        />
        <Feld
          label="Wie oft im Monat?"
          inputMode="decimal"
          placeholder="z. B. 12"
          value={haeufigkeit}
          breite="w-44"
          onChange={(e) => setHaeufigkeit(e.target.value)}
        />

        <Knopf art="primaer" disabled={name.trim() === '' || !haeufigkeitOk} onClick={anlegen}>
          Hinzufügen
        </Knopf>
      </div>
      {haeufigkeit.trim() !== '' && !haeufigkeitOk && (
        <p className="mt-2 text-sm font-semibold">
          Bitte eine Zahl größer als 0 eintragen — die Häufigkeit bestimmt die Hochrechnung aufs Jahr.
        </p>
      )}

      {prozess && (
        <div className="mt-4 border-t border-linie pt-4">
          <div className="flex flex-wrap items-end gap-3">
            <Feld
              label="Name ändern"
              value={prozess.name}
              breite="min-w-60 flex-1"
              onChange={(e) => setzeProzess(prozess.id, (p) => ({ ...p, name: e.target.value }))}
            />
            <ZahlFeld
              label="Wie oft im Monat?"
              wert={prozess.haeufigkeitProMonat}
              leerWert={0}
              breite="w-44"
              onWert={(v) =>
                setzeProzess(prozess.id, (p) => ({ ...p, haeufigkeitProMonat: v ?? 0 }))
              }
            />
            <LoeschKnopf was={`Prozess „${anzeigeName(prozess.name)}“`} onLoeschen={() => loeschen(prozess.id)} />
          </div>
        </div>
      )}
    </Abschnitt>
  )
}

function SchrittAbschnitt({
  prozess,
  schritt,
  setzeProzess,
  setzeSchritt,
  waehle,
}: {
  prozess: Prozess
  schritt: Schritt | null
  setzeProzess: (id: string, f: (p: Prozess) => Prozess) => void
  setzeSchritt: (pId: string, sId: string, f: (s: Schritt) => Schritt) => void
  waehle: (id: string | null) => void
}) {
  const [name, setName] = useState('')

  const anlegen = () => {
    const neu: Schritt = {
      id: neueId(),
      name: name.trim(),
      messungenSek: [],
      // Nichts gilt als automatisierbar, bis es in der Kalkulation
      // bewusst so bewertet wird.
      automatisierbar: false,
      restaufwandProzent: 100,
    }
    setzeProzess(prozess.id, (p) => ({ ...p, schritte: [...p.schritte, neu] }))
    waehle(neu.id)
    setName('')
  }

  const loeschen = (id: string) => {
    setzeProzess(prozess.id, (p) => ({ ...p, schritte: p.schritte.filter((s) => s.id !== id) }))
    waehle(null)
  }

  return (
    <Abschnitt
      nummer={2}
      titel={`Arbeitsschritte in „${anzeigeName(prozess.name)}“`}
      hinweis="Den Prozess in einzelne Handgriffe zerlegen. Je feiner, desto genauer lässt sich später sagen, welcher Teil sich automatisieren lässt."
    >
      <div className="flex flex-col gap-2">
        {prozess.schritte.map((s) => {
          const zuWenig = s.messungenSek.length < MIN_MESSUNGEN_WARNSCHWELLE
          return (
            <ListenKnopf
              key={s.id}
              aktiv={s.id === schritt?.id}
              titel={anzeigeName(s.name)}
              zusatz={
                s.messungenSek.length === 0
                  ? 'noch nicht gemessen'
                  : `${mehrzahl(s.messungenSek.length, 'Messung', 'Messungen')}${zuWenig ? ' — zu wenige' : ''}`
              }
              onClick={() => waehle(s.id)}
            />
          )
        })}
        {prozess.schritte.length === 0 && (
          <p className="text-tinte-schwach">Noch kein Arbeitsschritt erfasst.</p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-linie pt-4">
        <Feld
          label="Neuer Arbeitsschritt"
          placeholder="z. B. Aufmaß ins Angebot übertragen"
          value={name}
          breite="min-w-60 flex-1"
          onChange={(e) => setName(e.target.value)}
        />
        <Knopf art="primaer" disabled={name.trim() === ''} onClick={anlegen}>
          Hinzufügen
        </Knopf>
      </div>

      {schritt && (
        <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-linie pt-4">
          <Feld
            label="Name ändern"
            value={schritt.name}
            breite="min-w-60 flex-1"
            onChange={(e) =>
              setzeSchritt(prozess.id, schritt.id, (s) => ({ ...s, name: e.target.value }))
            }
          />
          <LoeschKnopf
            was={`Arbeitsschritt „${anzeigeName(schritt.name)}“ mit allen Zeiten`}
            onLoeschen={() => loeschen(schritt.id)}
          />
        </div>
      )}
    </Abschnitt>
  )
}

function MessAbschnitt({
  prozess,
  schritt,
  setzeSchritt,
}: {
  prozess: Prozess
  schritt: Schritt
  setzeSchritt: (pId: string, sId: string, f: (s: Schritt) => Schritt) => void
}) {
  const setzeMessungen = (f: (alt: number[]) => number[]) => {
    setzeSchritt(prozess.id, schritt.id, (s) => ({ ...s, messungenSek: f(s.messungenSek) }))
  }

  const auffaellig = new Set(ausreisserIndizes(schritt.messungenSek))
  const fehlend = MIN_MESSUNGEN_WARNSCHWELLE - schritt.messungenSek.length

  return (
    <Abschnitt
      nummer={3}
      titel={`Zeit messen: „${anzeigeName(schritt.name)}“`}
      hinweis="Den Arbeitsschritt mehrmals messen. Gewertet wird später der mittlere Wert (Median) — einzelne Ausreißer verfälschen das Ergebnis dadurch nicht."
    >
      <Stoppuhr onMessung={(sek) => setzeMessungen((alt) => [...alt, sek])} />

      <div className="mt-4">
        {fehlend > 0 ? (
          <Hinweis titel="Noch nicht aussagekräftig" wichtig>
            {schritt.messungenSek.length === 0
              ? `Noch keine Messung. Mindestens ${MIN_MESSUNGEN_WARNSCHWELLE} Messungen einplanen.`
              : `${schritt.messungenSek.length} von ${MIN_MESSUNGEN_WARNSCHWELLE} Messungen. Noch ${mehrzahl(fehlend, 'Messung', 'Messungen')}, damit der Wert belastbar ist.`}
          </Hinweis>
        ) : (
          <Hinweis titel="Messreihe ausreichend">
            {mehrzahl(schritt.messungenSek.length, 'Messung', 'Messungen')} erfasst.
          </Hinweis>
        )}
      </div>

      {schritt.messungenSek.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold">Gemessene Zeiten</p>
          <p className="text-sm text-tinte-schwach">
            Antippen, um eine Messung zu entfernen — etwa wenn dazwischen das Telefon klingelte.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {schritt.messungenSek.map((m, i) => (
              <button
                key={`${i}-${m}`}
                type="button"
                onClick={() => setzeMessungen((alt) => alt.filter((_, j) => j !== i))}
                className={`zahl min-h-12 border px-3 text-lg ${
                  auffaellig.has(i) ? 'border-tinte border-2 font-bold' : 'border-linie'
                }`}
              >
                {formatiereStoppuhr(m)}
                {auffaellig.has(i) ? ' *' : ''}
              </button>
            ))}
          </div>
          {auffaellig.size > 0 && (
            <p className="mt-2 text-sm">
              <strong>*</strong> weicht deutlich von den übrigen Messungen ab. Nur entfernen, wenn es
              dafür einen bekannten Grund gab (Unterbrechung, Störung). Sonst stehen lassen — auf den
              Median wirkt sich ein einzelner Ausreißer kaum aus.
            </p>
          )}
          <p className="mt-2 text-sm text-tinte-schwach">
            Kürzeste {formatiereSekunden(Math.min(...schritt.messungenSek))}, längste{' '}
            {formatiereSekunden(Math.max(...schritt.messungenSek))}
          </p>
        </div>
      )}
    </Abschnitt>
  )
}
