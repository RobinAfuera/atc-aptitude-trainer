import { describe, expect, it } from 'vitest'
import { itemScore, summarize } from './scoring'
import type { ItemResponse } from './session'

const LIMIT = 10_000

const hit = (responseMs: number): ItemResponse => ({ correct: true, timedOut: false, responseMs })
const miss = (responseMs: number): ItemResponse => ({ correct: false, timedOut: false, responseMs })
const timeout: ItemResponse = { correct: false, timedOut: true, responseMs: LIMIT }

describe('itemScore', () => {
  it('gives 100 for an instant correct answer', () => {
    expect(itemScore(hit(0), LIMIT)).toBe(100)
  })

  it('gives 60 for a correct answer at the time limit', () => {
    expect(itemScore(hit(LIMIT), LIMIT)).toBe(60)
  })

  it('scales the speed bonus linearly in between', () => {
    expect(itemScore(hit(LIMIT / 2), LIMIT)).toBe(80)
  })

  it('gives nothing for a wrong answer, however fast', () => {
    expect(itemScore(miss(100), LIMIT)).toBe(0)
  })

  it('gives nothing for a timeout', () => {
    expect(itemScore(timeout, LIMIT)).toBe(0)
  })

  it('never rewards a slow correct answer below the accuracy points', () => {
    expect(itemScore(hit(LIMIT * 3), LIMIT)).toBe(60)
  })
})

describe('summarize', () => {
  it('counts hits and timeouts and averages the score over all items', () => {
    const summary = summarize([hit(0), hit(LIMIT), miss(2000), timeout], LIMIT)
    expect(summary.itemCount).toBe(4)
    expect(summary.correct).toBe(2)
    expect(summary.timedOut).toBe(1)
    expect(summary.accuracy).toBe(0.5)
    expect(summary.score).toBe(40) // (100 + 60 + 0 + 0) / 4
  })

  it('leaves timeouts out of the mean response time', () => {
    const summary = summarize([hit(1000), miss(3000), timeout], LIMIT)
    expect(summary.meanResponseMs).toBe(2000)
  })

  it('has no mean response time when every item timed out', () => {
    expect(summarize([timeout, timeout], LIMIT).meanResponseMs).toBeNull()
  })

  it('handles an empty session', () => {
    expect(summarize([], LIMIT)).toMatchObject({ itemCount: 0, accuracy: 0, score: 0 })
  })
})
