/**
 * Quellen- und Annahmenblock fürs PDF — gespeist aus QUELLEN.md.
 * REGEL: Hier steht nur, was in QUELLEN.md belegt oder ausdrücklich als
 * unverifiziert gekennzeichnet ist. Wird zusammen mit QUELLEN.md gepflegt.
 */

export type QuellenStatus = 'VERIFIZIERT' | 'TEILVERIFIZIERT' | 'NICHT VERIFIZIERT'

export interface QuellenEintrag {
  thema: string
  aussage: string
  quelle: string
  url: string
  stand: string
  status: QuellenStatus
}

/**
 * Wird nach Abschluss der Recherche (QUELLEN.md) befüllt — die Einträge hier
 * erscheinen 1:1 im PDF-Quellenblock. Bis dahin druckt das PDF den Hinweis
 * aus QUELLEN_PLATZHALTER.
 */
export const QUELLEN_ANNAHMEN: QuellenEintrag[] = []

export const QUELLEN_PLATZHALTER =
  'Quellen- und Annahmenblock: siehe QUELLEN.md im Projekt (wird mit Abschluss der Recherche eingespielt).'

/**
 * Rechtliche Hinweise für das Angebots-PDF (Belege: QUELLEN.md Themen 5–6).
 * Wird zusammen mit QUELLEN.md finalisiert.
 */
export const ANGEBOT_HINWEISE: string[] = []

/**
 * Absenderangaben fürs PDF (Pflichtangaben Geschäftsbrief, QUELLEN.md Thema 5).
 * TODO(Nutzer): eigene Daten eintragen — bewusst nicht erfunden.
 */
export const ABSENDER = {
  name: '',
  strasse: '',
  ort: '',
  kontakt: '',
}
