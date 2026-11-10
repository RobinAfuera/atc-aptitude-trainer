/**
 * Heading arithmetic. Headings are whole degrees from 1 to 360, measured
 * clockwise from north; north is 360, never 0, as it is spoken on frequency.
 */
export type TurnDirection = 'left' | 'right'

export interface Turn {
  direction: TurnDirection
  /** Size of the turn in degrees, 0 to 359. */
  degrees: number
}

/** Bring any angle in degrees onto the 1 to 360 scale. */
export function normalizeHeading(degrees: number): number {
  const wrapped = ((Math.round(degrees) % 360) + 360) % 360
  return wrapped === 0 ? 360 : wrapped
}

/** Three digits, as headings are written: 5 becomes "005". */
export function formatHeading(heading: number): string {
  return String(normalizeHeading(heading)).padStart(3, '0')
}

/** The heading reached after a turn. Right turns add degrees, left turns subtract. */
export function applyTurn(from: number, turn: Turn): number {
  const signed = turn.direction === 'right' ? turn.degrees : -turn.degrees
  return normalizeHeading(from + signed)
}

/**
 * The shortest turn from one heading to another.
 *
 * Identical headings give a turn of 0 degrees. Exactly opposite headings are
 * 180 degrees either way; that case is reported as a right turn by convention.
 */
export function shortestTurn(from: number, to: number): Turn {
  const clockwise = (((normalizeHeading(to) - normalizeHeading(from)) % 360) + 360) % 360
  return clockwise <= 180
    ? { direction: 'right', degrees: clockwise }
    : { direction: 'left', degrees: 360 - clockwise }
}

export function oppositeDirection(direction: TurnDirection): TurnDirection {
  return direction === 'left' ? 'right' : 'left'
}

export function formatTurn(turn: Turn): string {
  return `${turn.direction === 'left' ? 'Left' : 'Right'} ${turn.degrees}°`
}
