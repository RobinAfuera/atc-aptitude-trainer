import { describe, expect, it } from 'vitest'
import { createRng } from './rng'

describe('createRng', () => {
  it('produces the same sequence for the same seed', () => {
    const a = createRng(42)
    const b = createRng(42)
    const fromA = Array.from({ length: 20 }, () => a.next())
    const fromB = Array.from({ length: 20 }, () => b.next())
    expect(fromA).toEqual(fromB)
  })

  it('produces different sequences for different seeds', () => {
    const a = createRng(1)
    const b = createRng(2)
    const fromA = Array.from({ length: 5 }, () => a.next())
    const fromB = Array.from({ length: 5 }, () => b.next())
    expect(fromA).not.toEqual(fromB)
  })

  it('keeps floats in [0, 1)', () => {
    const rng = createRng(7)
    for (let i = 0; i < 1000; i++) {
      const value = rng.next()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('returns integers inside an inclusive range and reaches both ends', () => {
    const rng = createRng(99)
    const seen = new Set<number>()
    for (let i = 0; i < 500; i++) {
      const value = rng.int(3, 6)
      expect(Number.isInteger(value)).toBe(true)
      seen.add(value)
    }
    expect([...seen].sort()).toEqual([3, 4, 5, 6])
  })

  it('rejects an invalid integer range', () => {
    const rng = createRng(1)
    expect(() => rng.int(5, 4)).toThrow(RangeError)
    expect(() => rng.int(0.5, 4)).toThrow(RangeError)
  })

  it('shuffles without losing or changing elements, and leaves the input alone', () => {
    const rng = createRng(5)
    const input = [1, 2, 3, 4, 5, 6, 7, 8]
    const shuffled = rng.shuffle(input)
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect([...shuffled].sort((x, y) => x - y)).toEqual(input)
  })

  it('refuses to pick from an empty list', () => {
    expect(() => createRng(1).pick([])).toThrow(RangeError)
  })
})
