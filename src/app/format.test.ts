import { describe, expect, it } from 'vitest'
import { formatDateTime, formatSeconds, formatTimeLimit } from './format'

describe('formatSeconds', () => {
  it('shows one decimal', () => {
    expect(formatSeconds(3412)).toBe('3.4 s')
    expect(formatSeconds(0)).toBe('0.0 s')
    expect(formatSeconds(10_000)).toBe('10.0 s')
  })
})

describe('formatTimeLimit', () => {
  it('drops the decimal for whole seconds', () => {
    expect(formatTimeLimit(10_000)).toBe('10 s')
    expect(formatTimeLimit(7500)).toBe('7.5 s')
  })
})

describe('formatDateTime', () => {
  it('falls back to the raw text for an unreadable timestamp', () => {
    expect(formatDateTime('not a date')).toBe('not a date')
  })

  it('formats a valid timestamp', () => {
    expect(formatDateTime('2026-11-10T10:00:00.000Z')).toMatch(/2026/)
  })
})
