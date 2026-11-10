import { describe, expect, it } from 'vitest'
import { createSession, currentResponse, sessionReducer, type SessionState } from './session'

describe('session state machine', () => {
  it('starts on the first question with no responses', () => {
    expect(createSession(3)).toEqual({ itemCount: 3, index: 0, phase: 'question', responses: [] })
  })

  it('rejects a session without items', () => {
    expect(() => createSession(0)).toThrow(RangeError)
  })

  it('records an answer and moves to feedback', () => {
    const state = sessionReducer(createSession(2), { type: 'answer', correct: true, responseMs: 1200 })
    expect(state.phase).toBe('feedback')
    expect(currentResponse(state)).toEqual({ correct: true, timedOut: false, responseMs: 1200 })
  })

  it('records a timeout as a miss that used the full limit', () => {
    const state = sessionReducer(createSession(2), { type: 'timeout', timeLimitMs: 8000 })
    expect(currentResponse(state)).toEqual({ correct: false, timedOut: true, responseMs: 8000 })
  })

  it('ignores an answer that arrives after the timeout', () => {
    const timedOut = sessionReducer(createSession(2), { type: 'timeout', timeLimitMs: 8000 })
    const late = sessionReducer(timedOut, { type: 'answer', correct: true, responseMs: 8001 })
    expect(late).toBe(timedOut)
  })

  it('ignores a timeout that fires after the answer', () => {
    const answered = sessionReducer(createSession(2), { type: 'answer', correct: true, responseMs: 500 })
    expect(sessionReducer(answered, { type: 'timeout', timeLimitMs: 8000 })).toBe(answered)
  })

  it('does not advance before the item has a response', () => {
    const state = createSession(2)
    expect(sessionReducer(state, { type: 'next' })).toBe(state)
  })

  it('walks through every item and then finishes', () => {
    let state: SessionState = createSession(2)
    state = sessionReducer(state, { type: 'answer', correct: true, responseMs: 900 })
    state = sessionReducer(state, { type: 'next' })
    expect(state).toMatchObject({ index: 1, phase: 'question' })

    state = sessionReducer(state, { type: 'answer', correct: false, responseMs: 2000 })
    state = sessionReducer(state, { type: 'next' })
    expect(state.phase).toBe('finished')
    expect(state.responses).toHaveLength(2)
  })

  it('never stores a negative response time', () => {
    const state = sessionReducer(createSession(1), { type: 'answer', correct: true, responseMs: -5 })
    expect(currentResponse(state)?.responseMs).toBe(0)
  })
})
