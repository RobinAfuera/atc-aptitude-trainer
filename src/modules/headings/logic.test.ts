import { describe, expect, it } from 'vitest'
import { applyTurn, formatHeading, formatTurn, normalizeHeading, shortestTurn } from './logic'

describe('normalizeHeading', () => {
  it('leaves headings on the scale alone', () => {
    expect(normalizeHeading(1)).toBe(1)
    expect(normalizeHeading(270)).toBe(270)
    expect(normalizeHeading(360)).toBe(360)
  })

  it('calls north 360, never 0', () => {
    expect(normalizeHeading(0)).toBe(360)
    expect(normalizeHeading(720)).toBe(360)
  })

  it('wraps angles outside the scale', () => {
    expect(normalizeHeading(370)).toBe(10)
    expect(normalizeHeading(-10)).toBe(350)
    expect(normalizeHeading(-360)).toBe(360)
  })
})

describe('formatHeading', () => {
  it('always uses three digits', () => {
    expect(formatHeading(5)).toBe('005')
    expect(formatHeading(70)).toBe('070')
    expect(formatHeading(360)).toBe('360')
    expect(formatHeading(0)).toBe('360')
  })
})

describe('shortestTurn', () => {
  it('turns right when the target is clockwise and closer that way', () => {
    expect(shortestTurn(70, 240)).toEqual({ direction: 'right', degrees: 170 })
  })

  it('turns left when the target is closer anticlockwise', () => {
    expect(shortestTurn(240, 70)).toEqual({ direction: 'left', degrees: 170 })
  })

  it('crosses north in both directions', () => {
    expect(shortestTurn(350, 20)).toEqual({ direction: 'right', degrees: 30 })
    expect(shortestTurn(20, 350)).toEqual({ direction: 'left', degrees: 30 })
  })

  it('reports no turn for identical headings', () => {
    expect(shortestTurn(90, 90).degrees).toBe(0)
    expect(shortestTurn(360, 0).degrees).toBe(0)
  })

  it('reports opposite headings as 180 degrees right, by convention', () => {
    expect(shortestTurn(90, 270)).toEqual({ direction: 'right', degrees: 180 })
  })

  it('never exceeds 180 degrees and always arrives on the target', () => {
    for (let from = 5; from <= 360; from += 5) {
      for (let to = 5; to <= 360; to += 5) {
        const turn = shortestTurn(from, to)
        expect(turn.degrees).toBeLessThanOrEqual(180)
        expect(applyTurn(from, turn)).toBe(to)
      }
    }
  })
})

describe('applyTurn', () => {
  it('adds degrees for a right turn and subtracts for a left turn', () => {
    expect(applyTurn(350, { direction: 'right', degrees: 30 })).toBe(20)
    expect(applyTurn(20, { direction: 'left', degrees: 30 })).toBe(350)
    expect(applyTurn(180, { direction: 'left', degrees: 180 })).toBe(360)
  })
})

describe('formatTurn', () => {
  it('names the direction and the size', () => {
    expect(formatTurn({ direction: 'left', degrees: 170 })).toBe('Left 170°')
    expect(formatTurn({ direction: 'right', degrees: 20 })).toBe('Right 20°')
  })
})
