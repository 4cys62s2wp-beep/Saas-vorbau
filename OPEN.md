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

## O3: Versionsstände package.json
Versionen sind auf Basis des Wissensstands (Anfang 2026) gesetzt und mit ^/~ offen. Falls
npm install Peer-Konflikte meldet: zuerst @vitejs/plugin-react gegen die zur installierten
Vite-Major passende Major heben/senken. Wird gegenstandslos, sobald ein erfolgreicher
Install + Lockfile committet ist (siehe STATUS.md).
