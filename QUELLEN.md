# QUELLEN.md — Belegsammlung für jede im Tool verwendete Zahl

Stand: 2026-08-17. Erstellt durch Recherche mit Websuche + direktem Gegenlesen von
GitHub-Spiegeln; jedes Thema wurde zusätzlich von einem unabhängigen Gegenprüfer
adversarial geprüft (Vermerk je Thema).

## Verifikationsstufen (gelten im ganzen Dokument und im PDF-Quellenblock)

- **VERIFIZIERT** — wörtlich aus einer direkt gelesenen Primärquelle (GitHub-Spiegel
  von Gesetzen/MDN/Repos) ODER identische Zahl aus mehreren unabhängigen
  primärquellennahen Suchtreffern mit explizitem Wert.
- **TEILVERIFIZIERT** — Primärquelle mit URL benannt, Wert aus Suchzusammenfassungen
  belegt, Seite selbst in dieser Arbeitsumgebung nicht abrufbar (Egress-Sperre,
  siehe OPEN.md O1). Jede URL ist in unter einer Minute von Hand gegenprüfbar.
- **NICHT VERIFIZIERT** — nicht belastbar belegbar. Solche Größen sind im Tool
  **freie Eingabefelder ohne Default**, nie Code-Konstanten.

**Wichtige Einschränkung zur Arbeitsumgebung:** Direkt lesbar waren nur
github.com/raw.githubusercontent.com. Gesetzestexte wurden über die Spiegel
`bundestag/gesetze` (Achtung: für UStG/UStDV veraltet, Stand 2021!) und
`kmein/gesetze` (täglicher Scrape von gesetze-im-internet.de, Refresh-Commit
04.05.2026) wörtlich gelesen. Destatis-, HWK-, WebKit-, REFA- und DIN-Seiten waren
gesperrt und sind über Suchtreffer belegt → maximal TEILVERIFIZIERT.

---

## Thema 1: Kalkulatorischer Stundensatz im Handwerk

**Kernaussagen**

1. **[VERIFIZIERT]** Das HWK-Standardschema ist mehrstufig:
   *Lohnkosten je produktive Stunde (Fertigungslohn + Lohnzusatzkosten) +
   Gemeinkosten je produktive Stunde (inkl. kalkulatorischer Kosten) =
   **Selbstkostensatz** → + Gewinn/Wagnis = **Stundenverrechnungssatz (SVS)***.
   - HWK Ostmecklenburg-Vorpommern, Schema-PDF — https://www.hwk-omv.de/downloads/stundenverrechnungssatz-18,797.pdf (o. J., abgerufen 08/2026; Kammer-Arbeitsblatt)
   - HWK Cottbus, Beispielrechnung — https://www.hwk-cottbus.de/downloads/kalkulation-svs-7,1375.pdf (o. J., abgerufen 08/2026)
   - HWK zu Leipzig, Kostenrechnung und Kalkulation — https://www.hwk-leipzig.de/artikel/kostenrechnung-und-kalkulation-3,0,361.html (laufend gepflegt)
   - Bayerische Kammer (Methode, ohne Zahlenbeispiel): HWK Niederbayern-Oberpfalz — https://www.hwkno.de/artikel/der-stundenverrechnungssatz-76,3326,998.html
2. **[VERIFIZIERT]** **Selbstkostensatz vs. SVS:** Der Selbstkostensatz deckt alle
   Kosten OHNE Gewinn; der SVS ist der Kundenpreis (Selbstkosten + ~5–8,4 %
   Gewinn/Wagnis in den Kammer-Beispielen). **Für die Ersparnis-Rechnung des
   Audit-Tools ist der interne Selbstkostensatz die fachlich saubere, konservative
   Basis** — der SVS würde die Ersparnis um den Gewinnzuschlag überhöhen.
   (Quellen wie oben; Gewinnzuschlag-Spannweite: 5 % HWK-OMV bis 8,4 % HWK Cottbus.)
3. **[NICHT VERIFIZIERT]** Ein pauschaler **Gemeinkostenzuschlag** ist nicht
   belegbar (Sekundärquellen streuen 25–100 % mit unklarer Basis). → Im Tool ist
   der Gemeinkostenzuschlag ein **freies Eingabefeld** („aus BWA/EÜR des
   Betriebs"), kein Default.
4. **[NICHT VERIFIZIERT]** Faustformel „Bruttolohn × 1,8" stammt nur aus
   Software-Anbieter-Blogs → wird im Tool **nicht** verwendet.
5. **[TEILVERIFIZIERT]** Zusammensetzung einer Handwerkerstunde (HWK-Wiesbaden-Flyer
   01/2023): Bruttolohn ~38 %, Sozialaufwendungen ~24 %, … Gewinn nur ~2 %.
   Nur als erklärende Kontextzahl geeignet.
   - https://www.hwk-wiesbaden.de/downloads/wie-viel-kostet-eine-handwerkerstunde-44,3614.pdf

**Konsequenz fürs Tool (umgesetzt):** `src/lib/stundensatz.ts` rechnet
Bruttojahreslohn × (1 + Lohnnebenkosten %) + Gemeinkostenzuschlag ÷ produktive
Stunden = **interner Kostensatz ohne Gewinn/Wagnis**; die Herleitung wird im PDF
abgedruckt. Gemeinkosten sind Pflicht-Eingabe des Nutzers aus der BWA.

---

## Thema 2: Lohnnebenkostenquote (Stand 2025/2026)

**Zwei Konzepte, die nicht vermischt werden dürfen:**

1. **[TEILVERIFIZIERT]** Destatis-Jahresschätzung: Arbeitgeber zahlten **2024 je
   100 € Bruttoverdienst zusätzlich 29 € Lohnnebenkosten**. Ältere Werte derselben
   Kennzahl: 2020 = 27 €, 2014 = 28 € → Korridor 27–30 €. Nur Benchmark, **kein
   Kalkulationszuschlag** (Destatis-Bruttoverdienste enthalten bereits bezahlte
   Ausfalltage — wer damit zuschlägt UND produktive Stunden kürzt, zählt doppelt).
   - Destatis PM Nr. 154 vom 30.04.2025 — https://www.destatis.de/DE/Presse/Pressemitteilungen/2025/04/PD25_154_624.html (Berichtsjahr 2024)
   - Destatis PM Nr. 148 April 2026 (Berichtsjahr 2025; Arbeitsstunde ⌀ 45,00 €) — https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/04/PD26_148_624.html
2. **[VERIFIZIERT]** Direkte **Arbeitgeber-SV-Anteile 2026** (je Posten belegt):
   RV 9,3 % (RVBeitrSBek 2026, gesetze-im-internet) + KV 7,3 % + ½ ⌀-Zusatzbeitrag
   1,45 % (BMG-Festlegung 2,9 % für 2026; 2025: 2,5 %) + PV 1,8 % (außer Sachsen
   1,3 %) + AV 1,3 % = **21,15 %** (2025: 20,95 %). Je nach Kasse real ~20,5–22 %.
   - RVBeitrSBek 2026 — https://www.gesetze-im-internet.de/rvbeitrsbek_2026/BJNR1230A0025.html
   - vdek zu Zusatzbeitrag 2026 — https://www.vdek.com/magazin/ausgaben/2025-06/durchschnittlicher-zusatzbeitrag-2026.html
   - Haufe Beitragssätze 2026 — https://www.haufe.de/personal/entgelt/beitragssaetze-zur-sozialversicherung_78_493770.html
3. **[VERIFIZIERT]** Insolvenzgeldumlage U3 2026: **0,15 %**.
   **[TEILVERIFIZIERT]** U1 (nur Betriebe ≤ 30 MA, kassenindividuell): ~0,8–3,5 %;
   U2: ~0,2–0,75 %. **[TEILVERIFIZIERT]** Berufsgenossenschaft: ⌀ 1,09 € je 100 €
   Entgelt (DGUV 2024) — Bau deutlich höher (gefahrklassenabhängig, grob 1–6 %).
   - DGUV Bilanz 2024 — https://www.dguv.de/de/mediencenter/pm/bilanz-2024.jsp
   - TK Insolvenzgeldumlage — https://www.tk.de/firmenkunden/versicherung/beitraege-faq/umlagen-u1-u2-und-insolvenzgeld/hoehe-insolvenzgeldumlage-2031626
4. **[TEILVERIFIZIERT]** **Der richtige Zuschlag für den Stundensatz** ist die Summe
   der DIREKTEN Arbeitgeberabgaben: 21,15 % + U1 + U2 + 0,15 % + BG ≈ **22–28 %**
   je nach Kasse/Gefahrklasse. Urlaub/Feiertage/Krankheit gehören NICHT in diesen
   Zuschlag, sondern in den Nenner (produktive Stunden) — sonst Doppelzählung.
5. **[TEILVERIFIZIERT]** Kontext Handwerk: ifh Göttingen (Deutsches
   Handwerksinstitut), Forschungsbericht Nr. 35 (2025): ⌀ 37,5 % der Gesamtkosten
   im Handwerk sind Löhne/Gehälter.
   - https://ifh.wiwi.uni-goettingen.de/site/assets/files/11609/ifh-fb_35_2025.pdf

**Konsequenz fürs Tool (umgesetzt):** UI-Feld „Lohnnebenkosten %" mit
dokumentiertem Richtwert **22–28 %** (Vorbelegung 21,15 % + BG/Umlagen nach
Beitragsbescheid des Betriebs); die Destatis-29 % erscheinen nur als erklärte
Benchmark im PDF-Quellenblock, nie in der Rechnung.

---

## Thema 3: Produktive Stunden pro Mitarbeiter und Jahr (Bayern)

**Formel (alle Komponenten belegt):**
`[365 − 104 Sa/So − Feiertage − Urlaub − Krank − Sonstiges] × h/Tag × Leistungsgrad`

1. **[VERIFIZIERT]** Mindesturlaub: 24 Werktage = **20 Arbeitstage** bei
   5-Tage-Woche (§ 3 BUrlG, **wörtlich gelesen** im Spiegel bundestag/gesetze).
   Harte UI-Untergrenze.
   - https://raw.githubusercontent.com/bundestag/gesetze/master/b/burlg/index.md
2. **[VERIFIZIERT]** Üblicher Urlaub: ⌀ **29,8 Arbeitstage** (IAB 2023; 75 % haben
   genau 30). Bau-Tarif (BRTV): 30 Tage [TEILVERIFIZIERT].
   - IAB-Forum — https://iab-forum.de/unbefristet-beschaeftigte-haben-im-schnitt-30-urlaubstage-pro-jahr-fast-zwei-mehr-als-befristet-beschaeftigte/
   - → Tool-Default 30, Spanne 20–33.
3. **[VERIFIZIERT]** Bayern hat **13 gesetzliche Feiertage** (Augsburg 14; Mariä
   Himmelfahrt nur in überwiegend katholischen Gemeinden). Davon fallen im
   langjährigen Mittel **10,7 auf Werktage** (Spannweite 8–12; 2026: 9).
   - Bayer. Innenministerium — https://www.stmi.bayern.de/staat-und-verfassung/feiertage/
   - muenchen.de — https://www.muenchen.de/aktuell/feiertage-bayern-2026-und-2027
   - → Tool-Default 11, Spanne 8–12 (Kalenderjahr-genau wählbar).
4. **[TEILVERIFIZIERT]** Krankheitstage 2024, je nach Quelle **14,8 (Destatis,
   nur AU > 3 Tage) bis 23,9 (AOK) Kalendertage**; Bayern liegt ~16 % unter dem
   Bund (TK Länderreport: 16,1 Kalendertage 2024 ≈ **11–12 Arbeitstage**).
   - Destatis Krankenstand — https://www.destatis.de/DE/Themen/Arbeit/Arbeitsmarkt/Qualitaet-Arbeit/Dimension-2/krankenstand.html
   - TK Gesundheitsreport 2025 — https://www.tk.de/resource/blob/2194002/828793b4b4a5953abece5e4874ce79b9/gesundheitsreport-au-2025-data.pdf
   - TK Länderreport Bayern — https://www.tk.de/resource/blob/2194030/b28ff98a4fa487a1919d3c5552f29838/laenderreport-2025-bayern-data.pdf
   - → Tool-Default Bayern 12 Arbeitstage, Spanne 5–18. Kassen-Kalendertage × 5/7 umrechnen!
5. **[VERIFIZIERT]** HWK-Schema-Beispiele (OMV/Leipzig, identisch): 365 − 104 = 261
   Zahltage − 24 U − 10 K − 10 F − 3 Sonst. = 214 Anwesenheitstage; **Ergebnis
   1.455 verrechenbare h**. HWK Köln (Viehl, 06.04.2016): 221 AT × 8 h ×
   **Leistungsgrad 0,85** = **1.503 h**.
   - HWK Köln — https://www.hwk-koeln.de/downloads/kalkulieren-aber-richtig-t-viehl-hwk-32,968.pdf (2016)
   - HWK Leipzig — https://www.hwk-leipzig.de/downloads/ermittlung-stundenverrechnungssatz-3,160.pdf
6. **[VERIFIZIERT]** § 3 ArbZG: 8 h werktäglich (wörtlich gelesen) → Default 8,0 h/Tag.
   - https://raw.githubusercontent.com/bundestag/gesetze/master/a/arbzg/index.md
7. **Kammerbelegte Endwerte: 1.455–1.503 h/Jahr.** Die kursierende Spanne
   „1.500–1.650 h" ist aus Kammerquellen NICHT belegt; Plausibilitätskorridor fürs
   Tool: **1.350–1.550 h**, Warnung außerhalb. Leistungsgrad: nur **0,85** ist
   kammerbelegt (Spannen 0,70–0,80 nur aus Anbieter-Blogs).

**Konsequenz fürs Tool (umgesetzt):** UI-Feld „Produktive h/Jahr" ohne stillen
Default; QUELLEN.md nennt 1.455–1.503 als belegte Referenz. (Der Komponenten-
Mini-Rechner ist als Ausbaustufe in OPEN.md notiert.)

---

## Thema 4: Median vs. Mittelwert, Mindest-Messreihenlänge, Ausreißer (REFA)

1. **[TEILVERIFIZIERT]** **REFA kennt KEINE fixe Mindestzyklenzahl.** Die
   Systematik arbeitet iterativ über den relativen Vertrauensbereich ε (üblich:
   95 % Aussagewahrscheinlichkeit); gemessen wird, bis ε klein genug ist.
   - REFA-Lexikon: https://refa.de/service/refa-lexikon/stichprobenumfang und
     https://refa-consulting.ag/refa-lexikon/r/relativer-vertrauensbereich
     (alle REFA-Gruppe, nicht unabhängig voneinander)
2. **[TEILVERIFIZIERT]** Konvention der Arbeitsmessung international: **95 %
   Konfidenz, ±5 % Genauigkeit** (ILO-Tradition; IGNOU-Lehrmaterial).
   Organisationshandbuch des Bundes (BMI/BVA): Stichprobe **mind. 30** Messungen,
   Empfehlung ~40 (davon 30 störungsfrei) für Zeitaufnahmen.
   - Orghandbuch — https://www.orghandbuch.de/Webs/OHB/DE/OrganisationshandbuchNEU/2_Organisationsmanagement/2_4_Ressourcen/2_4_3_Leitfaden/2_4_3_11_Methoden%20der%20PBE/2_4_3_11_4_Zeitaufnahme/Zeitaufnahme-node.html (Stand lt. Treffer 10/2025)
3. **[TEILVERIFIZIERT]** **Ausreißer:** kein formaler REFA-Ausreißertest belegbar.
   REFA-Praxis: lückenlose Fortschrittszeitmessung, Störungen werden WÄHREND der
   Messung als solche protokolliert; Streuung → mehr messen oder Ablauf
   stabilisieren, **nicht nachträglich streichen**.
4. **[VERIFIZIERT]** **Median statt Mittelwert bei n=3–10:** Bruchpunkt des Medians
   50 % (maximal möglich), des Mittelwerts 1/n → 0: EIN Extremwert kann den
   Mittelwert beliebig verfälschen. Direkt gelesen in zwei GitHub-Quellen
   (RobustStats.jl/Wilcox; Irizarry dsbook) + Uni-Skripte (Geyer UMN, Stark
   Berkeley, arXiv 1604.07039).
   - https://raw.githubusercontent.com/rafalab/dsbook/master/summaries/robust-summaries.Rmd
   - https://www.stat.umn.edu/geyer/f07/5601/notes/break.pdf
5. **[VERIFIZIERT]** Kleine n: unter n=2 kein Streuungsmaß; ab n=3 ist der Median
   erstmals gegen 1 Ausreißer robust; Konfidenz über t-Verteilung (df = n−1),
   t-Faktor 95 % bei n=5 noch ≈ 2,78 → kleine Reihen sind Orientierungswerte.
   Belastbare Konfidenzaussagen erst ~n≥30 (Konvention, kritisierbar).

**Warnschwellen-Empfehlung (begründete Konvention, KEINE REFA-Norm — so auch im
PDF deklarieren):** n < 3: nur „Einzelbeobachtung"; **n < 5: Warnung** (im Tool:
`MIN_MESSUNGEN_WARNSCHWELLE = 5`); n ≥ 30: statistisch abgesichert. Ausreißer
werden markiert (Tukey-Zäune), Streichen nur mit dokumentiertem Störgrund —
exakt so umgesetzt in `statistik.ts`/`kennzahlen.ts`/Erfassungs-UI.

---

## Thema 5: Angebot rechtlich — Bindefrist, „freibleibend", Pflichtangaben

1. **[VERIFIZIERT, wörtlich gelesen]** § 145 BGB: Angebot ist **per Gesetz
   bindend**, außer Bindung ausgeschlossen. § 147 II: Annahme „bis zu dem
   Zeitpunkt …, in welchem der Antragende den Eingang der Antwort unter
   regelmäßigen Umständen erwarten darf". § 148: **Bindefrist frei bestimmbar.**
   §§ 146/149/150: Erlöschen, verspätete Annahme (= neuer Antrag), Anzeigepflicht.
   - BGB-Spiegel — https://raw.githubusercontent.com/bundestag/gesetze/master/b/bgb/index.md
     (§§ 145 ff. seit 01.01.2002 unverändert; per dejure.org-Treffern bestätigt)
2. **[TEILVERIFIZIERT]** Rechtsprechungs-Richtwerte zur Annahmefrist unter
   Abwesenden: Standard ~**14 Tage**, komplexe Geschäfte bis ~4 Wochen.
   → PDF-Baustein: explizite Bindefrist, Default 14 Tage.
3. **[VERIFIZIERT]** „**freibleibend**" = kein bindender Antrag, sondern invitatio
   ad offerendum; Vertrag erst durch Bestätigung des Anbieters. Achtung
   [TEILVERIFIZIERT]: Auf Bestellung nach freibleibendem Angebot sofort reagieren —
   Schweigen kann als Annahme gewertet werden.
4. **[VERIFIZIERT]** Pflichtangaben für **nicht eingetragene Einzelunternehmer**:
   § 15b GewO ist seit 2009 aufgehoben, HGB-Briefpflichten gelten nicht.
   Erforderlich (einhellige IHK-Auffassung): **Familienname mit mind. einem
   ausgeschriebenen Vornamen + ladungsfähige Anschrift** (kein Postfach).
   **Angebote SIND Geschäftsbriefe** (auch als PDF/E-Mail).
   - IHK Darmstadt — https://www.ihk.de/darmstadt/produktmarken/recht-und-fair-play/wirtschaftsrecht/handels-gesellschaftsrecht/pflichtangaben-geschaeftspapieren-2552052
   - IHK Würzburg-Schweinfurt Merkblatt — https://www.wuerzburg.ihk.de/fileadmin/user_upload/PDF/Recht_Steuer/Merkblatt/Pflichtangaben-auf-Geschaeftsbriefen.pdf
5. **[VERIFIZIERT, wörtlich gelesen]** **DL-InfoV** gilt für Digitalisierungsberater:
   vor Vertragsschluss u. a. Name, ladungsfähige Anschrift, Kontaktdaten,
   USt-IdNr. (falls vorhanden), AGB-Hinweis. Erfüllbar direkt im Angebots-PDF.
   - DL-InfoV-Spiegel — https://raw.githubusercontent.com/bundestag/gesetze/master/d/dlinfov/index.md
     (Achtung: Spiegel-Stand 2021; spätere Änderungen — MoPeG, G v. 12.05.2026 — laut
     Suchlage für Einzelunternehmer-Pflichten ohne Belang, vor Drucklegung gegenlesen)
6. **[VERIFIZIERT]** §§ 14/14a UStG (Rechnungsnummer, Steuernummer …) gelten **nur
   für Rechnungen, nicht für Angebote**. Saubere Trennung der Dokumenttypen.

**Konsequenz fürs Tool:** PDF-Fußzeile mit Name + ladungsfähiger Anschrift
(`ABSENDER` in quellen.ts — vom Nutzer zu befüllen, bewusst nicht erfunden);
Hinweisblock mit Bindefrist- und USt-Baustein (`ANGEBOT_HINWEISE`).

---

## Thema 6: Kleinunternehmerregelung § 19 UStG (ab 01.01.2025)

Alle Kernaussagen **wörtlich gelesen** im tagesaktuellen Spiegel `kmein/gesetze`
(Refresh 04.05.2026) — der Spiegel `bundestag/gesetze` ist für UStG/UStDV
**veraltet (Stand 2021, alte Grenzen!)** und wurde nur für den Fassungsvergleich
genutzt.

1. **[VERIFIZIERT]** Seit 01.01.2025 (JStG 2024): Kleinunternehmer-Umsätze sind
   **steuerfrei** (vorher: „Steuer wird nicht erhoben"). Grenzen: **Vorjahr
   ≤ 25.000 €** UND **laufendes Jahr ≤ 100.000 €** — **Nettogrenzen**, Ist-
   Betrachtung (vereinnahmte Entgelte, § 19 Abs. 2).
   - https://raw.githubusercontent.com/kmein/gesetze/master/laws/UStG-BJNR119530979.md
   - IHK München — https://www.ihk-muenchen.de/ratgeber/steuern/steuerarten/umsatzsteuer/kleinunternehmerregelung/
   - BMF-Schreiben v. 18.03.2025 — https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Umsatzsteuer/Umsatzsteuer-Anwendungserlass/2025-03-18-sonderregelung-kleinunternehmer.pdf?__blob=publicationFile&v=3
2. **[VERIFIZIERT]** 100.000 € unterjährig gerissen → Status entfällt **sofort ab
   dem überschreitenden Umsatz** (frühere Jahresumsätze bleiben steuerfrei).
   25.000 € im laufenden Jahr überschritten (aber < 100.000) → Status bleibt bis
   Jahresende, ab 1. Januar Regelbesteuerung.
3. **[VERIFIZIERT]** **Neugründung (Anmeldung Oktober 2026):** automatisch
   Kleinunternehmer, im Gründungsjahr gilt die **25.000-€-Grenze** für den
   tatsächlichen Umsatz; die alte **Hochrechnung auf Jahresumsatz ist entfallen**
   (Fassungsvergleich alt/neu wörtlich geprüft).
   - Haufe Neugründung — https://www.haufe.de/id/beitrag/kleinunternehmer-22-umsatzgrenzen-bei-neugruendung-HI1342178.html
   - Finanzamt Hessen — https://finanzamt.hessen.de/steuern/umsatzsteuer-kleinunternehmer
4. **[VERIFIZIERT]** **Kein USt-Ausweis** (weder Satz noch Betrag, auch nicht
   „0 %"); § 34a UStDV n. F. (wörtlich gelesen) verlangt auf Rechnungen einen
   **Hinweis auf die Steuerbefreiung** ohne Formulierungsvorgabe. Verbreitetes
   Muster [TEILVERIFIZIERT]: „Für die abgerechnete Leistung gilt die
   Steuerbefreiung für Kleinunternehmer (§ 19 UStG)."
   - https://raw.githubusercontent.com/kmein/gesetze/master/laws/UStDV-BJNR023590979.md
5. **[VERIFIZIERT]** Falsch ausgewiesene USt schuldet der Kleinunternehmer
   (§ 14c Abs. 1 UStG n. F.); Empfänger hat keinen Vorsteuerabzug. → Tool erzeugt
   im Kleinunternehmer-Modus technisch keine USt-Zeile.
6. **[VERIFIZIERT]** **E-Rechnung:** Kleinunternehmer sind von der AUSSTELLUNGS-
   Pflicht dauerhaft befreit (§ 34a S. 4 UStDV, wörtlich gelesen); Empfangen können
   müssen sie E-Rechnungen trotzdem.
7. **[VERIFIZIERT]** Verzicht auf § 19 (Option Regelbesteuerung) bindet
   **mindestens 5 Kalenderjahre**, unwiderruflich (§ 19 Abs. 3 n. F.).

**Konsequenz fürs Tool (umgesetzt):** Angebots-PDF weist keinerlei USt aus;
Hinweistext in `ANGEBOT_HINWEISE`. Für die Anmeldung 10/2026 gilt die
25.000-€-Grenze im Gründungsjahr (Netto, Ist-Zufluss).

---

## Thema 7: DSGVO / § 26 BDSG — Schrittzeiten-Messung beim Kunden

1. **[VERIFIZIERT]** Schritt-Zeiten ohne Namen sind in 3–10-MA-Betrieben
   **regelmäßig personenbezogen** (ErwGr 26 DSGVO: Identifizierbarkeit mit
   verfügbaren Mitteln — Einsatzplan/Beobachtung genügt). „Schritte statt Personen
   messen" **senkt das Risiko (Datenminimierung), befreit aber nicht von der
   DSGVO** [TEILVERIFIZIERT: Aufsichts-Faustregeln, u. a. ~6-Personen-Schwelle].
   - ErwGr 26 — https://dsgvo-gesetz.de/erwaegungsgruende/nr-26/
   - EuGH C-413/23 P (04.09.2025, relativer Personenbezug) via LDI NRW — https://www.ldi.nrw.de/eugh-zu-personenbezogene-daten-und-pseudonymisierung-wichtige-klarstellungen-fuer-fachleute
   - BayLfD, Arbeitspapier „Identifizierbarkeit" (04/2026) — https://www.datenschutz-bayern.de/infothek/AP_Identifizierbarkeit.pdf
2. **[TEILVERIFIZIERT]** Rollen: Der **Betrieb ist Verantwortlicher**; der Berater
   ist je nach Vertragsgestaltung eigenständig Verantwortlicher oder
   Auftragsverarbeiter (DSK-Kurzpapier 13; BayLDA-Abgrenzungshilfe; EDSA 07/2020).
   - https://www.datenschutzkonferenz-online.de/media/kp/dsk_kpnr_13.pdf
   - https://lda.bayern.de/media/veroeffentlichungen/Abgrenzungshilfe_Auftragsverarbeitung.pdf
3. **[VERIFIZIERT, wörtlich gelesen]** § 26 Abs. 1 S. 1 BDSG erlaubt Verarbeitung,
   soweit **erforderlich**; ABER [TEILVERIFIZIERT] nach EuGH C-34/21 (30.03.2023)
   ist die Norm als Generalklausel angreifbar → Rechtsgrundlage **zweigleisig**
   nennen: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse, dokumentierte
   Abwägung) hilfsweise § 26 BDSG.
   - BDSG-Spiegel — https://raw.githubusercontent.com/bundestag/gesetze/master/b/bdsg_2018/index.md
   - LfDI BW FAQ — https://www.baden-wuerttemberg.datenschutz.de/faq-rechtsgrundlagen-bei-beschaeftigtendaten/
4. **[VERIFIZIERT]** **Einwilligung ist die schlechteste Grundlage** im
   Beschäftigungsverhältnis (ErwGr 43: Ungleichgewicht; § 26 Abs. 2 BDSG:
   strenge Freiwilligkeitsprüfung).
5. **[VERIFIZIERT]** **Art. 13-Information zum Erhebungszeitpunkt ist Pflicht**
   (Verantwortlicher, Zweck, Rechtsgrundlage, berechtigtes Interesse, Empfänger
   = Berater, Speicherdauer, Rechte). **Zweckbindung:** Prozessoptimierung,
   ausdrücklich KEINE individuelle Leistungskontrolle.
6. **[VERIFIZIERT, wörtlich gelesen]** Randbedingungen Kleinbetrieb: kein DSB
   nötig (< 20 Personen, § 38 BDSG), Betriebsrat ab 5 wählbar (§§ 1, 87 BetrVG —
   in der Zielgruppe faktisch selten), Verarbeitungsverzeichnis Art. 30 DSGVO.

**Praktische Checkliste fürs Audit vor Ort (aus den Belegen):**
① Rollen klären (AV-Vertrag ODER Klausel „Berater = eigenständig Verantwortlicher")
② Zweck schriftlich festlegen inkl. Ausschluss individueller Leistungskontrolle
③ VOR der ersten Messung: 1-seitige Art.-13-Information an die Mitarbeiter
   (Aushang/Handout) ④ Nur Schritte erfassen, keine Namen/Personenkennungen im
Tool (Datenmodell enthält bewusst kein Personenfeld) ⑤ Früh aggregieren,
Rohdaten nach Auswertung löschen ⑥ Mini-Interessenabwägung dokumentieren.

---

## Thema 8: DIN 5008 (Fassung 2020-03) — Zahlen, Währung, Datum

Die Norm selbst ist kostenpflichtig → alle Detailregeln sind übereinstimmende
Sekundärwiedergaben (mehrere unabhängige Quellen), **kein Normzitat**. Im PDF
wird nur „DIN 5008:2020-03" ohne Abschnittsnummern referenziert.

1. **[VERIFIZIERT]** Aktuelle Fassung: **DIN 5008:2020-03**.
   - DIN Media — https://www.dinmedia.de/en/standard/din-5008/318422674
2. **[VERIFIZIERT]** **Geldbeträge:** Punktgliederung + Dezimalkomma zulässig und
   üblich („1.234,56 EUR"); Währung im Fließtext **nachgestellt** mit
   (geschütztem) Leerzeichen; „€" und „EUR" gleichwertig, einheitlich verwenden.
   Andere Zahlen: ab 5 Stellen Dreiergruppen mit geschütztem Leerzeichen.
3. **[VERIFIZIERT]** **Datum:** bevorzugt JJJJ-MM-TT; im Geschäftsbrief zulässig
   TT.MM.JJJJ (mit führenden Nullen, Jahr vierstellig) und „17. August 2026".
4. **[VERIFIZIERT]** **Prozent:** Leerzeichen zwischen Zahl und % (geschützt).
   **Geschützte Leerzeichen** (U+00A0) zwischen Zahl und Einheit/Währung.

**Konsequenz fürs Tool (umgesetzt):** `format.ts` nutzt Intl de-DE
(Punktgliederung, Dezimalkomma) + U+00A0 vor €/%/Einheiten; sichtbare Daten
TT.MM.JJJJ, Dateinamen ISO.

---

## Thema 9: IndexedDB auf iOS/iPadOS als Home-Screen-PWA

Kernquellen **direkt wörtlich gelesen** (MDN-Quellspiegel `mdn/content`,
`mdn/browser-compat-data`); WebKit-Blogaussagen per Mehrfach-Suche bestätigt.

1. **[VERIFIZIERT]** Quota ab iOS/iPadOS 17: **~60 % der Platte pro Origin**
   (Browser-Apps; Gesamtdeckel 80 %, dann LRU-Eviction). Für ein Audit-Tool
   (< 100 MB) kein Engpass.
   - MDN — https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/storage_api/storage_quotas_and_eviction_criteria/index.md
   - WebKit Blog 14403 (2023) — https://webkit.org/blog/14403/updates-to-storage-policy/
2. **[VERIFIZIERT]** **7-Tage-Löschregel** (ITP, Safari 13.4+, WebKit-Blog 10218,
   2020): löscht Script-Speicher inkl. IndexedDB nach 7 Safari-Nutzungstagen ohne
   Interaktion mit der Site. **Home-Screen-Web-Apps sind ausgenommen** (eigener
   Nutzungstage-Zähler = jede Nutzung der App zählt).
   - WebKit Blog 10218 — https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
3. **[VERIFIZIERT]** `navigator.storage.persist()`: Safari/iOS **ab 15.2**
   (browser-compat-data direkt gelesen); kein Nutzer-Prompt, automatische
   Gewährung nach Interaktionshistorie; persistente Origins werden bei
   Speicherdruck-Eviction übersprungen.
4. **[VERIFIZIERT]** **Eviction ohne Nutzeraktion ist real:** Speicherdruck →
   LRU-Löschung ganzer Origins (volles iPad mit Fotos genügt als Auslöser).
   **[TEILVERIFIZIERT]** Zusätzlich belegte WebKit-Bugs mit Komplettverlust
   (Bug 266559, Safari 17.x, Fix 01/2024; IndexedDB-Bug 2021).
   - https://bugs.webkit.org/show_bug.cgi?id=266559
5. **[TEILVERIFIZIERT]** Safari-Tab und installierte Home-Screen-App haben
   **getrennte Speicher** → erst installieren, dann erfassen.
6. **[VERIFIZIERT]** EU/DMA-Episode 03/2024: Home-Screen-Web-Apps bleiben in der
   EU funktionsfähig (Apple-Rücknahme) — Plattformrisiko dokumentiert.
   - https://developer.apple.com/support/dma-and-apps-in-the-eu/

**Ergebnis: Das Datenverlust-Risiko ist real und belegt → Export-Erinnerung ist
Pflicht-Feature** (umgesetzt: persist()-Anforderung beim Start, Warnbanner ab
24 h ohne Export, JSON-Export/-Import). Offen (OPEN.md): Verhalten beim
Entfernen des Home-Screen-Icons — auf Testgerät prüfen, bis dahin Annahme:
Daten sind weg.

---

## Thema 10: pdfmake — Umlaute/Euro, Font-Einbindung

Diese Belege sind ungewöhnlich stark: pdfmake-Doku und -Repo liegen auf GitHub und
waren damit **direkt lesbar**.

1. **[VERIFIZIERT]** Standardschrift ist **Roboto** (Regular/Medium/Italic/
   MediumItalic), im Browser über die zweite Datei `vfs_fonts.js` eingebettet.
   Doku wörtlich: „pdfmake uses the Roboto font by default."
   - https://github.com/pdfmake/docs/blob/master/content/fonts/custom-fonts-client-side/_index.md (Doku-Stand 2026-05-06)
2. **[VERIFIZIERT]** Die mitgelieferte Roboto deckt **alle für deutsche Angebote
   nötigen Zeichen** ab (cmap-Analyse der TTFs im Repo): ä/ö/ü/Ä/Ö/Ü (U+00E4 …),
   ß (U+00DF), ẞ (U+1E9E), **€ (U+20AC)**, „…" (U+201E/201C), – (U+2013),
   § (U+00A7), ° (U+00B0). → **Keine Sonderbehandlung, kein Ersatzfont nötig**,
   solange Strings normale UTF-8-JS-Strings sind und TTFs eingebettet werden.
   - https://github.com/bpampuch/pdfmake/tree/master/fonts/Roboto
3. **[VERIFIZIERT]** **Ursache der bekannten Encoding-Probleme:** die
   **Standard-14-PDF-Fonts** (Helvetica, Times, Courier). Doku wörtlich:
   *„Attention! This fonts supports only ANSI code page (only english
   characters)!"* — sie werden nicht eingebettet, Darstellung ist viewerabhängig.
   → Im Tool nicht verwenden. (Nuance: pdfkit-Quellcode zeigt, dass WinAnsi
   technisch Umlaute/€ abdeckt; die Doku ist strenger — beide Aussagen genannt.)
   - https://github.com/pdfmake/docs/blob/master/content/fonts/standard-14-fonts.md
   - https://github.com/foliojs/pdfkit/blob/master/lib/font/afm.js
4. **[VERIFIZIERT]** Eigene TTFs: VFS-Weg (`node build-vfs.js "./examples/fonts"`
   erzeugt `vfs_fonts.js`) oder URL-Protokoll. Pflicht: `pdfmake.min.js` und
   `vfs_fonts.js` **aus demselben Release** ausliefern.
5. **[TEILVERIFIZIERT]** Historische UTF-8-Issues (#165, #348, #369, #543) —
   Titel/Existenz belegt, Inhalte nicht lesbar. Sie betreffen nach Befundlage
   Font-Abdeckung/Setup, nicht die Textverarbeitung von pdfmake.
6. **[VERIFIZIERT]** Aktuelle Linie ist **0.3.x** (0.3.11 vom 2026-06-12, API
   `addFonts`/`addVirtualFileSystem`); die 0.2-Linie (0.2.23) nutzt das
   Legacy-Muster `pdfMake.vfs = …`. Bundle: ~855 kB Fonts + ~1,4 MB pdfmake.
7. **[VERIFIZIERT]** Alternative **pdf-lib + @pdf-lib/fontkit** funktioniert
   offline, ist aber **seit 2021 ohne Release** → nicht erste Wahl.

**Umsetzungsstand im Tool:** verwendet wird **pdfmake 0.2.23** mit eingebetteter
Roboto (Legacy-`vfs`-Muster; der Code deckt beide vfs-Exportformen ab). Der
Playwright-Smoke-Test hat einen echten PDF-Download mit `%PDF-`-Signatur aus dem
laufenden Build erzeugt; die Unit-Tests prüfen ä/ö/ü/ß und € im Dokument.
Upgrade auf 0.3.x ist in OPEN.md O6 als optionaler Schritt notiert.

---

## Thema 11: Herleitung des Konservativ-Abschlags (konservativFaktor)

**Kernergebnis (das ehrliche): Es gibt KEINEN normierten Standard-Prozentwert**
für einen Abschlag auf prognostizierte Prozess-Ersparnisse — weder in der
Investitionsrechnungs-Lehre, noch in den Methodenhandbüchern der
Bundesverwaltung, noch bei REFA. **Der Faktor bleibt deshalb Pflicht-Eingabe mit
Begründung** (so umgesetzt).

**Was sich aber belegen lässt, ist die Berechtigung des Abschlags — drei
zitierfähige Begründungslinien:**

1. **[VERIFIZIERT] Korrekturverfahren der Investitionsrechnung:** Bei
   Wirtschaftlichkeitsuntersuchungen unter Unsicherheit werden geschätzte
   Einzahlungen ausdrücklich um einen **Risikoabschlag** gekürzt.
   - Organisationshandbuch des Bundes, Kap. 6.5.1 — https://www.orghandbuch.de/Webs/OHB/DE/Organisationshandbuch/6_MethodenTechniken/65_Wirtschaftlichkeitsuntersuchung/651_Quantitative/quantitative_inhalt.html
   - BMF-Arbeitsanleitung „Wirtschaftlichkeitsuntersuchungen" (VV zu § 7 BHO, 20.12.2013) — https://www.verwaltungsvorschriften-im-internet.de/pdf/BMF-IIA3-20131220-H-06-01-2-KF-002-A001.pdf
2. **[VERIFIZIERT, wörtlich gelesen] Kaufmännisches Vorsichtsprinzip**,
   § 252 Abs. 1 Nr. 4 HGB: „Es ist vorsichtig zu bewerten … Gewinne sind nur zu
   berücksichtigen, wenn sie am Abschlussstichtag realisiert sind." Gilt der
   Bilanzbewertung, ist als **Rechtsgedanke** aber genau das Argument gegenüber
   einem Steuerberater. Ergänzend § 7 Abs. 2 BHO (Risiken sind zu berücksichtigen).
   - https://github.com/bundestag/gesetze/blob/master/h/hgb/index.md
3. **[VERIFIZIERT] Statistische Herleitung ohne Willkür:** verteilungsfreies
   Konfidenzintervall des Medians über Ordnungsstatistiken (Vorzeichentest-
   Inversion). Die **untere Intervallgrenze statt des Punktschätzers** ist die
   sauberste konservative Variante — ein aus den eigenen Messdaten hergeleiteter
   Abschlag statt eines gegriffenen Prozentwerts.
   - AFIT STAT COE, „Confidence Intervals for the Median and Other Percentiles" — https://www.afit.edu/STAT/statcoe_files/Confidence%20Intervals%20for%20the%20Median%20and%20other%20Percentiles.pdf

**Größenordnungs-Analogien [TEILVERIFIZIERT]** (als Hilfetext, NICHT als Default):
REFA-Verteilzeitzuschläge ca. 5–8 % sachlich + 3–5 % persönlich; Rechnungshof-
Leitsätze zur Personalbedarfsermittlung orientieren sich an ~10 %. Gesamtkorridor
pauschaler Zeitkorrekturen also **~8–13 %**.
- https://refa.de/service/refa-lexikon/verteilzeitzuschlaege
- Leitsätze für die Personalbedarfsermittlung (Rechnungshöfe Bund/Länder) — https://landesrechnungshof-sh.de/file/20181203_leitsaetze_pbe.pdf

**[NICHT VERIFIZIERT] Einlern-/Umstellungsverluste** (Lernkurve nach Wright,
Produktivitäts-J-Kurve nach Brynjolfsson/Rock/Syverson): In dieser Session **keine
Primärquelle mit zitierfähigen Prozentwerten verifiziert** (Suchbudget erschöpft).
→ Diese Literatur wird im Tool und im PDF **nicht zitiert** und liefert **keine
Prozentwerte**. Qualitative Nennung („Umstellungsphase mindert die Ersparnis im
ersten Jahr") ist zulässig, eine Zahl daraus nicht. Nachrecherche: OPEN.md O7.

---

## Gegenprüfung (adversariale Verifikationsrunde) — NICHT DURCHGEFÜHRT

**Ehrlicher Statusbericht:** Geplant war je Thema ein unabhängiger
Skeptiker-Agent (andere Suchanfragen, Nachlesen der Zitate, Quellenqualitäts-
Check). **Alle 11 Gegenprüfungen sind fehlgeschlagen** — das Konto hat das
Monats-Ausgabenlimit erreicht, bevor sie starten konnten (11 von 22 Agenten
erfolgreich, 11 mit Fehler „monthly spend limit").

**Konsequenz für die Belastbarkeit dieses Dokuments:**
- Die Statusangaben stammen aus **Selbsteinschätzung der Recherche**, nicht aus
  unabhängiger Zweitprüfung. Sie wurden **nicht** nachträglich hochgestuft.
- Wo „direkt-gelesen (GitHub-Fetch)" steht, ist der Beleg unabhängig vom Urteil
  des Agenten belastbar (Gesetzestexte, MDN, pdfmake-Repo) — dort ist der Verlust
  der Gegenprüfung am wenigsten kritisch.
- Bei **TEILVERIFIZIERT** (HWK-PDFs, Destatis, REFA, DIN, Krankenstand) ersetzt
  die Liste in **OPEN.md O5** die Gegenprüfung: diese Quellen vor dem ersten
  Kundenangebot einmal von Hand öffnen und die Zahl abgleichen. Das sind
  ~10 Klicks und schließt die Lücke vollständig.
