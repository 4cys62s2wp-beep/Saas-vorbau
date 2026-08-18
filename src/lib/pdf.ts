import type { Content, TDocumentDefinitions, TableCell } from 'pdfmake/interfaces'
import type { Absender, Audit } from '../types'
import { berechneAudit, vergleicheAudits, type AuditVergleich } from './kennzahlen'
import {
  anzeigeName,
  formatiereDatum,
  formatiereEuro,
  formatiereMinuten,
  formatiereProzent,
  formatiereSekunden,
  formatiereStunden,
  formatiereZahl,
} from './format'
import { abschlagProzentAusFaktor } from './audit'
import { ABSENDER, ANGEBOT_HINWEISE, QUELLEN_ANNAHMEN } from './quellen'

/**
 * PDF mit VOLLEM Rechenweg: jede Zahl im Ergebnis muss sich aus den
 * abgedruckten Messwerten nachrechnen lassen. Am Ende der Quellen-/
 * Annahmenblock aus QUELLEN.md (via quellen.ts).
 *
 * Der Builder ist eine reine Funktion (testbar in Node); das eigentliche
 * Rendern übernimmt exportierePdf() im Browser.
 */

export function erzeugeAuditPdfDefinition(
  audit: Audit,
  partnerAudit?: Audit,
  absender: Absender = ABSENDER,
): TDocumentDefinitions {
  const k = berechneAudit(audit)

  let vergleich: AuditVergleich | null = null
  let vergleichsPartner: Audit | null = null
  if (partnerAudit && partnerAudit.phase !== audit.phase) {
    const baseline = audit.phase === 'baseline' ? audit : partnerAudit
    const nachmessung = audit.phase === 'nachmessung' ? audit : partnerAudit
    vergleich = vergleicheAudits(baseline, nachmessung)
    vergleichsPartner = partnerAudit
  }

  const inhalt: Content[] = []

  // ── Kopf ────────────────────────────────────────────────────────────────
  const absenderZeile = [absender.name, absender.strasse, absender.ort, absender.kontakt]
    .filter((t) => t.trim() !== '')
    .join(' · ')
  if (absenderZeile !== '') {
    inhalt.push({ text: absenderZeile, style: 'klein', margin: [0, 0, 0, 8] })
  }
  inhalt.push(
    { text: 'Prozess-Audit — Ergebnis und Rechenweg', style: 'h1' },
    {
      text: `${audit.betrieb}${audit.gewerk.trim() === '' ? '' : ` (${audit.gewerk})`} — ${audit.phase === 'baseline' ? 'Erstmessung' : 'Nachmessung'} vom ${formatiereDatum(audit.datum)}`,
      margin: [0, 2, 0, 12],
    },
    {
      text:
        'Alle Prozesszeiten sind vor Ort gemessen (keine Branchen- oder Schätzwerte). ' +
        'Je Arbeitsschritt wird der Median der Messreihe angesetzt — er ist gegen einzelne ' +
        'Ausreißer unempfindlich. Jede Zahl unten lässt sich aus den abgedruckten Messwerten nachrechnen.',
      style: 'klein',
      margin: [0, 0, 0, 12],
    },
  )

  // ── Messwerte und Schritte je Prozess ───────────────────────────────────
  for (const pk of k.prozesse) {
    inhalt.push({
      text: `Prozess: ${anzeigeName(pk.name)} — ${formatiereZahl(pk.haeufigkeitProMonat, pk.haeufigkeitProMonat % 1 === 0 ? 0 : 1)}× pro Monat`,
      style: 'h2',
      margin: [0, 8, 0, 4],
    })

    if (pk.schritte.length === 0) {
      inhalt.push({
        text: 'Für diesen Prozess wurde kein Arbeitsschritt erfasst.',
        style: 'klein',
        margin: [0, 0, 0, 6],
      })
      continue
    }

    const zeilen: TableCell[][] = [
      [
        { text: 'Arbeitsschritt', style: 'th' },
        { text: 'Messwerte (s)', style: 'th' },
        { text: 'n', style: 'th' },
        { text: 'Median', style: 'th' },
        { text: 'Heute', style: 'th' },
        { text: 'autom.', style: 'th' },
        { text: 'Rest', style: 'th' },
        { text: 'Künftig', style: 'th' },
        { text: 'Ersparnis', style: 'th' },
      ],
    ]

    const prozess = audit.prozesse.find((p) => p.id === pk.prozessId)
    for (const sk of pk.schritte) {
      const schritt = prozess?.schritte.find((s) => s.id === sk.schrittId)
      zeilen.push([
        anzeigeName(sk.name),
        {
          text: schritt ? schritt.messungenSek.map((m) => formatiereZahl(m, m % 1 === 0 ? 0 : 1)).join('; ') : '—',
          style: 'klein',
        },
        { text: String(sk.anzahlMessungen), alignment: 'right' },
        { text: sk.medianSek === null ? '—' : formatiereSekunden(sk.medianSek), alignment: 'right' },
        { text: formatiereMinuten(sk.istMinutenProMonat), alignment: 'right' },
        schritt?.automatisierbar ? 'ja' : 'nein',
        {
          text: schritt?.automatisierbar ? formatiereProzent(schritt.restaufwandProzent) : '—',
          alignment: 'right',
        },
        { text: formatiereMinuten(sk.sollMinutenProMonat), alignment: 'right' },
        { text: formatiereMinuten(sk.ersparnisMinutenProMonat), alignment: 'right' },
      ])
    }

    zeilen.push([
      { text: 'Summe', bold: true },
      '',
      '',
      '',
      { text: formatiereMinuten(pk.istMinutenProMonat), alignment: 'right', bold: true },
      '',
      '',
      { text: formatiereMinuten(pk.sollMinutenProMonat), alignment: 'right', bold: true },
      { text: formatiereMinuten(pk.ersparnisMinutenProMonat), alignment: 'right', bold: true },
    ])

    inhalt.push({
      table: { headerRows: 1, widths: ['*', 78, 14, 34, 40, 26, 26, 40, 44], body: zeilen },
      layout: 'lightHorizontalLines',
      fontSize: 8,
    })
    inhalt.push({
      text: '„Heute“, „Künftig“ und „Ersparnis“ in Minuten pro Monat.',
      style: 'klein',
      margin: [0, 2, 0, 0],
    })
  }

  // ── Rechenweg ───────────────────────────────────────────────────────────
  inhalt.push({ text: 'Rechenweg zur Jahresersparnis', style: 'h2', margin: [0, 14, 0, 4] })

  const rechenweg: string[] = [
    `Ist-Zeit gesamt: ${formatiereMinuten(k.istMinutenProMonat)} pro Monat`,
    `Soll-Zeit nach Automatisierung: ${formatiereMinuten(k.sollMinutenProMonat)} pro Monat ` +
      '(nicht automatisierbare Schritte bleiben in voller Höhe enthalten)',
    `Ersparnis: ${formatiereMinuten(k.istMinutenProMonat)} − ${formatiereMinuten(k.sollMinutenProMonat)} = ` +
      `${formatiereMinuten(k.ersparnisMinutenProMonat)} pro Monat`,
    `Aufs Jahr: ${formatiereMinuten(k.ersparnisMinutenProMonat)} ÷ 60 × 12 Monate = ${formatiereStunden(k.ersparnisStundenProJahr)} pro Jahr`,
    `Bewertet mit internem Stundensatz: ${formatiereStunden(k.ersparnisStundenProJahr)} × ` +
      `${formatiereEuro(audit.stundensatzIntern)}/h = ${formatiereEuro(k.ersparnisEuroProJahrVorAbschlag)} pro Jahr (vor Abschlag)`,
    `Sicherheitsabschlag ${formatiereProzent(abschlagProzentAusFaktor(audit.konservativFaktor))} ` +
      `(Faktor ${formatiereZahl(audit.konservativFaktor, 2)}): ${formatiereEuro(k.ersparnisEuroProJahr)} pro Jahr`,
  ]
  inhalt.push({ ol: rechenweg, margin: [0, 0, 0, 6] })
  inhalt.push({
    text: `Begründung des Abschlags: ${audit.konservativBegruendung.trim() !== '' ? audit.konservativBegruendung : '— nicht angegeben —'}`,
    italics: true,
    margin: [0, 0, 0, 10],
  })

  // ── Stundensatz-Herleitung ──────────────────────────────────────────────
  inhalt.push({ text: 'Interner Stundensatz', style: 'h2', margin: [0, 4, 0, 4] })
  if (audit.stundensatzHerleitung) {
    const h = audit.stundensatzHerleitung
    const personal = h.bruttoJahreslohn * (1 + h.lohnnebenkostenProzent / 100)
    const gesamt = personal * (1 + h.gemeinkostenProzent / 100)
    inhalt.push({
      ol: [
        `Bruttojahreslohn ${formatiereEuro(h.bruttoJahreslohn)} × (1 + ${formatiereProzent(h.lohnnebenkostenProzent, 1)} Lohnnebenkosten) = ${formatiereEuro(personal)} Personalkosten`,
        `+ ${formatiereProzent(h.gemeinkostenProzent, 1)} Gemeinkostenzuschlag = ${formatiereEuro(gesamt)} Gesamtkosten pro Jahr`,
        `÷ ${formatiereZahl(h.produktiveStundenProJahr)} produktive Stunden = ${formatiereEuro(gesamt / h.produktiveStundenProJahr)} pro Stunde`,
      ],
      margin: [0, 0, 0, 4],
    })
    inhalt.push({
      text:
        'Kostensatz ohne Gewinn- und Wagniszuschlag — für eine Ersparnis-Rechnung die konservative Basis. ' +
        'Herleitungsschema und Belege: Quellenblock am Ende.',
      style: 'klein',
      margin: [0, 0, 0, 10],
    })
  } else {
    inhalt.push({
      text: `${formatiereEuro(audit.stundensatzIntern)}/h — manuell gesetzt (vom Betrieb bestätigter interner Kostensatz).`,
      margin: [0, 0, 0, 10],
    })
  }

  // ── Preisband ───────────────────────────────────────────────────────────
  inhalt.push(
    { text: 'Preisrahmen (Anteil an der vorsichtig gerechneten Jahresersparnis)', style: 'h2', margin: [0, 4, 0, 4] },
    {
      table: {
        widths: ['*', '*', '*'],
        body: [
          [
            { text: '10 %', style: 'th', alignment: 'center' },
            { text: '15 %', style: 'th', alignment: 'center' },
            { text: '20 %', style: 'th', alignment: 'center' },
          ],
          [
            { text: formatiereEuro(k.preisband.untergrenze), alignment: 'center' },
            { text: formatiereEuro(k.preisband.mitte), alignment: 'center', bold: true },
            { text: formatiereEuro(k.preisband.obergrenze), alignment: 'center' },
          ],
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 10],
    },
  )

  // ── Vergleich Baseline ↔ Nachmessung ────────────────────────────────────
  if (vergleich && vergleichsPartner) {
    inhalt.push({ text: 'Nachmessung: gemessene Wirkung', style: 'h2', margin: [0, 4, 0, 4] })
    inhalt.push({
      ol: [
        `Ist Baseline: ${formatiereMinuten(vergleich.istBaselineMinutenProMonat)} pro Monat`,
        `Ist Nachmessung: ${formatiereMinuten(vergleich.istNachmessungMinutenProMonat)} pro Monat`,
        `Gemessene Ersparnis: ${formatiereMinuten(vergleich.gemesseneErsparnisMinutenProMonat)} pro Monat = ` +
          `${formatiereEuro(vergleich.gemesseneErsparnisEuroProJahr)} pro Jahr (ohne Abschlag — gemessen, nicht geschätzt)`,
        `Prognose war ${formatiereEuro(vergleich.prognoseEuroProJahr)} pro Jahr` +
          (vergleich.zielerreichungProzent === null
            ? ''
            : `; davon erreicht: ${formatiereProzent(vergleich.zielerreichungProzent)}`),
      ],
      margin: [0, 0, 0, 10],
    })
  }

  // ── Messqualität ────────────────────────────────────────────────────────
  if (k.warnungen.length > 0) {
    inhalt.push(
      { text: 'Hinweise zur Messqualität', style: 'h2', margin: [0, 4, 0, 4] },
      { ul: k.warnungen, style: 'klein', margin: [0, 0, 0, 10] },
    )
  }

  // ── Rechtliche Hinweise ─────────────────────────────────────────────────
  if (ANGEBOT_HINWEISE.length > 0) {
    inhalt.push(
      { text: 'Hinweise', style: 'h2', margin: [0, 4, 0, 4] },
      { ul: ANGEBOT_HINWEISE, style: 'klein', margin: [0, 0, 0, 10] },
    )
  }

  // ── Quellen-/Annahmenblock ──────────────────────────────────────────────
  // Der Quellennachweis ist Anhang: er beginnt auf einer neuen Seite, damit das
  // eigentliche Ergebnis für sich steht und trotzdem jede Zahl belegt ist.
  inhalt.push({
    text: 'Anhang: Quellen und Annahmen',
    style: 'h2',
    pageBreak: 'before',
    margin: [0, 0, 0, 2],
  })
  inhalt.push({
    text:
      'Grundlage der oben verwendeten Rechengrößen. Die gemessenen Prozesszeiten selbst stammen ' +
      'ausschließlich aus der Messung vor Ort und sind in der Tabelle am Anfang vollständig abgedruckt.',
    style: 'klein',
    margin: [0, 0, 0, 6],
  })
  const qZeilen: TableCell[][] = [
    [
      { text: 'Annahme', style: 'th' },
      { text: 'Quelle (Stand)', style: 'th' },
      { text: 'Prüfstand', style: 'th' },
    ],
  ]
  for (const q of QUELLEN_ANNAHMEN) {
    qZeilen.push([
      { text: `${q.thema}: ${q.aussage}`, style: 'klein' },
      { text: `${q.quelle} (${q.stand})\n${q.url}`, style: 'klein' },
      { text: q.status, style: 'klein' },
    ])
  }
  inhalt.push({
    table: { headerRows: 1, widths: ['*', 165, 62], body: qZeilen },
    layout: 'lightHorizontalLines',
    fontSize: 7,
  })
  inhalt.push({
    text:
      'VERIFIZIERT = unmittelbar aus der Primärquelle gegengelesen. TEILVERIFIZIERT = Primärquelle benannt, ' +
      'der Wert ist über Fundstellen belegt. NICHT VERIFIZIERT = ausdrücklich als Annahme gekennzeichnet.',
    style: 'klein',
    margin: [0, 6, 0, 0],
  })

  return {
    info: {
      title: `Prozess-Audit ${audit.betrieb} — ${formatiereDatum(audit.datum)}`,
    },
    pageSize: 'A4',
    pageMargins: [48, 48, 48, 56],
    defaultStyle: { font: 'Roboto', fontSize: 10, lineHeight: 1.25 },
    styles: {
      // Ausschließlich Schwarz und Grau — das Dokument soll auch im
      // Schwarz-Weiß-Ausdruck unverändert wirken.
      h1: { fontSize: 16, bold: true, color: '#000000' },
      h2: { fontSize: 12, bold: true, color: '#000000' },
      th: { bold: true, fontSize: 8, color: '#000000' },
      klein: { fontSize: 8, color: '#3c3c3c' },
    },
    footer: (aktuelleSeite: number, seitenGesamt: number) => ({
      columns: [
        { text: `Erstellt am ${formatiereDatum(new Date().toISOString())}`, style: 'klein' },
        { text: `Seite ${aktuelleSeite} von ${seitenGesamt}`, style: 'klein', alignment: 'right' },
      ],
      margin: [48, 16, 48, 0],
    }),
    content: inhalt,
  }
}

/** Browser-seitiges Rendern und Herunterladen. */
export async function exportierePdf(
  audit: Audit,
  partnerAudit?: Audit,
  absender?: Absender,
): Promise<void> {
  // Dynamischer Import: pdfmake (~2 MB mit Fonts) wird erst beim ersten Export geladen.
  const [{ default: pdfMake }, vfsModul] = await Promise.all([
    import('pdfmake/build/pdfmake'),
    import('pdfmake/build/vfs_fonts'),
  ])
  // pdfmake 0.2.23 exportiert das Font-Verzeichnis direkt (Dateiname → Base64);
  // ältere Builds verpackten es unter .pdfMake.vfs — beide Formen abdecken.
  const roh = vfsModul as unknown as Record<string, unknown>
  const vfs =
    (roh['vfs'] as Record<string, string> | undefined) ??
    ((roh['pdfMake'] as { vfs?: Record<string, string> } | undefined)?.vfs ??
      (roh as unknown as Record<string, string>))
  pdfMake.vfs = vfs
  pdfMake
    .createPdf(erzeugeAuditPdfDefinition(audit, partnerAudit, absender))
    .download(`prozess-audit-${audit.betrieb.replace(/[^\wäöüÄÖÜß-]+/g, '_')}-${audit.datum}.pdf`)
}
