# Offene Annahmen und Punkte

Wird laufend gepflegt. Verweise aus STATUS.md zeigen hierher.

## O1: Netzlage der Arbeitsumgebung (betrifft Verifikationstiefe von QUELLEN.md)
Direkter Seitenabruf war in dieser Umgebung nur für github.com / raw.githubusercontent.com
möglich; alle anderen Domains (destatis.de, gesetze-im-internet.de, webkit.org, refa.de,
din.de, …) waren durch den Egress-Proxy gesperrt. Websuche funktionierte uneingeschränkt.
Folge: Gesetzestexte (Spiegel bundestag/gesetze), MDN (Spiegel mdn/content) und pdfmake
(Original-Repo) konnten wörtlich gegengelesen werden; Destatis-/HWK-/WebKit-/DIN-Zahlen
sind per Suche belegt (Quelle + URL + Jahr), aber nicht direkt von der Primärseite
gegengelesen → in QUELLEN.md als TEILVERIFIZIERT geführt. Jede URL ist klickbar und in
unter einer Minute von Hand prüfbar.

## O2: PWA-Icons — ERLEDIGT
Erzeugt per `scripts/erzeuge-icons.mjs` (dependency-freier PNG-Generator, Stoppuhr-Motiv):
public/icon-192.png, icon-512.png, apple-touch-icon.png. Bei Bedarf Motiv im Skript ändern
und neu ausführen.

## O4: iOS — löscht das Entfernen des Home-Screen-Icons die App-Daten?
Von Apple nicht dokumentiert, Community-Angaben widersprüchlich (QUELLEN.md Thema 9).
Auf einem Testgerät mit aktuellem iPadOS prüfen. Bis dahin Arbeitsannahme: ja, Daten
sind dann weg → vor dem Entfernen/Neuinstallieren immer JSON-Export.

## O5: Vor erstem Kundeneinsatz von Hand gegenlesen (Egress-Sperre dieser Umgebung)
1. Die vier HWK-Kalkulations-PDFs (Leipzig, OMV, Cottbus, Köln — URLs in QUELLEN.md T1/T3)
2. Destatis-PM 154/2025 und 148/2026 (T2), BMF-Schreiben v. 18.03.2025 (T6)
3. § 145 ff. BGB und § 19 UStG einmal direkt auf gesetze-im-internet.de (T5/T6)
4. WebKit-Blogposts 10218/14403 (T9)
Alle Aussagen sind mehrfach suchbestätigt; das direkte Gegenlesen ist die letzte
Meile für „vor dem Steuerberater wörtlich zitierfähig".

## O6: pdfmake 0.2.23 statt 0.3.x (optionales Upgrade)
Das Tool nutzt pdfmake 0.2.23 mit dem Legacy-`vfs`-Muster; das funktioniert nachweislich
(Smoke-Test erzeugt echtes PDF, Umlaute/€ durch eingebettete Roboto abgedeckt — QUELLEN.md
Thema 10). Aktuell gepflegt ist die 0.3-Linie (0.3.11, API `addFonts`/`addVirtualFileSystem`).
Upgrade ist optional; falls durchgeführt, ist `exportierePdf()` in `src/lib/pdf.ts` die
einzige anzupassende Stelle (deckt bereits beide vfs-Exportformen ab).

## O7: Lernkurven-/J-Kurven-Literatur nachrecherchieren
Für Einlern-/Umstellungsverluste (Wright 1936; Brynjolfsson/Rock/Syverson „Productivity
J-Curve") konnte keine Primärquelle mit zitierfähigen Prozentwerten verifiziert werden
(Suchbudget erschöpft). Bis dahin gilt: im Tool und PDF **keine Prozentwerte** aus dieser
Literatur, keine Zitate. Qualitative Nennung der Umstellungsphase ist zulässig.

## O8: Adversariale Gegenprüfung der Recherche ausgefallen
Alle 11 geplanten Skeptiker-Durchläufe scheiterten am Monats-Ausgabenlimit des Kontos
(11 von 22 Agenten erfolgreich). Die Statusangaben in QUELLEN.md sind daher
Selbsteinschätzung ohne Zweitprüfung — nichts wurde hochgestuft. Ersatz: die Handprüf-Liste
O5 (~10 Klicks) deckt genau die TEILVERIFIZIERT-Quellen ab. Alternativ die Gegenprüfung
später erneut starten (Workflow-Skript liegt in der Session, resumeFromRunId nutzt den
Cache der bereits erfolgreichen Recherchen).

## O3: Versionsstände package.json
Versionen sind auf Basis des Wissensstands (Anfang 2026) gesetzt und mit ^/~ offen. Falls
npm install Peer-Konflikte meldet: zuerst @vitejs/plugin-react gegen die zur installierten
Vite-Major passende Major heben/senken. Wird gegenstandslos, sobald ein erfolgreicher
Install + Lockfile committet ist (siehe STATUS.md).
