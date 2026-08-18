import { describe, expect, it } from 'vitest'
import { leseZahl, leseZahlNichtNegativ, schreibeZahl } from './zahlen'

describe('leseZahl', () => {
  it('deutsche Schreibweise mit Komma', () => {
    expect(leseZahl('52,84')).toBe(52.84)
    expect(leseZahl('0,5')).toBe(0.5)
    expect(leseZahl('1.234,56')).toBe(1234.56)
    expect(leseZahl('12.345.678,9')).toBe(12345678.9)
  })

  it('Punkt als Dezimaltrennzeichen, wenn er keine Tausendertrennung sein kann', () => {
    // Der Fall, der vorher einen hundertfach zu hohen Stundensatz ergab:
    expect(leseZahl('52.84')).toBe(52.84)
    expect(leseZahl('0.5')).toBe(0.5)
    expect(leseZahl('1.5')).toBe(1.5)
    expect(leseZahl('1.2345')).toBe(1.2345)
  })

  it('Punkt als Tausendertrennung, wenn er in Dreiergruppen steht', () => {
    expect(leseZahl('1.234')).toBe(1234)
    expect(leseZahl('45.000')).toBe(45000)
    expect(leseZahl('12.345.678')).toBe(12345678)
  })

  it('Leerzeichen gelten als Tausendertrennung (DIN 5008)', () => {
    expect(leseZahl('1 234')).toBe(1234)
    expect(leseZahl('45 000')).toBe(45000)
    expect(leseZahl('1 234,56')).toBe(1234.56)
    expect(leseZahl(' 1 455 ')).toBe(1455)
  })

  it('ganze Zahlen und Randfälle', () => {
    expect(leseZahl('1234')).toBe(1234)
    expect(leseZahl('0')).toBe(0)
    expect(leseZahl('-5')).toBe(-5)
    expect(leseZahl(',5')).toBe(0.5)
  })

  it('leere und unbrauchbare Eingaben ergeben null, nicht 0', () => {
    // Wichtig: eine leere Eingabe darf nicht stillschweigend als 0 gerechnet werden.
    expect(leseZahl('')).toBeNull()
    expect(leseZahl('   ')).toBeNull()
    expect(leseZahl('abc')).toBeNull()
    expect(leseZahl('12,5,3')).toBeNull()
    expect(leseZahl('1e3')).toBeNull()
    expect(leseZahl('12€')).toBeNull()
    expect(leseZahl('-')).toBeNull()
    expect(leseZahl('.')).toBeNull()
    expect(leseZahl(',')).toBeNull()
  })
})

describe('leseZahlNichtNegativ', () => {
  it('weist negative Werte ab', () => {
    expect(leseZahlNichtNegativ('20')).toBe(20)
    expect(leseZahlNichtNegativ('0')).toBe(0)
    expect(leseZahlNichtNegativ('-1')).toBeNull()
    expect(leseZahlNichtNegativ('')).toBeNull()
  })
})

describe('schreibeZahl', () => {
  it('zeigt das deutsche Dezimalkomma ohne Tausendertrennung', () => {
    expect(schreibeZahl(52.84)).toBe('52,84')
    expect(schreibeZahl(1234)).toBe('1234')
    expect(schreibeZahl(0.75)).toBe('0,75')
  })

  it('was geschrieben wurde, lässt sich wieder einlesen', () => {
    for (const wert of [0, 0.5, 20, 52.84, 1234, 1234.56, 1455]) {
      expect(leseZahl(schreibeZahl(wert))).toBe(wert)
    }
  })
})
