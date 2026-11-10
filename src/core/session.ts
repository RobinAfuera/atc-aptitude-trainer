/**
 * Session state machine. Pure, so the timing-sensitive UI around it stays thin
 * and the rules (what counts, when a session ends) are covered by unit tests.
 *
 *   question --answer/timeout--> feedback --next--> question | finished
 */
export interface ItemResponse {
  correct: boolean
  timedOut: boolean
  /** Time from the item appearing to the answer; the full limit on a timeout. */
  responseMs: number
}

export type SessionPhase = 'question' | 'feedback' | 'finished'

export interface SessionState {
  itemCount: number
  /** Index of the item on screen. */
  index: number
  phase: SessionPhase
  responses: readonly ItemResponse[]
}

export type SessionAction =
  | { type: 'answer'; correct: boolean; responseMs: number }
  | { type: 'timeout'; timeLimitMs: number }
  | { type: 'next' }

export function createSession(itemCount: number): SessionState {
  if (!Number.isInteger(itemCount) || itemCount < 1) {
    throw new RangeError('A session needs at least one item')
  }
  return { itemCount, index: 0, phase: 'question', responses: [] }
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'answer': {
      // A late answer (after the timeout fired) must not overwrite the timeout.
      if (state.phase !== 'question') return state
      const response: ItemResponse = {
        correct: action.correct,
        timedOut: false,
        responseMs: Math.max(0, action.responseMs),
      }
      return { ...state, phase: 'feedback', responses: [...state.responses, response] }
    }
    case 'timeout': {
      if (state.phase !== 'question') return state
      const response: ItemResponse = {
        correct: false,
        timedOut: true,
        responseMs: action.timeLimitMs,
      }
      return { ...state, phase: 'feedback', responses: [...state.responses, response] }
    }
    case 'next': {
      if (state.phase !== 'feedback') return state
      const isLast = state.index + 1 >= state.itemCount
      return isLast
        ? { ...state, phase: 'finished' }
        : { ...state, index: state.index + 1, phase: 'question' }
    }
  }
}

/** The response to the item on screen, once it has one. */
export function currentResponse(state: SessionState): ItemResponse | undefined {
  return state.responses[state.index]
}
