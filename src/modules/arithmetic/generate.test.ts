import { describe, expect, it } from 'vitest'
import { createRng } from '../../core/rng'
import {
  ARITHMETIC_LEVEL_COUNT,
  generateArithmeticItem,
  parseAnswer,
  type ArithmeticItem,
} from './generate'

/** Many items per level, from several seeds. */
function sample(levelIndex: number, count = 400): ArithmeticItem[] {
  const items: ArithmeticItem[] = []
  for (let seed = 1; seed <= 4; seed++) {
    const rng = createRng(seed)
    for (let i = 0; i < count / 4; i++) items.push(generateArithmeticItem(rng, levelIndex))
  }
  return items
}

/** Independent check of the stored answer, worked out from the text on screen. */
function evaluate(item: ArithmeticItem): number {
  const numbers = (item.expression.match(/\d+/g) ?? []).map(Number)
  switch (item.kind) {
    case 'add':
      return numbers[0] + numbers[1]
    case 'subtract':
      return numbers[0] - numbers[1]
    case 'multiply':
      return numbers[0] * numbers[1]
    case 'divide':
      return numbers[0] / numbers[1]
    case 'chain':
      return item.expression.includes('+')
        ? numbers[0] * numbers[1] + numbers[2]
        : numbers[0] * numbers[1] - numbers[2]
    case 'distance': {
      const [minutes, speed] = numbers
      return (speed * minutes) / 60
    }
    case 'time': {
      const [distance, speed] = numbers
      return (distance / speed) * 60
    }
  }
}

describe('generateArithmeticItem', () => {
  it('is deterministic for a given seed', () => {
    const a = createRng(2024)
    const b = createRng(2024)
    for (let i = 0; i < 30; i++) {
      expect(generateArithmeticItem(a, 2)).toEqual(generateArithmeticItem(b, 2))
    }
  })

  it.each([0, 1, 2])('stores the right answer for every item at level index %i', (levelIndex) => {
    for (const item of sample(levelIndex)) {
      expect(item.answer, item.expression).toBeCloseTo(evaluate(item), 9)
    }
  })

  it.each([0, 1, 2])('only asks for positive whole numbers at level index %i', (levelIndex) => {
    for (const item of sample(levelIndex)) {
      expect(Number.isInteger(item.answer), item.expression).toBe(true)
      expect(item.answer, item.expression).toBeGreaterThan(0)
    }
  })

  it('keeps level 1 to adding and subtracting two-digit numbers', () => {
    for (const item of sample(0)) {
      expect(['add', 'subtract']).toContain(item.kind)
      for (const n of item.expression.match(/\d+/g) ?? []) {
        expect(Number(n)).toBeLessThan(101)
      }
    }
  })

  it('uses every kind of calculation a level offers', () => {
    expect(new Set(sample(0).map((i) => i.kind))).toEqual(new Set(['add', 'subtract']))
    expect(new Set(sample(1).map((i) => i.kind))).toEqual(
      new Set(['add', 'subtract', 'multiply', 'divide']),
    )
    expect(new Set(sample(2).map((i) => i.kind))).toEqual(new Set(['chain', 'distance', 'time']))
  })

  it('says what to work out when the expression alone is ambiguous', () => {
    for (const item of sample(2)) {
      if (item.kind === 'distance' || item.kind === 'time') {
        expect(item.caption).not.toBeNull()
      }
    }
  })

  it('rejects a level that does not exist', () => {
    expect(() => generateArithmeticItem(createRng(1), ARITHMETIC_LEVEL_COUNT)).toThrow(RangeError)
  })
})

describe('parseAnswer', () => {
  it('reads whole numbers, ignoring surrounding spaces', () => {
    expect(parseAnswer('85')).toBe(85)
    expect(parseAnswer('  120 ')).toBe(120)
    expect(parseAnswer('0')).toBe(0)
  })

  it('returns null for anything else', () => {
    for (const text of ['', '   ', '12a', '-5', '3.5', '1e3', '1234567']) {
      expect(parseAnswer(text), JSON.stringify(text)).toBeNull()
    }
  })
})
