import { useCallback, useEffect, useRef, useState } from 'react'
import type { Audit } from '../types'
import { ladeAudits, persistentSpeicherAnfordern, speichereAudits } from '../lib/storage'

/**
 * Zentraler App-State: alle Audits, mit Autosave nach jeder Änderung
 * (Anforderung: Autosave nach jeder Aktion). Beim Start wird zusätzlich
 * persistenter Speicher angefordert (Eviction-Schutz, QUELLEN.md Thema 9).
 */
export function useAudits() {
  const [audits, setAuditsIntern] = useState<Audit[] | null>(null)

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
      // Der erste Nicht-null-Stand ist der frisch geladene — nicht zurückschreiben.
      ersterStand.current = false
      return
    }
    void speichereAudits(audits)
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
  }
}
