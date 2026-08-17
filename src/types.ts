/**
 * Datenmodell laut Auftrag (bindend).
 *
 * Prozesszeiten sind ausschließlich gemessene Werte (messungenSek) — es gibt
 * bewusst keinerlei Fallback- oder Branchenwerte im Modell. Kennzahlen werden
 * abgeleitet, nie gespeichert (siehe lib/kennzahlen.ts).
 */

export type Phase = 'baseline' | 'nachmessung'

export interface Schritt {
  id: string
  name: string
  /** Rohmessungen in Sekunden, eine je Stoppuhr-Lap. Reihenfolge = Messreihenfolge. */
  messungenSek: number[]
  automatisierbar: boolean
  /** Verbleibender Aufwand nach Automatisierung, 0–100 (%). Nur relevant wenn automatisierbar. */
  restaufwandProzent: number
}

export interface Prozess {
  id: string
  name: string
  haeufigkeitProMonat: number
  schritte: Schritt[]
}

export interface Audit {
  id: string
  betrieb: string
  gewerk: string
  /** ISO-Datum (JJJJ-MM-TT) */
  datum: string
  phase: Phase
  /** €/h intern (Kostensatz, nicht Kunden-Verrechnungssatz). Aus Stundensatzrechner oder manuell. */
  stundensatzIntern: number
  /**
   * Abschlagsfaktor 0–1 auf die Jahresersparnis. Bewusst KEIN Default:
   * Pflicht-Eingabe mit Begründung, die im PDF mitgedruckt wird.
   */
  konservativFaktor: number
  /** Pflicht-Begründung für den gewählten konservativFaktor (geht ins PDF). */
  konservativBegruendung: string
  prozesse: Prozess[]
}

/** Eingaben des Stundensatzrechners (Herleitung siehe QUELLEN.md, Thema 1–3). */
export interface StundensatzEingaben {
  /** Brutto-Jahreslohn eines produktiven Mitarbeiters in € (ohne AG-Nebenkosten). */
  bruttoJahreslohn: number
  /** Lohnnebenkostenzuschlag in % auf den Bruttolohn (AG-Anteile SV, Umlagen, BG …). */
  lohnnebenkostenProzent: number
  /** Gemeinkostenzuschlag in % auf die Personalkosten (Miete, Fahrzeuge, Verwaltung …). */
  gemeinkostenProzent: number
  /** Produktive (verrechenbare) Stunden pro Jahr und Mitarbeiter. */
  produktiveStundenProJahr: number
}

/** Export-Container für JSON-Transfer iPad → Mac. */
export interface AuditExport {
  formatVersion: 1
  exportiertAm: string
  audits: Audit[]
}
