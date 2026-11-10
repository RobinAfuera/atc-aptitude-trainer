import type { Rng } from '../../core/rng'

export type ArithmeticKind =
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide'
  | 'chain'
  | 'distance'
  | 'time'

export interface ArithmeticItem {
  kind: ArithmeticKind
  /** What is being asked, when the expression alone doesn't say. */
  caption: string | null
  /** The calculation as shown on screen, e.g. "47 + 38". */
  expression: string
  answer: number
}

const MINUS = '−'
const TIMES = '×'
const DIVIDE = '÷'

/** Ground speeds in knots. Multiples of 60 keep every answer a whole number. */
const SPEEDS_KT = [120, 180, 240, 300, 360, 420, 480] as const
const LEG_MINUTES = [5, 10, 15, 20, 25, 30, 40, 45, 50] as const

function add(rng: Rng, min: number, max: number): ArithmeticItem {
  const a = rng.int(min, max)
  const b = rng.int(min, max)
  return { kind: 'add', caption: null, expression: `${a} + ${b}`, answer: a + b }
}

function subtract(rng: Rng, min: number, max: number): ArithmeticItem {
  const x = rng.int(min, max)
  const y = rng.int(min, max)
  // Larger number first, and never equal, so the answer is always positive.
  const a = Math.max(x, y) + (x === y ? 1 : 0)
  const b = Math.min(x, y)
  return { kind: 'subtract', caption: null, expression: `${a} ${MINUS} ${b}`, answer: a - b }
}

function multiply(rng: Rng): ArithmeticItem {
  const a = rng.int(12, 49)
  const b = rng.int(3, 9)
  return { kind: 'multiply', caption: null, expression: `${a} ${TIMES} ${b}`, answer: a * b }
}

function divide(rng: Rng): ArithmeticItem {
  const divisor = rng.int(3, 12)
  const quotient = rng.int(6, 25)
  return {
    kind: 'divide',
    caption: null,
    expression: `${divisor * quotient} ${DIVIDE} ${divisor}`,
    answer: quotient,
  }
}

function chain(rng: Rng): ArithmeticItem {
  const a = rng.int(6, 15)
  const b = rng.int(4, 12)
  const c = rng.int(11, 99)
  const product = a * b
  // Only subtract when the result stays positive.
  const subtracts = product > c && rng.next() < 0.5
  return {
    kind: 'chain',
    caption: null,
    expression: `${a} ${TIMES} ${b} ${subtracts ? MINUS : '+'} ${c}`,
    answer: subtracts ? product - c : product + c,
  }
}

function distance(rng: Rng): ArithmeticItem {
  const speed = rng.pick(SPEEDS_KT)
  const minutes = rng.pick(LEG_MINUTES)
  return {
    kind: 'distance',
    caption: 'Distance flown, in NM',
    expression: `${minutes} min at ${speed} kt`,
    answer: (speed / 60) * minutes,
  }
}

function time(rng: Rng): ArithmeticItem {
  const speed = rng.pick(SPEEDS_KT)
  const minutes = rng.pick(LEG_MINUTES)
  return {
    kind: 'time',
    caption: 'Flight time, in minutes',
    expression: `${(speed / 60) * minutes} NM at ${speed} kt`,
    answer: minutes,
  }
}

/** One generator list per level; each item picks one at random. */
const LEVEL_GENERATORS: readonly (readonly ((rng: Rng) => ArithmeticItem)[])[] = [
  [(rng) => add(rng, 12, 99), (rng) => subtract(rng, 12, 99)],
  [multiply, divide, (rng) => add(rng, 120, 899), (rng) => subtract(rng, 120, 899)],
  [chain, distance, time],
]

export const ARITHMETIC_LEVEL_COUNT = LEVEL_GENERATORS.length

export function generateArithmeticItem(rng: Rng, levelIndex: number): ArithmeticItem {
  const generators = LEVEL_GENERATORS[levelIndex]
  if (!generators) throw new RangeError(`Mental arithmetic has no level ${levelIndex}`)
  return rng.pick(generators)(rng)
}

/**
 * Read a typed answer. Returns null for anything that isn't a whole number,
 * so "12a" or an empty box is never silently scored as a number.
 */
export function parseAnswer(text: string): number | null {
  const trimmed = text.trim()
  if (!/^\d{1,6}$/.test(trimmed)) return null
  return Number(trimmed)
}
