// Smoke-Test: kompletter Nutzerdurchlauf Erfassung → Kalkulation im echten Browser.
import { chromium } from 'playwright-core'

const fehler = []
const pruefe = (bedingung, text) => {
  if (bedingung) console.log('  OK  ' + text)
  else { fehler.push(text); console.log('  FEHLER  ' + text) }
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const seite = await browser.newPage({ viewport: { width: 1024, height: 1200 } })
seite.on('pageerror', (e) => fehler.push('pageerror: ' + e.message))
seite.on('dialog', (d) => d.accept())

await seite.goto('http://localhost:4173/')
await seite.waitForSelector('text=Prozess-Audit')
pruefe(true, 'App lädt')

// Audit anlegen
await seite.fill('input[placeholder^="Betrieb"]', 'Testbetrieb Huber')
await seite.fill('input[placeholder^="Gewerk"]', 'SHK')
await seite.click('button:has-text("Audit anlegen")')
await seite.waitForSelector('text=Testbetrieb Huber — Baseline')
pruefe(true, 'Audit angelegt und aktiv')

// Prozess anlegen
await seite.fill('input[placeholder^="Prozessname"]', 'Angebot erstellen')
await seite.fill('input[placeholder="×/Monat"]', '20')
await seite.click('section:has(h3:text("Prozesse")) button:has-text("+")')
await seite.waitForSelector('button:has-text("Angebot erstellen")')
pruefe(true, 'Prozess angelegt')

// Schritt anlegen
await seite.fill('input[placeholder^="Schrittname"]', 'Aufmaß übertragen')
await seite.click('section:has(h3:has-text("Schritte")) button:has-text("+")')
await seite.waitForSelector('h3:has-text("Messen")')
pruefe(true, 'Schritt angelegt, Messbereich sichtbar')

// Stoppuhr: 3 Messungen (Start → Runde → Runde → Stopp)
await seite.click('button:has-text("Start")')
await seite.waitForTimeout(400)
await seite.click('button:has-text("Runde")')
await seite.waitForTimeout(400)
await seite.click('button:has-text("Runde")')
await seite.waitForTimeout(400)
await seite.click('button:has-text("Stopp")')
const chips = await seite.locator('section:has(h3:has-text("Messen")) button.font-mono').count()
pruefe(chips === 3, `3 Messungen erfasst (gefunden: ${chips})`)
const warnung = await seite.locator('text=unterhalb dieser Schwelle').count()
pruefe(warnung === 1, 'Warnschwelle (< 5 Messungen) wird angezeigt')

// Reload: Autosave/IndexedDB muss die Daten halten
await seite.reload()
await seite.waitForSelector('text=Prozess-Audit')
await seite.click('button:has-text("Neu / Wechseln")')
const daNachReload = await seite.locator('button:has-text("Testbetrieb Huber")').count()
pruefe(daNachReload >= 1, 'Audit überlebt Reload (IndexedDB-Autosave)')

// Kalkulation
await seite.click('nav button:has-text("Kalkulation")')
await seite.selectOption('select', { index: 1 })
await seite.waitForSelector('h3:has-text("Interner Stundensatz")')
pruefe(true, 'Kalkulation zeigt gewähltes Audit')

// Stundensatz setzen, Schritt automatisierbar schalten
await seite.fill('input[placeholder="z. B. 52,84"]', '60')
await seite.click('td button:has-text("nein")')
const toggle = await seite.locator('td button:has-text("ja")').count()
pruefe(toggle === 1, 'Toggle automatisierbar funktioniert')

// Ergebnisblock zeigt Ersparnis > 0 € (Restaufwand-Default 100 % → erst Slider bewegen)
await seite.locator('input[type="range"]').fill('20')
const ergebnis = await seite.locator('section:has(h3:text("Ergebnis"))').textContent()
pruefe(/Preisband/.test(ergebnis ?? ''), 'Ergebnisblock mit Preisband da')
pruefe(!/NaN/.test(ergebnis ?? ''), 'keine NaN im Ergebnisblock')

// Konservativ-Faktor + Begründung
await seite.fill('section:has(h3:has-text("Konservativ-Abschlag")) input', '0,8')
await seite.fill('textarea', 'Kleine Stichprobe (n=3), Einlernphase')
const rotWeg = await seite.locator('text=Begründung fehlt').count()
pruefe(rotWeg === 0, 'Begründungs-Pflichthinweis verschwindet nach Eingabe')

// PDF-Export anstoßen (Download-Event abwarten)
const [download] = await Promise.all([
  seite.waitForEvent('download', { timeout: 20000 }),
  seite.click('button:has-text("PDF exportieren")'),
])
const pfad = await download.path()
pruefe(!!pfad, 'PDF-Download ausgelöst: ' + download.suggestedFilename())
if (pfad) {
  const { readFileSync } = await import('node:fs')
  const kopf = readFileSync(pfad).subarray(0, 5).toString('latin1')
  pruefe(kopf === '%PDF-', 'Datei ist ein echtes PDF (Signatur %PDF-)')
}

// JSON-Export
const [jsonDl] = await Promise.all([
  seite.waitForEvent('download', { timeout: 10000 }),
  seite.click('button:has-text("Export JSON")'),
])
pruefe((jsonDl.suggestedFilename() ?? '').endsWith('.json'), 'JSON-Export ausgelöst')

await browser.close()
console.log(fehler.length === 0 ? '\nSMOKE-TEST: ALLES GRÜN' : `\nSMOKE-TEST: ${fehler.length} FEHLER`)
process.exit(fehler.length === 0 ? 0 : 1)
