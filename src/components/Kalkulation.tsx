import { useEffect, useMemo, useState } from 'react'
import type { Absender, Audit, Prozess, Schritt } from '../types'
import { LEERER_ABSENDER, ladeAbsender, speichereAbsender } from '../lib/storage'
import { berechneAudit, vergleicheAudits } from '../lib/kennzahlen'
import { berechneStundensatz, leseStundensatzEingaben } from '../lib/stundensatz'
import {
  abschlagProzentAusFaktor,
  faktorAusAbschlagProzent,
  findePartnerAudit,
  offenePunkte,
} from '../lib/audit'
import { KONSERVATIV_BEGRUENDUNGEN } from '../lib/quellen'
import {
  anzeigeName,
  formatiereDauer,
  formatiereEuro,
  formatiereMinuten,
  formatiereProzent,
  formatiereSekunden,
  formatiereStunden,
  formatiereZahl,
} from '../lib/format'
import { leseZahlNichtNegativ } from '../lib/zahlen'
import { Abschnitt, Feld, Hinweis, Knopf, Textfeld, ZahlFeld } from './ui'

/**
 * Auswertung am Rechner: Stundensatz, Bewertung der Arbeitsschritte,
 * Sicherheitsabschlag, Ergebnis und PDF.
 */
interface KalkulationProps {
  audit: Audit | null
  audits: Audit[]
  aktualisiereAudit: (id: string, f: (a: Audit) => Audit) => void
}

export function Kalkulation({ audit, audits, aktualisiereAudit }: KalkulationProps) {
  if (!audit) {
    return (
      <p className="border border-linie bg-papier p-4">
        Oben einen Betrieb auswählen. Sind noch keine Daten vorhanden, zuerst in der Erfassung
        messen oder eine Sicherungsdatei einlesen.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <StundensatzAbschnitt audit={audit} aktualisiereAudit={aktualisiereAudit} />
      <BewertungsAbschnitt audit={audit} aktualisiereAudit={aktualisiereAudit} />
      <AbschlagAbschnitt audit={audit} aktualisiereAudit={aktualisiereAudit} />
      <ErgebnisAbschnitt audit={audit} />
      <VergleichAbschnitt audit={audit} audits={audits} />
      <PdfAbschnitt audit={audit} audits={audits} />
    </div>
  )
}

function StundensatzAbschnitt({
  audit,
  aktualisiereAudit,
}: {
  audit: Audit
  aktualisiereAudit: KalkulationProps['aktualisiereAudit']
}) {
  const [offen, setOffen] = useState(false)
  const [brutto, setBrutto] = useState('')
  const [lnk, setLnk] = useState('')
  const [gemein, setGemein] = useState('')
  const [stunden, setStunden] = useState('')

  const eingaben = leseStundensatzEingaben({
    bruttoJahreslohn: leseZahlNichtNegativ(brutto),
    lohnnebenkostenProzent: leseZahlNichtNegativ(lnk),
    gemeinkostenProzent: leseZahlNichtNegativ(gemein),
    produktiveStundenProJahr: leseZahlNichtNegativ(stunden),
  })
  const ergebnis = eingaben ? berechneStundensatz(eingaben) : null

  return (
    <Abschnitt
      nummer={1}
      titel="Interner Stundensatz"
      hinweis="Was eine Arbeitsstunde den Betrieb kostet — Lohn, Lohnnebenkosten und Gemeinkosten, ohne Gewinnaufschlag. Das ist die vorsichtige Grundlage: eingesparte Zeit spart Kosten, nicht Umsatz."
      aktionen={
        <Knopf onClick={() => setOffen(!offen)} aktiv={offen}>
          {offen ? 'Rechner schließen' : 'Stundensatz ausrechnen'}
        </Knopf>
      }
    >
      <div className="flex flex-wrap items-end gap-4">
        <ZahlFeld
          label="Stundensatz (Euro je Stunde)"
          placeholder="z. B. 52,84"
          breite="w-60"
          wert={audit.stundensatzIntern}
          leerWert={0}
          onWert={(v) =>
            aktualisiereAudit(audit.id, (a) => ({
              ...a,
              stundensatzIntern: v !== null && v >= 0 ? v : 0,
            }))
          }
        />
        {audit.stundensatzIntern === 0 && (
          <p className="pb-2 font-semibold">Pflichtangabe — ohne Stundensatz keine Euro-Rechnung.</p>
        )}
      </div>

      {offen && (
        <div className="mt-4 border-t border-linie pt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Feld
              label="Bruttolohn im Jahr (Euro)"
              inputMode="decimal"
              placeholder="z. B. 45000"
              value={brutto}
              onChange={(e) => setBrutto(e.target.value)}
            />
            <Feld
              label="Lohnnebenkosten (Prozent)"
              inputMode="decimal"
              placeholder="z. B. 24"
              hinweis="Arbeitgeberanteile, Umlagen, Berufsgenossenschaft. Beleg: QUELLEN.md, Thema 2."
              value={lnk}
              onChange={(e) => setLnk(e.target.value)}
            />
            <Feld
              label="Gemeinkosten (Prozent)"
              inputMode="decimal"
              placeholder="aus der BWA"
              hinweis="Miete, Fahrzeuge, Versicherungen, Verwaltung — bezogen auf die Personalkosten."
              value={gemein}
              onChange={(e) => setGemein(e.target.value)}
            />
            <Feld
              label="Produktive Stunden im Jahr"
              inputMode="decimal"
              placeholder="z. B. 1455"
              hinweis="Kammer-Beispiele nennen 1.455 bis 1.503 Stunden. Beleg: QUELLEN.md, Thema 3."
              value={stunden}
              onChange={(e) => setStunden(e.target.value)}
            />
          </div>
          {eingaben && ergebnis && (
            <div className="mt-4 border border-linie bg-flaeche p-3">
              <p className="zahl">
                Personalkosten {formatiereEuro(ergebnis.personalkostenProJahr)} + Gemeinkosten{' '}
                {formatiereEuro(ergebnis.gemeinkostenProJahr)} ={' '}
                {formatiereEuro(ergebnis.gesamtkostenProJahr)} ÷{' '}
                {formatiereZahl(eingaben.produktiveStundenProJahr)} Stunden ={' '}
                <strong>{formatiereEuro(ergebnis.stundensatz)} je Stunde</strong>
              </p>
              <div className="mt-3">
                <Knopf
                  art="primaer"
                  onClick={() =>
                    aktualisiereAudit(audit.id, (a) => ({
                      ...a,
                      stundensatzIntern: Math.round(ergebnis.stundensatz * 100) / 100,
                      // Die Herleitung wird mitgespeichert, damit sie im PDF steht.
                      stundensatzHerleitung: eingaben,
                    }))
                  }
                >
                  Diesen Stundensatz übernehmen
                </Knopf>
              </div>
            </div>
          )}
        </div>
      )}
    </Abschnitt>
  )
}

function BewertungsAbschnitt({
  audit,
  aktualisiereAudit,
}: {
  audit: Audit
  aktualisiereAudit: KalkulationProps['aktualisiereAudit']
}) {
  const kennzahlen = useMemo(() => berechneAudit(audit), [audit])

  const setzeSchritt = (pId: string, sId: string, f: (s: Schritt) => Schritt) => {
    aktualisiereAudit(audit.id, (a) => ({
      ...a,
      prozesse: a.prozesse.map((p: Prozess) =>
        p.id === pId ? { ...p, schritte: p.schritte.map((s) => (s.id === sId ? f(s) : s)) } : p,
      ),
    }))
  }

  if (audit.prozesse.length === 0) {
    return (
      <Abschnitt nummer={2} titel="Was lässt sich automatisieren?">
        <p>Für diesen Betrieb ist noch kein Prozess erfasst.</p>
      </Abschnitt>
    )
  }

  return (
    <Abschnitt
      nummer={2}
      titel="Was lässt sich automatisieren?"
      hinweis="Für jeden Arbeitsschritt festlegen, ob er sich automatisieren lässt und wie viel Zeit danach noch übrig bleibt. Nur diese Schritte gehen in die Ersparnis ein."
    >
      {kennzahlen.prozesse.map((pk) => {
        const prozess = audit.prozesse.find((p) => p.id === pk.prozessId)
        if (!prozess) return null
        return (
          <div key={pk.prozessId} className="mb-6 last:mb-0">
            <h3 className="font-bold">
              {anzeigeName(pk.name)}{' '}
              <span className="zahl font-normal text-tinte-schwach">
                — {formatiereZahl(pk.haeufigkeitProMonat, pk.haeufigkeitProMonat % 1 === 0 ? 0 : 1)}× im
                Monat
              </span>
            </h3>
            {pk.schritte.length > 0 && (
              <p className="zahl text-sm text-tinte-schwach">
                Ein Durchlauf dauert heute {formatiereDauer(pk.istMinutenProDurchlauf)}, nach der
                Automatisierung {formatiereDauer(pk.sollMinutenProDurchlauf)}.
              </p>
            )}
            {pk.schritte.length === 0 ? (
              <p className="mt-1 text-tinte-schwach">
                Für diesen Prozess ist noch kein Arbeitsschritt erfasst.
              </p>
            ) : (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-tinte">
                    <th className="py-2 pr-3">Arbeitsschritt</th>
                    <th className="py-2 pr-3">Messungen</th>
                    <th className="py-2 pr-3">Mittlere Dauer</th>
                    <th className="py-2 pr-3">Heute</th>
                    <th className="py-2 pr-3">Automatisierbar</th>
                    <th className="py-2 pr-3">Rest danach</th>
                    <th className="py-2 pr-3">Künftig</th>
                    <th className="py-2">Ersparnis</th>
                  </tr>
                </thead>
                <tbody>
                  {pk.schritte.map((sk) => {
                    const schritt = prozess.schritte.find((s) => s.id === sk.schrittId)
                    if (!schritt) return null
                    return (
                      <tr key={sk.schrittId} className="border-b border-linie align-middle">
                        <td className="py-2 pr-3 font-semibold">{anzeigeName(sk.name)}</td>
                        <td className="zahl py-2 pr-3">
                          {sk.anzahlMessungen}
                          {sk.warnungen.length > 0 && <strong> *</strong>}
                        </td>
                        <td className="zahl py-2 pr-3">
                          {sk.medianSek === null ? '—' : formatiereSekunden(sk.medianSek)}
                        </td>
                        <td className="zahl py-2 pr-3">{formatiereMinuten(sk.istMinutenProMonat)}</td>
                        <td className="py-2 pr-3">
                          <Knopf
                            aria-label={`${sk.name}: automatisierbar ${
                              schritt.automatisierbar ? 'ja' : 'nein'
                            }`}
                            aktiv={schritt.automatisierbar}
                            onClick={() =>
                              setzeSchritt(pk.prozessId, sk.schrittId, (s) => ({
                                ...s,
                                automatisierbar: !s.automatisierbar,
                              }))
                            }
                          >
                            {schritt.automatisierbar ? 'Ja' : 'Nein'}
                          </Knopf>
                        </td>
                        <td className="py-2 pr-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={5}
                              aria-label={`Restaufwand für ${sk.name}`}
                              disabled={!schritt.automatisierbar}
                              value={schritt.restaufwandProzent}
                              onChange={(e) =>
                                setzeSchritt(pk.prozessId, sk.schrittId, (s) => ({
                                  ...s,
                                  restaufwandProzent: Number(e.target.value),
                                }))
                              }
                            />
                            <span className="zahl w-14">
                              {schritt.automatisierbar
                                ? formatiereProzent(schritt.restaufwandProzent)
                                : '—'}
                            </span>
                          </div>
                        </td>
                        <td className="zahl py-2 pr-3">{formatiereMinuten(sk.sollMinutenProMonat)}</td>
                        <td className="zahl py-2 font-bold">
                          {formatiereMinuten(sk.ersparnisMinutenProMonat)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            )}
          </div>
        )
      })}

      <p className="text-sm text-tinte-schwach">
        Angaben „Heute“, „Künftig“ und „Ersparnis“ in Minuten pro Monat.
      </p>

      {kennzahlen.warnungen.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {kennzahlen.warnungen.map((w, i) => (
            <Hinweis key={i} titel="Zu prüfen">
              {w}
            </Hinweis>
          ))}
        </div>
      )}
    </Abschnitt>
  )
}

function AbschlagAbschnitt({
  audit,
  aktualisiereAudit,
}: {
  audit: Audit
  aktualisiereAudit: KalkulationProps['aktualisiereAudit']
}) {
  const [vorschlaege, setVorschlaege] = useState(false)
  const prozent = abschlagProzentAusFaktor(audit.konservativFaktor)

  return (
    <Abschnitt
      nummer={3}
      titel="Sicherheitsabschlag"
      hinweis="Die errechnete Ersparnis wird bewusst gekürzt. Höhe und Begründung legen Sie selbst fest — beides steht später im PDF, damit der Kunde nachvollziehen kann, warum vorsichtig gerechnet wurde."
    >
      <div className="flex flex-wrap items-end gap-4">
        <ZahlFeld
          label="Abschlag in Prozent"
          breite="w-44"
          wert={prozent}
          leerWert={0}
          onWert={(v) =>
            aktualisiereAudit(audit.id, (a) => ({
              ...a,
              konservativFaktor: faktorAusAbschlagProzent(v ?? 0),
            }))
          }
        />
        <p className="zahl pb-2 text-sm text-tinte-schwach">
          Rechenfaktor {formatiereZahl(audit.konservativFaktor, 2)} — so steht es im PDF.
        </p>
      </div>

      <div className="mt-4">
        <Textfeld
          label="Begründung (wird im PDF gedruckt)"
          value={audit.konservativBegruendung}
          placeholder="Warum wird vorsichtig gerechnet?"
          onChange={(e) =>
            aktualisiereAudit(audit.id, (a) => ({ ...a, konservativBegruendung: e.target.value }))
          }
        />
      </div>

      <div className="mt-3">
        <Knopf onClick={() => setVorschlaege(!vorschlaege)} aktiv={vorschlaege}>
          {vorschlaege ? 'Textvorschläge ausblenden' : 'Textvorschläge anzeigen'}
        </Knopf>
        {vorschlaege && (
          <>
            <div className="mt-3 flex flex-col gap-2">
              {KONSERVATIV_BEGRUENDUNGEN.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() =>
                    aktualisiereAudit(audit.id, (a) => ({
                      ...a,
                      konservativBegruendung:
                        a.konservativBegruendung.trim() === ''
                          ? b
                          : `${a.konservativBegruendung} ${b}`,
                    }))
                  }
                  className="min-h-11 border border-linie px-3 py-2 text-left text-sm"
                >
                  {b}
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-tinte-schwach">
              Anklicken übernimmt den Text in das Feld oben. Belege: QUELLEN.md, Thema 11.
            </p>
          </>
        )}
      </div>

      {prozent === 0 && (
        <div className="mt-4">
          <Hinweis titel="Kein Abschlag gesetzt" wichtig>
            Die Ersparnis wird ungekürzt ausgewiesen. Das ist zulässig, sollte aber bewusst so
            gewollt sein.
          </Hinweis>
        </div>
      )}
      {audit.konservativBegruendung.trim() === '' && (
        <div className="mt-2">
          <Hinweis titel="Begründung fehlt" wichtig>
            Ohne Begründung bleibt die entsprechende Zeile im PDF leer.
          </Hinweis>
        </div>
      )}
    </Abschnitt>
  )
}

function ErgebnisAbschnitt({ audit }: { audit: Audit }) {
  const k = useMemo(() => berechneAudit(audit), [audit])
  const prozent = abschlagProzentAusFaktor(audit.konservativFaktor)

  const zeile = (label: string, wert: string) => (
    <div className="flex items-baseline justify-between gap-4 border-b border-linie py-2 last:border-0">
      <span>{label}</span>
      <span className="zahl font-semibold">{wert}</span>
    </div>
  )

  return (
    <Abschnitt nummer={4} titel="Ergebnis">
      <div className="flex flex-col">
        {zeile('Aufwand heute', `${formatiereMinuten(k.istMinutenProMonat)} im Monat`)}
        {zeile('Aufwand nach Automatisierung', `${formatiereMinuten(k.sollMinutenProMonat)} im Monat`)}
        {zeile(
          'Eingesparte Zeit',
          `${formatiereMinuten(k.ersparnisMinutenProMonat)} im Monat · ${formatiereStunden(k.ersparnisStundenProJahr)} im Jahr`,
        )}
        {zeile('Ersparnis im Jahr', `${formatiereEuro(k.ersparnisEuroProJahrVorAbschlag)}`)}
        {zeile(
          `abzüglich Sicherheitsabschlag ${formatiereProzent(prozent)}`,
          `− ${formatiereEuro(k.ersparnisEuroProJahrVorAbschlag - k.ersparnisEuroProJahr)}`,
        )}
      </div>

      <div className="mt-4 border-2 border-tinte p-4">
        <p className="text-sm font-semibold">Ersparnis im Jahr, vorsichtig gerechnet</p>
        <p className="zahl mt-1 text-4xl font-bold">{formatiereEuro(k.ersparnisEuroProJahr)}</p>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold">Preisrahmen für das Angebot</p>
        <p className="text-sm text-tinte-schwach">10, 15 und 20 Prozent der Jahresersparnis</p>
        <div className="mt-2 grid grid-cols-3 border border-linie">
          {[
            ['10 %', k.preisband.untergrenze],
            ['15 %', k.preisband.mitte],
            ['20 %', k.preisband.obergrenze],
          ].map(([label, wert], i) => (
            <div key={label as string} className={`p-3 text-center ${i === 1 ? 'bg-flaeche' : ''}`}>
              <div className="text-sm text-tinte-schwach">{label as string}</div>
              <div className="zahl mt-1 text-lg font-bold">{formatiereEuro(wert as number)}</div>
            </div>
          ))}
        </div>
      </div>

      {k.ersparnisEuroProJahr <= 0 && (
        <div className="mt-4">
          <Hinweis titel="Keine Ersparnis" wichtig>
            Es ergibt sich kein Zeitgewinn. Prüfen: Sind Arbeitsschritte als automatisierbar
            markiert und liegt der Restaufwand unter 100 Prozent?
          </Hinweis>
        </div>
      )}
    </Abschnitt>
  )
}

function VergleichAbschnitt({ audit, audits }: { audit: Audit; audits: Audit[] }) {
  const partner = findePartnerAudit(audit, audits)
  if (!partner) return null

  const baseline = audit.phase === 'baseline' ? audit : partner
  const nachmessung = audit.phase === 'nachmessung' ? audit : partner

  let inhalt
  try {
    const v = vergleicheAudits(baseline, nachmessung)
    inhalt = (
      <div className="flex flex-col">
        <div className="flex items-baseline justify-between gap-4 border-b border-linie py-2">
          <span>Aufwand bei der Erstmessung</span>
          <span className="zahl font-semibold">
            {formatiereMinuten(v.istBaselineMinutenProMonat)} im Monat
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-b border-linie py-2">
          <span>Aufwand bei der Nachmessung</span>
          <span className="zahl font-semibold">
            {formatiereMinuten(v.istNachmessungMinutenProMonat)} im Monat
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-b border-linie py-2">
          <span>Tatsächlich eingespart (ohne Abschlag, weil gemessen)</span>
          <span className="zahl font-semibold">
            {formatiereMinuten(v.gemesseneErsparnisMinutenProMonat)} im Monat ·{' '}
            {formatiereEuro(v.gemesseneErsparnisEuroProJahr)} im Jahr
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-4 py-2">
          <span>Vorhergesagt waren {formatiereEuro(v.prognoseEuroProJahr)} im Jahr</span>
          <span className="zahl font-semibold">
            {v.zielerreichungProzent === null
              ? 'kein Vergleich möglich'
              : `${formatiereProzent(v.zielerreichungProzent)} erreicht`}
          </span>
        </div>
      </div>
    )
  } catch (fehler) {
    inhalt = (
      <Hinweis titel="Vergleich nicht möglich" wichtig>
        {fehler instanceof Error ? fehler.message : String(fehler)}
      </Hinweis>
    )
  }

  return (
    <Abschnitt
      titel="Erstmessung und Nachmessung im Vergleich"
      hinweis="Beide Zeitstände werden mit dem Stundensatz der Erstmessung bewertet, damit der Vergleich nur die Zeit abbildet."
    >
      {inhalt}
    </Abschnitt>
  )
}

function PdfAbschnitt({ audit, audits }: { audit: Audit; audits: Audit[] }) {
  const [laeuft, setLaeuft] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)
  const [absender, setAbsender] = useState<Absender>(LEERER_ABSENDER)
  const [angabenOffen, setAngabenOffen] = useState(false)
  const partner = findePartnerAudit(audit, audits)

  useEffect(() => {
    void ladeAbsender().then(setAbsender)
  }, [])

  const aendere = (feld: keyof Absender, wert: string) => {
    const neu = { ...absender, [feld]: wert }
    setAbsender(neu)
    void speichereAbsender(neu)
  }

  const absenderFehlt = absender.name.trim() === '' || absender.strasse.trim() === '' || absender.ort.trim() === ''
  const punkte = offenePunkte(audit)
  if (absenderFehlt) {
    punkte.push('Ihre eigenen Angaben für den Briefkopf fehlen (Name und Anschrift).')
  }

  const exportieren = async () => {
    setLaeuft(true)
    setFehler(null)
    try {
      const { exportierePdf } = await import('../lib/pdf')
      await exportierePdf(audit, partner, absender)
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally {
      setLaeuft(false)
    }
  }

  return (
    <Abschnitt
      nummer={5}
      titel="PDF für den Kunden"
      hinweis={`Enthält alle gemessenen Zeiten, den vollständigen Rechenweg, den Preisrahmen${
        partner ? ', den Vergleich beider Messungen' : ''
      } sowie die Quellen- und Annahmenübersicht im Anhang.`}
      aktionen={
        <Knopf onClick={() => setAngabenOffen(!angabenOffen)} aktiv={angabenOffen}>
          Meine Angaben
        </Knopf>
      }
    >
      {angabenOffen && (
        <div className="mb-4 border-b border-linie pb-4">
          <p className="mb-3 text-sm text-tinte-schwach">
            Diese Angaben erscheinen als Absenderzeile im PDF. Auf Geschäftsbriefen sind
            ausgeschriebener Vor- und Nachname sowie eine ladungsfähige Anschrift verpflichtend —
            ein Postfach genügt nicht (Beleg: QUELLEN.md, Thema 5). Sie werden auf diesem Gerät
            gespeichert und gelten für alle PDFs.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Feld
              label="Vor- und Nachname"
              placeholder="Vorname und Nachname"
              value={absender.name}
              onChange={(e) => aendere('name', e.target.value)}
            />
            <Feld
              label="Straße und Hausnummer"
              placeholder="z. B. Beispielweg 4"
              value={absender.strasse}
              onChange={(e) => aendere('strasse', e.target.value)}
            />
            <Feld
              label="Postleitzahl und Ort"
              placeholder="z. B. 84028 Landshut"
              value={absender.ort}
              onChange={(e) => aendere('ort', e.target.value)}
            />
            <Feld
              label="Telefon und E-Mail"
              placeholder="z. B. 0871 1234567 · post@beispiel.de"
              value={absender.kontakt}
              onChange={(e) => aendere('kontakt', e.target.value)}
            />
          </div>
        </div>
      )}

      {punkte.length > 0 && (
        <div className="mb-3 flex flex-col gap-2">
          {punkte.map((p) => (
            <Hinweis key={p} titel="Noch offen" wichtig>
              {p}
            </Hinweis>
          ))}
        </div>
      )}
      <Knopf art="primaer" gross disabled={laeuft} onClick={() => void exportieren()}>
        {laeuft ? 'PDF wird erstellt …' : 'PDF erstellen'}
      </Knopf>
      {fehler && (
        <div className="mt-3">
          <Hinweis titel="PDF konnte nicht erstellt werden" wichtig>
            {fehler}
          </Hinweis>
        </div>
      )}
    </Abschnitt>
  )
}
