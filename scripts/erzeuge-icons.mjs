// Erzeugt die PWA-Icons (Stoppuhr-Motiv) als PNG ohne externe Abhängigkeiten.
// Aufruf: node scripts/erzeuge-icons.mjs  (Ergebnis liegt in public/)
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'

const CRC_TABELLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(daten) {
  let c = 0xffffffff
  for (const b of daten) c = CRC_TABELLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(typ, daten) {
  const laenge = Buffer.alloc(4)
  laenge.writeUInt32BE(daten.length)
  const inhalt = Buffer.concat([Buffer.from(typ, 'ascii'), daten])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(inhalt))
  return Buffer.concat([laenge, inhalt, crc])
}

function schreibePng(pfad, groesse, zeichne) {
  const zeilen = []
  for (let y = 0; y < groesse; y++) {
    const zeile = Buffer.alloc(1 + groesse * 4)
    for (let x = 0; x < groesse; x++) {
      const [r, g, b, a] = zeichne(x, y, groesse)
      zeile[1 + x * 4] = r
      zeile[1 + x * 4 + 1] = g
      zeile[1 + x * 4 + 2] = b
      zeile[1 + x * 4 + 3] = a
    }
    zeilen.push(zeile)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(groesse, 0)
  ihdr.writeUInt32BE(groesse, 4)
  ihdr[8] = 8 // Bittiefe
  ihdr[9] = 6 // RGBA
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.concat(zeilen), { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
  writeFileSync(pfad, png)
  console.log(`${pfad} (${groesse}×${groesse}, ${png.length} Bytes)`)
}

// Stoppuhr auf Schiefergrund: Ring, Krone, Zeiger auf ~10 nach 1.
function stoppuhrPixel(x, y, g) {
  const hinter = [0x1e, 0x29, 0x3b, 255] // slate-800
  const weiss = [255, 255, 255, 255]
  const cx = g / 2
  const cy = g / 2 + g * 0.03
  const r = g * 0.3
  const dicke = g * 0.045
  const dx = x - cx
  const dy = y - cy
  const dist = Math.hypot(dx, dy)

  // Ring
  if (Math.abs(dist - r) < dicke) return weiss
  // Krone (Stummel oben)
  if (Math.abs(dx) < dicke * 0.9 && dy > -r - g * 0.09 && dy < -r) return weiss
  // Zeiger: Segment vom Zentrum Richtung 1:50 Uhr
  const winkel = -Math.PI / 3.2
  const zx = Math.cos(winkel)
  const zy = Math.sin(winkel)
  const laenge = r * 0.72
  const t = Math.max(0, Math.min(laenge, dx * zx + dy * zy))
  const abstand = Math.hypot(dx - t * zx, dy - t * zy)
  if (abstand < dicke * 0.7) return weiss
  // Mittelpunkt
  if (dist < dicke * 1.1) return weiss
  return hinter
}

mkdirSync('public', { recursive: true })
for (const [datei, groesse] of [
  ['public/icon-192.png', 192],
  ['public/icon-512.png', 512],
  ['public/apple-touch-icon.png', 180],
]) {
  schreibePng(datei, groesse, stoppuhrPixel)
}
