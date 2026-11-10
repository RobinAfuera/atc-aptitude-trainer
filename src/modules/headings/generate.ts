import type { Rng } from '../../core/rng'
import { applyTurn, oppositeDirection, type Turn, type TurnDirection } from './logic'

/**
 * How much the compass gives away:
 * - `full`: the current heading and the target are both marked.
 * - `plain`: only the current heading is marked.
 * - `none`: no compass, the turn has to be worked out from the numbers.
 */
export type CompassAid = 'full' | 'plain' | 'none'

export interface HeadingsItem {
  from: number
  to: number
  compass: CompassAid
  /** Four distinct turns, exactly one of which is the shortest. */
  options: readonly Turn[]
  correctIndex: number
}

interface LevelSpec {
  /** Headings and turn sizes are multiples of this. */
  stepDegrees: number
  /** How far the "slip of the pen" distractor is from the right size. */
  nearMissDegrees: number
  compass: CompassAid
}

const LEVEL_SPECS: readonly LevelSpec[] = [
  { stepDegrees: 30, nearMissDegrees: 30, compass: 'full' },
  { stepDegrees: 10, nearMissDegrees: 10, compass: 'plain' },
  { stepDegrees: 5, nearMissDegrees: 10, compass: 'none' },
]

export const HEADINGS_LEVEL_COUNT = LEVEL_SPECS.length

export function generateHeadingsItem(rng: Rng, levelIndex: number): HeadingsItem {
  const spec = LEVEL_SPECS[levelIndex]
  if (!spec) throw new RangeError(`Heading turns has no level ${levelIndex}`)
  const { stepDegrees: step, nearMissDegrees: nearMiss } = spec

  const from = step * rng.int(1, 360 / step)
  // Between one step and one step short of 180, so there is always exactly
  // one shortest turn: never 0 degrees, never the ambiguous 180.
  const degrees = step * rng.int(1, 180 / step - 1)
  const direction: TurnDirection = rng.next() < 0.5 ? 'left' : 'right'
  const correct: Turn = { direction, degrees }

  // The same size as the right answer, but off by a plausible slip.
  const canGoUp = degrees + nearMiss <= 180 - step
  const canGoDown = degrees - nearMiss >= step
  const goUp = canGoUp && (!canGoDown || rng.next() < 0.5)

  const distractors: Turn[] = [
    // Right size, wrong way.
    { direction: oppositeDirection(direction), degrees },
    // Arrives on the target heading, but the long way round.
    { direction: oppositeDirection(direction), degrees: 360 - degrees },
    { direction, degrees: goUp ? degrees + nearMiss : degrees - nearMiss },
  ]

  const options = rng.shuffle([correct, ...distractors])

  return {
    from,
    to: applyTurn(from, correct),
    compass: spec.compass,
    options,
    correctIndex: options.indexOf(correct),
  }
}
