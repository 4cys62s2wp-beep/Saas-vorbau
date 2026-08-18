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

/** Erscheint 1:1 im PDF-Quellenblock. Vollbelege: QUELLEN.md im Projekt. */
export const QUELLEN_ANNAHMEN: QuellenEintrag[] = [
  {
    thema: 'Stundensatz-Schema',
    aussage:
      'Interner Kostensatz nach HWK-Standardschema: Lohnkosten + Gemeinkosten je produktive Stunde, OHNE Gewinn/Wagnis — konservative Basis der Ersparnis-Rechnung',
    quelle: 'HWK Ostmecklenburg-Vorpommern / HWK zu Leipzig / HWK Cottbus (Kalkulationsschemata)',
    url: 'https://www.hwk-leipzig.de/artikel/kostenrechnung-und-kalkulation-3,0,361.html',
    stand: 'abgerufen 08/2026',
    status: 'TEILVERIFIZIERT',
  },
  {
    thema: 'Lohnnebenkosten',
    aussage:
      'Direkte Arbeitgeber-SV-Anteile 2026: RV 9,3 % + KV 7,3 % + ½ Zusatzbeitrag 1,45 % + PV 1,8 % + AV 1,3 % = 21,15 %; zzgl. U1/U2 (kassenindividuell), U3 0,15 %, Berufsgenossenschaft → Zuschlag typ. 22–28 %',
    quelle: 'RVBeitrSBek 2026 (gesetze-im-internet), BMG/vdek, DGUV, Haufe',
    url: 'https://www.gesetze-im-internet.de/rvbeitrsbek_2026/BJNR1230A0025.html',
    stand: '2026',
    status: 'VERIFIZIERT',
  },
  {
    thema: 'Lohnnebenkosten-Benchmark',
    aussage:
      'Destatis: 29 € Lohnnebenkosten je 100 € Bruttoverdienst (2024) — nur Vergleichswert, kein Kalkulationszuschlag (andere Abgrenzung: enthält bezahlte Ausfalltage)',
    quelle: 'Destatis, Pressemitteilung Nr. 154',
    url: 'https://www.destatis.de/DE/Presse/Pressemitteilungen/2025/04/PD25_154_624.html',
    stand: '30.04.2025 (Berichtsjahr 2024)',
    status: 'TEILVERIFIZIERT',
  },
  {
    thema: 'Produktive Stunden',
    aussage:
      'Kammerbelegte Referenz: 1.455 h (HWK OMV/Leipzig) bis 1.503 h (HWK Köln, Leistungsgrad 0,85) verrechenbare Stunden je Mitarbeiter und Jahr; Plausibilitätskorridor 1.350–1.550 h',
    quelle: 'HWK zu Köln (Viehl, 2016), HWK zu Leipzig / HWK OMV (Schemata)',
    url: 'https://www.hwk-koeln.de/downloads/kalkulieren-aber-richtig-t-viehl-hwk-32,968.pdf',
    stand: '2016 / abgerufen 08/2026',
    status: 'VERIFIZIERT',
  },
  {
    thema: 'Urlaubstage',
    aussage: 'Durchschnittlicher Urlaubsanspruch 29,8 Arbeitstage (2023); 75 % der Beschäftigten haben 30 Tage; gesetzliches Minimum 20 Arbeitstage (§ 3 BUrlG, wörtlich geprüft)',
    quelle: 'IAB (Online-Personenbefragung) / BUrlG',
    url: 'https://iab-forum.de/unbefristet-beschaeftigte-haben-im-schnitt-30-urlaubstage-pro-jahr-fast-zwei-mehr-als-befristet-beschaeftigte/',
    stand: 'Datenjahr 2023',
    status: 'VERIFIZIERT',
  },
  {
    thema: 'Feiertage Bayern',
    aussage: '13 gesetzliche Feiertage (Augsburg 14); davon fallen im langjährigen Mittel ca. 11 auf Werktage (Spannweite 8–12, z. B. 2026: 9)',
    quelle: 'Bayer. Staatsministerium des Innern / Kalenderberechnung',
    url: 'https://www.stmi.bayern.de/staat-und-verfassung/feiertage/',
    stand: 'laufend / berechnet 08/2026',
    status: 'VERIFIZIERT',
  },
  {
    thema: 'Krankheitstage Bayern',
    aussage: 'TK-versicherte Erwerbspersonen Bayern 2024: 16,1 AU-Kalendertage ≈ 11–12 Arbeitstage (Bund je nach Kasse 14,8–23,9 Kalendertage — Spannweite durch Erfassungsmethodik)',
    quelle: 'TK Länderreport Bayern 2025; Destatis Krankenstand; AOK/BKK/DAK',
    url: 'https://www.tk.de/resource/blob/2194030/b28ff98a4fa487a1919d3c5552f29838/laenderreport-2025-bayern-data.pdf',
    stand: 'Datenjahr 2024',
    status: 'TEILVERIFIZIERT',
  },
  {
    thema: 'Median statt Mittelwert',
    aussage: 'Median hat Bruchpunkt 50 % (maximal robust), Mittelwert 1/n → 0: ein einziger untypischer Messwert kann den Durchschnitt beliebig verfälschen — deshalb rechnet das Tool je Schritt mit dem Median',
    quelle: 'Wilcox (Robust Estimation, via RobustStats.jl), Irizarry (dsbook), Uni-Skripte Geyer/Stark',
    url: 'https://www.stat.umn.edu/geyer/f07/5601/notes/break.pdf',
    stand: 'Lehrbuchstand, geprüft 08/2026',
    status: 'VERIFIZIERT',
  },
  {
    thema: 'Messreihen-Warnschwelle',
    aussage:
      'Warnung unter 5 Messungen je Schritt: begründete Konvention der Arbeitsmessung (üblich 95 % Konfidenz/±5 %; REFA arbeitet iterativ ohne fixe Mindestzahl; Organisationshandbuch des Bundes: statistisch abgesichert erst ab ca. 30 Messungen)',
    quelle: 'REFA-Lexikon; Organisationshandbuch des Bundes (BMI/BVA)',
    url: 'https://www.orghandbuch.de/Webs/OHB/DE/OrganisationshandbuchNEU/2_Organisationsmanagement/2_4_Ressourcen/2_4_3_Leitfaden/2_4_3_11_Methoden%20der%20PBE/2_4_3_11_4_Zeitaufnahme/Zeitaufnahme-node.html',
    stand: 'abgerufen 08/2026',
    status: 'TEILVERIFIZIERT',
  },
  {
    thema: 'Ausreißerbehandlung',
    aussage: 'Auffällige Messwerte werden markiert (Tukey-Zäune), aber nur mit dokumentierbarem Störgrund gestrichen — REFA-Praxis: Störungen während der Messung protokollieren, Streuung durch mehr Messungen beantworten',
    quelle: 'REFA-Lexikon (Verteilzeitstudie/Zeitdatenermittlung); Orghandbuch Zeitaufnahme',
    url: 'https://refa.de/service/refa-lexikon/zeitdatenermittlung',
    stand: 'abgerufen 08/2026',
    status: 'TEILVERIFIZIERT',
  },
  {
    thema: 'Angebotsbindung',
    aussage: 'Ein Angebot ist per Gesetz bindend (§ 145 BGB); die Bindefrist kann frei bestimmt werden (§ 148 BGB) — dieses Dokument nennt daher eine explizite Frist (Rechtsprechungs-Richtwert: ca. 14 Tage)',
    quelle: '§§ 145–150 BGB (Spiegel bundestag/gesetze, wörtlich gelesen; seit 01.01.2002 unverändert)',
    url: 'https://www.gesetze-im-internet.de/bgb/__145.html',
    stand: 'Fassung seit 2002, geprüft 08/2026',
    status: 'VERIFIZIERT',
  },
  {
    thema: 'Kleinunternehmerregelung',
    aussage: '§ 19 UStG i. d. F. des JStG 2024 (ab 01.01.2025): Umsätze steuerfrei; Grenzen 25.000 € (Vorjahr) / 100.000 € (laufendes Jahr), netto, Ist-Betrachtung; im Gründungsjahr gilt 25.000 € ohne Hochrechnung; kein USt-Ausweis',
    quelle: '§ 19 UStG n. F. (tagesaktueller Spiegel, wörtlich gelesen); IHK München; BMF-Schreiben 18.03.2025',
    url: 'https://www.gesetze-im-internet.de/ustg_1980/__19.html',
    stand: 'Fassung ab 01.01.2025, geprüft 08/2026',
    status: 'VERIFIZIERT',
  },
  {
    thema: 'Datenschutz der Messung',
    aussage:
      'Schrittzeiten in Kleinbetrieben gelten als personenbezogen (ErwGr 26 DSGVO); erhoben wird ohne Personenbezug im Datenmodell, Zweck: Prozessoptimierung (keine Leistungskontrolle); Rechtsgrundlage Art. 6 Abs. 1 lit. f DSGVO, hilfsweise § 26 BDSG; Information der Mitarbeiter nach Art. 13 vor der Messung',
    quelle: 'DSGVO/BDSG (Spiegel wörtlich gelesen); DSK-Kurzpapiere 13/14; LfDI BW zu EuGH C-34/21',
    url: 'https://www.datenschutzkonferenz-online.de/media/kp/dsk_kpnr_14.pdf',
    stand: 'geprüft 08/2026',
    status: 'VERIFIZIERT',
  },
  {
    thema: 'Zahlenformatierung',
    aussage: 'Formatierung nach DIN 5008:2020-03: Geldbeträge „1.234,56 €" (Punktgliederung, Währung nachgestellt), Prozent mit Leerzeichen, geschützte Leerzeichen zwischen Zahl und Einheit, Datum TT.MM.JJJJ bzw. JJJJ-MM-TT',
    quelle: 'DIN 5008:2020-03 (Normtext kostenpflichtig; übereinstimmende Sekundärwiedergaben)',
    url: 'https://www.dinmedia.de/en/standard/din-5008/318422674',
    stand: '2020-03',
    status: 'TEILVERIFIZIERT',
  },
  {
    thema: 'Sicherheitsabschlag',
    aussage:
      'Für die Höhe des Abschlags existiert KEIN normierter Standardwert — er wird deshalb je Audit begründet festgelegt (Begründung siehe oben im Rechenweg). Die Methode selbst ist belegt: Risikoabschlag auf geschätzte Einzahlungen nach dem Korrekturverfahren der Wirtschaftlichkeitsuntersuchung, gestützt auf den Rechtsgedanken des kaufmännischen Vorsichtsprinzips (§ 252 Abs. 1 Nr. 4 HGB)',
    quelle: 'Organisationshandbuch des Bundes Kap. 6.5.1; BMF-Arbeitsanleitung zu § 7 BHO; § 252 HGB (wörtlich geprüft)',
    url: 'https://www.orghandbuch.de/Webs/OHB/DE/Organisationshandbuch/6_MethodenTechniken/65_Wirtschaftlichkeitsuntersuchung/651_Quantitative/quantitative_inhalt.html',
    stand: 'BMF-VV 20.12.2013 / geprüft 08/2026',
    status: 'VERIFIZIERT',
  },
  {
    thema: 'Datensicherheit iPad',
    aussage:
      'IndexedDB ist Best-Effort-Speicher: Home-Screen-Web-Apps sind von der 7-Tage-Löschregel ausgenommen (WebKit 2020), aber Speicherdruck-Eviction und belegte WebKit-Bugs können Daten löschen → regelmäßiger JSON-Export ist Pflicht-Arbeitsschritt',
    quelle: 'MDN Storage-Doku (Quellspiegel wörtlich gelesen); WebKit-Blog 10218/14403; WebKit-Bug 266559',
    url: 'https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria',
    stand: 'geprüft 08/2026',
    status: 'VERIFIZIERT',
  },
]

/**
 * Belegbare Begründungslogiken für den Konservativ-Abschlag (QUELLEN.md Thema 11).
 * Werden im UI als Textvorschläge angeboten — die konkrete Begründung schreibt
 * der Nutzer selbst, denn nur er kennt den Betrieb.
 *
 * BEWUSST NICHT enthalten: Prozentwerte aus Lernkurven-/J-Kurven-Literatur —
 * dafür konnte keine Primärquelle verifiziert werden (QUELLEN.md Thema 11).
 */
export const KONSERVATIV_BEGRUENDUNGEN: string[] = [
  'Risikoabschlag nach dem Korrekturverfahren der Wirtschaftlichkeitsuntersuchung: geschätzte Einsparungen werden gekürzt, weil die Messreihe klein ist (n je Schritt unter 30).',
  'Kaufmännisches Vorsichtsprinzip (Rechtsgedanke § 252 Abs. 1 Nr. 4 HGB): noch nicht realisierte Vorteile werden zurückhaltend angesetzt.',
  'Umstellungs- und Einlernphase: im ersten Jahr wird die volle Zeitersparnis nicht erreicht (qualitativ angesetzt, ohne Literaturwert).',
  'Häufigkeit pro Monat beruht auf Angabe des Betriebs bzw. saisonaler Schätzung, nicht auf Messung.',
]

/**
 * Rechtliche Hinweise für das Angebots-/Ergebnis-PDF (Belege: QUELLEN.md Themen 5–7).
 * Formulierungen sind editierbar; Rechtsgrundlagen stehen in QUELLEN.md.
 */
export const ANGEBOT_HINWEISE: string[] = [
  'Bindefrist: An die im Preisband genannten Konditionen halte ich mich 14 Tage ab Ausstellungsdatum gebunden (§ 148 BGB).',
  'Kein Ausweis von Umsatzsteuer: Es gilt die Steuerbefreiung für Kleinunternehmer (§ 19 UStG). Alle Beträge sind Nettobeträge ohne Umsatzsteuer.',
  'Datenerhebung: Alle Prozesszeiten wurden vor Ort gemessen. Erfasst wurden Arbeitsschritte, keine Personen; Zweck ist ausschließlich die Prozessoptimierung, keine individuelle Leistungskontrolle. Die Mitarbeiter wurden vor der Messung informiert (Art. 13 DSGVO).',
]

/**
 * Absenderangaben fürs PDF. Pflicht laut IHK-Auffassung (QUELLEN.md Thema 5):
 * ausgeschriebener Vor- und Nachname + ladungsfähige Anschrift (kein Postfach).
 * TODO(Nutzer): eigene Daten eintragen — bewusst nicht erfunden.
 */
export const ABSENDER = {
  name: '',
  strasse: '',
  ort: '',
  kontakt: '',
}
