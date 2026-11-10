/**
 * Seeded pseudo-random numbers.
 *
 * Every drill is generated from a seed, so a session can be replayed exactly
 * and item generators can be unit-tested without mocking Math.random.
 */
export interface Rng {
  /** Float in [0, 1). */
  next(): number
  /** Integer in [min, max], both inclusive. */
  int(min: number, max: number): number
  /** One element of a non-empty list. */
  pick<T>(items: readonly T[]): T
  /** A shuffled copy; the input is left untouched. */
  shuffle<T>(items: readonly T[]): T[]
}

/** Mulberry32: small, fast, and good enough for generating drill items. */
export function createRng(seed: number): Rng {
  let state = seed >>> 0

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const int = (min: number, max: number): number => {
    if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
      throw new RangeError(`Invalid integer range [${min}, ${max}]`)
    }
    return min + Math.floor(next() * (max - min + 1))
  }

  const pick = <T,>(items: readonly T[]): T => {
    if (items.length === 0) throw new RangeError('Cannot pick from an empty list')
    return items[int(0, items.length - 1)]
  }

  const shuffle = <T,>(items: readonly T[]): T[] => {
    const copy = [...items]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = int(0, i)
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }

  return { next, int, pick, shuffle }
}

/** A fresh seed for a new session. */
export function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff) >>> 0
}
