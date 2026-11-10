import type { ItemResponse } from './session'

/** Points for a correct answer given at the last moment. */
export const ACCURACY_POINTS = 60
/** Extra points for a correct answer given instantly; scales down to 0 at the limit. */
export const SPEED_POINTS = 40

export interface SessionSummary {
  itemCount: number
  correct: number
  timedOut: number
  /** Share of items answered correctly, 0 to 1. */
  accuracy: number
  /** Mean time of the items that were answered; null if every item timed out. */
  meanResponseMs: number | null
  /** 0 to 100. */
  score: number
}

/**
 * Score for one item, 0 to 100.
 *
 * A wrong answer or a timeout scores 0. A correct answer scores 60, plus up to
 * 40 for speed: the full 40 for an instant answer, falling linearly to 0 at
 * the time limit. Accuracy dominates on purpose: guessing fast never beats
 * answering correctly.
 */
export function itemScore(response: ItemResponse, timeLimitMs: number): number {
  if (!response.correct) return 0
  const used = Math.min(Math.max(response.responseMs / timeLimitMs, 0), 1)
  return ACCURACY_POINTS + SPEED_POINTS * (1 - used)
}

export function summarize(responses: readonly ItemResponse[], timeLimitMs: number): SessionSummary {
  const itemCount = responses.length
  const correct = responses.filter((r) => r.correct).length
  const timedOut = responses.filter((r) => r.timedOut).length
  const answered = responses.filter((r) => !r.timedOut)

  const meanResponseMs =
    answered.length === 0
      ? null
      : answered.reduce((sum, r) => sum + r.responseMs, 0) / answered.length

  const total = responses.reduce((sum, r) => sum + itemScore(r, timeLimitMs), 0)

  return {
    itemCount,
    correct,
    timedOut,
    accuracy: itemCount === 0 ? 0 : correct / itemCount,
    meanResponseMs,
    score: itemCount === 0 ? 0 : Math.round(total / itemCount),
  }
}
