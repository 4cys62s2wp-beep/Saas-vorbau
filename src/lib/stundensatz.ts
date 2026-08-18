import type { StundensatzEingaben } from '../types'

/**
 * Kalkulatorischer interner Stundensatz (Kostensatz, ohne Gewinn/Wagnis).
 *
 * Schema (Herleitung und Belege: QUELLEN.md Themen 1–3):
 *   Personalkosten/Jahr = Bruttojahreslohn × (1 + Lohnnebenkosten%)
 *   Gemeinkosten/Jahr   = Personalkosten × Gemeinkosten%
 *   Stundensatz         = (Personalkosten + Gemeinkosten) / produktive Stunden
 *
 * Für eine ERSPARNIS-Rechnung ist der interne Kostensatz die konservative
 * Wahl — der Kunden-Verrechnungssatz (inkl. Gewinn/Wagnis) würde die
 * Ersparnis überhöhen.
 */
export interface StundensatzErgebnis {
  personalkostenProJahr: number
  gemeinkostenProJahr: number
  gesamtkostenProJahr: number
  stundensatz: number
}

/**
 * Prüft die vier Eingaben des Rechners und gibt sie nur vollständig zurück.
 * Fehlt eine oder ist sie unbrauchbar, wird nicht gerechnet — eine halbe
 * Grundlage ergibt einen falschen Stundensatz.
 */
export function leseStundensatzEingaben(werte: {
  bruttoJahreslohn: number | null
  lohnnebenkostenProzent: number | null
  gemeinkostenProzent: number | null
  produktiveStundenProJahr: number | null
}): StundensatzEingaben | null {
  const { bruttoJahreslohn, lohnnebenkostenProzent, gemeinkostenProzent, produktiveStundenProJahr } =
    werte
  if (
    bruttoJahreslohn === null ||
    lohnnebenkostenProzent === null ||
    gemeinkostenProzent === null ||
    produktiveStundenProJahr === null ||
    produktiveStundenProJahr <= 0
  ) {
    return null
  }
  return {
    bruttoJahreslohn,
    lohnnebenkostenProzent,
    gemeinkostenProzent,
    produktiveStundenProJahr,
  }
}

export function berechneStundensatz(e: StundensatzEingaben): StundensatzErgebnis {
  if (e.bruttoJahreslohn < 0) throw new Error('Stundensatz: Bruttojahreslohn darf nicht negativ sein')
  if (e.lohnnebenkostenProzent < 0) throw new Error('Stundensatz: Lohnnebenkosten dürfen nicht negativ sein')
  if (e.gemeinkostenProzent < 0) throw new Error('Stundensatz: Gemeinkosten dürfen nicht negativ sein')
  if (e.produktiveStundenProJahr <= 0) {
    throw new Error('Stundensatz: produktive Stunden pro Jahr müssen > 0 sein')
  }
  const personalkostenProJahr = e.bruttoJahreslohn * (1 + e.lohnnebenkostenProzent / 100)
  const gemeinkostenProJahr = personalkostenProJahr * (e.gemeinkostenProzent / 100)
  const gesamtkostenProJahr = personalkostenProJahr + gemeinkostenProJahr
  return {
    personalkostenProJahr,
    gemeinkostenProJahr,
    gesamtkostenProJahr,
    stundensatz: gesamtkostenProJahr / e.produktiveStundenProJahr,
  }
}
