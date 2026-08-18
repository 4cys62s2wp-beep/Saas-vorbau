import { useCallback, useEffect, useRef, useState } from 'react'
import type { Audit } from '../types'
import { ladeAudits, persistentSpeicherAnfordern, speichereAudits } from '../lib/storage'

/**
 * Zentraler Datenbestand mit automatischem Speichern nach jeder Änderung.
 *
 * Beim Start wird zusätzlich dauerhafter Speicher angefordert, damit das
 * Betriebssystem die Daten nicht bei Speicherdruck wegräumt (QUELLEN.md, Thema 9).
 *
 * Schlägt das Speichern fehl — etwa weil der Gerätespeicher voll ist —, wird das
 * gemeldet statt verschluckt: Daten, die nur auf einem Gerät liegen, dürfen nicht
 * unbemerkt verloren gehen.
 */
export function useAudits() {
  const [audits, setAuditsIntern] = useState<Audit[] | null>(null)
  const [speicherFehler, setSpeicherFehler] = useState<string | null>(null)

  useEffect(() => {
    let aktiv = true
    void ladeAudits().then((a) => {
      if (aktiv) setAuditsIntern(a)
    })
    void persistentSpeicherAnfordern()
    return () => {
      aktiv = false
    }
  }, [])

  const ersterStand = useRef(true)
  useEffect(() => {
    if (audits === null) return
    if (ersterStand.current) {
      // Der erste Stand ist der frisch geladene — nicht gleich zurückschreiben.
      ersterStand.current = false
      return
    }
    speichereAudits(audits).then(
      () => setSpeicherFehler(null),
      (fehler: unknown) =>
        setSpeicherFehler(fehler instanceof Error ? fehler.message : String(fehler)),
    )
  }, [audits])

  const setAudits = useCallback((f: (alt: Audit[]) => Audit[]) => {
    setAuditsIntern((alt) => (alt === null ? alt : f(alt)))
  }, [])

  const aktualisiereAudit = useCallback(
    (id: string, f: (a: Audit) => Audit) => {
      setAudits((alt) => alt.map((a) => (a.id === id ? f(a) : a)))
    },
    [setAudits],
  )

  return {
    geladen: audits !== null,
    audits: audits ?? [],
    setAudits,
    aktualisiereAudit,
    speicherFehler,
  }
}
