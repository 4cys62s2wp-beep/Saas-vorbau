import { afterEach, describe, expect, it, vi } from 'vitest'
import { neueId } from './storage'

/**
 * Die Kennungen müssen auch dort funktionieren, wo die Anwendung ohne
 * verschlüsselte Verbindung läuft — etwa wenn das iPad die Adresse des
 * Rechners im WLAN öffnet. Dort fehlt `crypto.randomUUID`.
 */
describe('neueId', () => {
  const echt = globalThis.crypto

  afterEach(() => {
    Object.defineProperty(globalThis, 'crypto', { value: echt, configurable: true })
    vi.restoreAllMocks()
  })

  const istUuid = (s: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(s)

  it('liefert eindeutige Kennungen', () => {
    const menge = new Set(Array.from({ length: 500 }, () => neueId()))
    expect(menge.size).toBe(500)
  })

  it('nutzt randomUUID, wenn vorhanden', () => {
    expect(istUuid(neueId())).toBe(true)
  })

  it('kommt ohne randomUUID aus (unverschlüsselte Verbindung)', () => {
    Object.defineProperty(globalThis, 'crypto', {
      value: { getRandomValues: echt.getRandomValues.bind(echt) },
      configurable: true,
    })
    const id = neueId()
    expect(istUuid(id)).toBe(true)
    const menge = new Set(Array.from({ length: 200 }, () => neueId()))
    expect(menge.size).toBe(200)
  })

  it('kommt sogar ganz ohne crypto aus', () => {
    Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true })
    const menge = new Set(Array.from({ length: 200 }, () => neueId()))
    expect(menge.size).toBe(200)
    expect([...menge][0]).toMatch(/^id-/)
  })
})
