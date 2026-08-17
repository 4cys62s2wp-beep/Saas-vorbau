/**
 * Zahlen-/Währungs-/Datumsformatierung für UI und PDF.
 * Basis: Intl mit de-DE (Dezimalkomma, Tausenderpunkt). Die DIN-5008-Details
 * (Belege und ggf. Abweichungen) stehen in QUELLEN.md Thema 8 — Kernpunkte:
 * Währungszeichen hinter dem Betrag mit Leerzeichen, Datum JJJJ-MM-TT oder
 * TT.MM.JJJJ, Prozent mit Leerzeichen vor dem Zeichen.
 */

const zahlFormat = new Map<number, Intl.NumberFormat>()

export function formatiereZahl(wert: number, dezimalen = 0): string {
  let f = zahlFormat.get(dezimalen)
  if (!f) {
    f = new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: dezimalen,
      maximumFractionDigits: dezimalen,
    })
    zahlFormat.set(dezimalen, f)
  }
  return f.format(wert)
}

export function formatiereEuro(wert: number): string {
  // Bewusst "1.234,56 €" (Zeichen nachgestellt, geschütztes Leerzeichen) — de-DE-Standard.
  return `${formatiereZahl(wert, 2)} €`
}

export function formatiereProzent(wert: number, dezimalen = 0): string {
  return `${formatiereZahl(wert, dezimalen)} %`
}

export function formatiereMinuten(wert: number): string {
  return `${formatiereZahl(wert, 1)} min`
}

export function formatiereStunden(wert: number): string {
  return `${formatiereZahl(wert, 1)} h`
}

/** Sekunden einer Messung: unter 100 s mit einer Dezimalen, sonst ganz. */
export function formatiereSekunden(wert: number): string {
  return `${formatiereZahl(wert, wert < 100 ? 1 : 0)} s`
}

/** ISO-Datum (JJJJ-MM-TT) → TT.MM.JJJJ für Briefe/PDF. */
export function formatiereDatum(iso: string): string {
  const teile = iso.slice(0, 10).split('-')
  if (teile.length !== 3) return iso
  return `${teile[2]}.${teile[1]}.${teile[0]}`
}
