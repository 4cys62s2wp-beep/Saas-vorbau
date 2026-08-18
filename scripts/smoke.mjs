/*
 * Funktionsprüfung im echten Browser: der vollständige Arbeitsablauf von der
 * ersten Messung bis zum fertigen PDF, einschließlich Ändern, Löschen und
 * Nachmessung.
 *
 * Voraussetzung: die gebaute Anwendung läuft (npm run build && npm run preview).
 * Aufruf:        node scripts/smoke.mjs [http://localhost:4173]
 */
import { chromium } from 'playwright-core'

const adresse = process.argv[2] ?? 'http://localhost:4173'
const fehler = []
let nummer = 0

const pruefe = (bedingung, text) => {
  nummer += 1
  if (bedingung) {
    console.log(`  ${String(nummer).padStart(2)}  ok      ${text}`)
  } else {
    fehler.push(text)
    console.log(`  ${String(nummer).padStart(2)}  FEHLER  ${text}`)
  }
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const seite = await browser.newPage({ viewport: { width: 1200, height: 1400 } })
seite.on('pageerror', (e) => fehler.push('Javascript-Fehler: ' + e.message))

const abschnitt = (titel) => seite.locator(`section:has(h2:has-text("${titel}"))`)

await seite.goto(adresse)
await seite.waitForSelector('h1:has-text("Prozess-Audit")')
pruefe(true, 'Anwendung startet')

// ---------------------------------------------------------------- Betrieb
await seite.getByPlaceholder('z. B. Mustermann Sanitär').fill('Testbetrieb Huber')
await seite.getByPlaceholder('z. B. Sanitär, Elektro, Schreinerei').fill('Sanitär')
await seite.getByRole('button', { name: 'Anlegen', exact: true }).click()
// Nach dem Anlegen ist der Betrieb ausgewählt und der erste Abschnitt erscheint.
await seite.waitForSelector('h2:has-text("Prozess")')
pruefe(
  (await seite.locator('select option:has-text("Testbetrieb Huber")').count()) === 1,
  'Betrieb anlegen',
)

// ---------------------------------------------------------------- Prozess
const prozessAbschnitt = abschnitt('Prozess')
await prozessAbschnitt.getByPlaceholder('z. B. Angebot schreiben').fill('Angebot schreiben')
await prozessAbschnitt.getByPlaceholder('z. B. 12').fill('20')
await prozessAbschnitt.getByRole('button', { name: 'Hinzufügen' }).click()
await seite.waitForSelector('h2:has-text("Arbeitsschritte in")')
pruefe(true, 'Prozess anlegen, Folgeabschnitt erscheint')

// ------------------------------------------------------------ Arbeitsschritt
const schrittAbschnitt = abschnitt('Arbeitsschritte in')
await schrittAbschnitt.getByPlaceholder('z. B. Aufmaß ins Angebot übertragen').fill('Aufmaß übertragen')
await schrittAbschnitt.getByRole('button', { name: 'Hinzufügen' }).click()
await seite.waitForSelector('h2:has-text("Zeit messen")')
pruefe(true, 'Arbeitsschritt anlegen, Messbereich erscheint')

// ---------------------------------------------------------------- Stoppuhr
const messAbschnitt = abschnitt('Zeit messen')
await messAbschnitt.getByRole('button', { name: 'Start' }).click()
for (let i = 0; i < 2; i++) {
  await seite.waitForTimeout(350)
  await messAbschnitt.getByRole('button', { name: 'Messung speichern — Uhr läuft weiter' }).click()
}
await seite.waitForTimeout(350)
await messAbschnitt.getByRole('button', { name: 'Messung speichern und anhalten' }).click()

const zeiten = messAbschnitt.locator('button.zahl')
pruefe((await zeiten.count()) === 3, `drei Messungen aufgenommen (gezählt: ${await zeiten.count()})`)
pruefe(
  (await messAbschnitt.getByText('Noch 2 Messungen').count()) === 1,
  'Warnung zur zu kurzen Messreihe erscheint',
)

await messAbschnitt.getByRole('button', { name: 'Start' }).click()
await seite.waitForTimeout(300)
await messAbschnitt.getByRole('button', { name: 'Abbrechen — diese Zeit nicht speichern' }).click()
pruefe((await zeiten.count()) === 3, 'Abbrechen speichert keine Messung')

// Zwei weitere Messungen, damit die Reihe vollständig ist
await messAbschnitt.getByRole('button', { name: 'Start' }).click()
await seite.waitForTimeout(300)
await messAbschnitt.getByRole('button', { name: 'Messung speichern — Uhr läuft weiter' }).click()
await seite.waitForTimeout(300)
await messAbschnitt.getByRole('button', { name: 'Messung speichern und anhalten' }).click()
pruefe(
  (await messAbschnitt.getByText('Messreihe ausreichend').count()) === 1,
  'ab fünf Messungen gilt die Reihe als ausreichend',
)

// Eine Messung wieder entfernen und erneut aufnehmen
await zeiten.first().click()
pruefe((await zeiten.count()) === 4, 'einzelne Messung lässt sich entfernen')
await messAbschnitt.getByRole('button', { name: 'Start' }).click()
await seite.waitForTimeout(300)
await messAbschnitt.getByRole('button', { name: 'Messung speichern und anhalten' }).click()

// ------------------------------------------------------------ Umbenennen
await schrittAbschnitt.getByLabel('Name ändern').fill('Aufmaß ins Angebot übertragen')
pruefe(
  (await seite.locator('h2:has-text("Aufmaß ins Angebot übertragen")').count()) > 0,
  'Arbeitsschritt umbenennen',
)

// -------------------------------------------------------- Neustart der App
await seite.reload()
await seite.waitForSelector('h1:has-text("Prozess-Audit")')
pruefe(
  (await seite.locator('option:has-text("Testbetrieb Huber")').count()) === 1,
  'Daten überstehen einen Neustart (lokale Speicherung)',
)

// ------------------------------------------------------- Löschen prüfen
await abschnitt('Prozess').getByRole('button', { name: 'Angebot schreiben' }).click()
const zweiterSchritt = abschnitt('Arbeitsschritte in')
await zweiterSchritt.getByPlaceholder('z. B. Aufmaß ins Angebot übertragen').fill('Versehentlich angelegt')
await zweiterSchritt.getByRole('button', { name: 'Hinzufügen' }).click()
await zweiterSchritt.getByRole('button', { name: 'Löschen' }).click()
await zweiterSchritt.getByRole('button', { name: 'Ja, löschen' }).click()
pruefe(
  (await seite.getByRole('button', { name: /Versehentlich angelegt/ }).count()) === 0,
  'Arbeitsschritt löschen (mit Rückfrage)',
)

// ---------------------------------------------------------------- Auswerten
await seite.getByRole('button', { name: 'Auswerten' }).click()
await seite.waitForSelector('h2:has-text("Interner Stundensatz")')
pruefe(true, 'Wechsel in die Auswertung')

const satzAbschnitt = abschnitt('Interner Stundensatz')
await satzAbschnitt.getByRole('button', { name: 'Stundensatz ausrechnen' }).click()
await satzAbschnitt.getByLabel('Bruttolohn im Jahr (Euro)').fill('45000')
await satzAbschnitt.getByLabel('Lohnnebenkosten (Prozent)').fill('24')
await satzAbschnitt.getByLabel('Gemeinkosten (Prozent)').fill('40')
await satzAbschnitt.getByLabel('Produktive Stunden im Jahr').fill('1455')
await satzAbschnitt.getByRole('button', { name: 'Diesen Stundensatz übernehmen' }).click()
const satzWert = await satzAbschnitt.getByLabel('Stundensatz (Euro je Stunde)').inputValue()
pruefe(satzWert !== '' && satzWert !== '0', `Stundensatz berechnet und übernommen (${satzWert} €)`)

const bewertung = abschnitt('Was lässt sich automatisieren?')
await bewertung.getByRole('button', { name: 'Nein' }).click()
pruefe(
  (await bewertung.getByRole('button', { name: 'Ja' }).count()) === 1,
  'Arbeitsschritt als automatisierbar markieren',
)
await bewertung.locator('input[type="range"]').fill('20')

const abschlag = abschnitt('Sicherheitsabschlag')
await abschlag.getByLabel('Abschlag in Prozent').fill('20')
pruefe(
  (await abschlag.getByText('Rechenfaktor 0,80').count()) === 1,
  'Abschlag in Prozent wird in den Rechenfaktor umgesetzt',
)
await abschlag.getByRole('button', { name: 'Textvorschläge anzeigen' }).click()
await abschlag.getByRole('button', { name: /Risikoabschlag nach dem Korrekturverfahren/ }).click()
pruefe(
  (await abschlag.getByText('Begründung fehlt').count()) === 0,
  'Begründung lässt sich per Klick übernehmen',
)

const ergebnis = abschnitt('Ergebnis')
const ergebnisText = (await ergebnis.textContent()) ?? ''
pruefe(!/NaN|Infinity|undefined/.test(ergebnisText), 'Ergebnis enthält keine fehlerhaften Zahlen')
pruefe(/Preisrahmen/.test(ergebnisText), 'Preisrahmen wird ausgewiesen')
pruefe(/€/.test(ergebnisText), 'Beträge werden in Euro dargestellt')

// ------------------------------------------------------- Eigene Angaben
const pdfAbschnitt = abschnitt('PDF für den Kunden')
pruefe(
  (await pdfAbschnitt.getByText('Briefkopf fehlen').count()) === 1,
  'fehlende Absenderangaben werden vor dem PDF angemahnt',
)
await pdfAbschnitt.getByRole('button', { name: 'Meine Angaben' }).click()
await pdfAbschnitt.getByLabel('Vor- und Nachname').fill('Max Mustermann')
await pdfAbschnitt.getByLabel('Straße und Hausnummer').fill('Beispielweg 4')
await pdfAbschnitt.getByLabel('Postleitzahl und Ort').fill('84028 Landshut')
await pdfAbschnitt.getByLabel('Telefon und E-Mail').fill('0871 1234567')
pruefe(
  (await pdfAbschnitt.getByText('Briefkopf fehlen').count()) === 0,
  'nach Eingabe der eigenen Angaben ist der Hinweis erledigt',
)

// ---------------------------------------------------------------------- PDF
const [pdf] = await Promise.all([
  seite.waitForEvent('download', { timeout: 30000 }),
  pdfAbschnitt.getByRole('button', { name: 'PDF erstellen' }).click(),
])
const pfad = await pdf.path()
pruefe(!!pfad, `PDF wird erzeugt (${pdf.suggestedFilename()})`)
if (pfad) {
  const { readFileSync } = await import('node:fs')
  const inhalt = readFileSync(pfad)
  pruefe(inhalt.subarray(0, 5).toString('latin1') === '%PDF-', 'Datei ist ein gültiges PDF')
  pruefe(inhalt.length > 20000, `PDF hat Inhalt (${Math.round(inhalt.length / 1024)} kB)`)
}

// ------------------------------------------------------------- Datensicherung
const [json] = await Promise.all([
  seite.waitForEvent('download', { timeout: 15000 }),
  seite.getByRole('button', { name: 'Daten sichern' }).click(),
])
pruefe(json.suggestedFilename().endsWith('.json'), 'Sicherungsdatei wird erzeugt')

// -------------------------------------------------------------- Nachmessung
await seite.getByRole('button', { name: 'Ändern' }).click()
await seite.getByRole('button', { name: /Nachmessung anlegen/ }).click()
await seite.getByRole('button', { name: 'Messen' }).click()
await seite.waitForSelector('h2:has-text("Prozess")')
await abschnitt('Prozess').getByRole('button', { name: 'Angebot schreiben' }).click()
const nachSchritte = abschnitt('Arbeitsschritte in')
pruefe(
  (await nachSchritte.getByRole('button', { name: /Aufmaß ins Angebot übertragen/ }).count()) === 1,
  'Nachmessung übernimmt die Arbeitsschritte',
)
pruefe(
  (await nachSchritte.getByText('noch nicht gemessen').count()) === 1,
  'Nachmessung enthält keine alten Zeiten',
)

await seite.getByRole('button', { name: 'Auswerten' }).click()
pruefe(
  (await seite.locator('h2:has-text("Erstmessung und Nachmessung im Vergleich")').count()) === 1,
  'Vergleich beider Messungen erscheint',
)

await browser.close()
console.log(
  fehler.length === 0
    ? `\nAlle ${nummer} Prüfungen bestanden.`
    : `\n${fehler.length} von ${nummer} Prüfungen fehlgeschlagen:\n– ${fehler.join('\n– ')}`,
)
process.exit(fehler.length === 0 ? 0 : 1)
