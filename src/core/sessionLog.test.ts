import { describe, expect, it } from 'vitest'
import {
  bestScore,
  createMemoryStorage,
  createSessionLog,
  lastLevelIndex,
  MAX_RECORDS,
  sessionCount,
  STORAGE_KEY,
  type SessionRecord,
} from './sessionLog'

const record = (overrides: Partial<SessionRecord> = {}): SessionRecord => ({
  id: 'r1',
  moduleId: 'arithmetic',
  levelIndex: 0,
  finishedAt: '2026-11-10T10:00:00.000Z',
  seed: 123,
  itemCount: 15,
  correct: 12,
  timedOut: 1,
  meanResponseMs: 3400,
  score: 71,
  ...overrides,
})

describe('session log', () => {
  it('is empty before anything is saved', () => {
    expect(createSessionLog(createMemoryStorage()).load()).toEqual([])
  })

  it('keeps records across instances that share a storage', () => {
    const storage = createMemoryStorage()
    createSessionLog(storage).add(record())
    expect(createSessionLog(storage).load()).toEqual([record()])
  })

  it('appends in order and returns the updated list', () => {
    const log = createSessionLog(createMemoryStorage())
    log.add(record({ id: 'a' }))
    const records = log.add(record({ id: 'b' }))
    expect(records.map((r) => r.id)).toEqual(['a', 'b'])
  })

  it('clears everything', () => {
    const log = createSessionLog(createMemoryStorage())
    log.add(record())
    log.clear()
    expect(log.load()).toEqual([])
  })

  it('survives corrupted storage', () => {
    const storage = createMemoryStorage()
    storage.setItem(STORAGE_KEY, '{not json')
    expect(createSessionLog(storage).load()).toEqual([])
  })

  it('ignores data written by an unknown schema version', () => {
    const storage = createMemoryStorage()
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 999, records: [record()] }))
    expect(createSessionLog(storage).load()).toEqual([])
  })

  it('drops malformed records and keeps the valid ones', () => {
    const storage = createMemoryStorage()
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, records: [record({ id: 'ok' }), { id: 'broken' }, null] }),
    )
    expect(createSessionLog(storage).load().map((r) => r.id)).toEqual(['ok'])
  })

  it('drops the oldest records beyond the cap', () => {
    const storage = createMemoryStorage()
    const full = Array.from({ length: MAX_RECORDS }, (_, i) => record({ id: `r${i}` }))
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, records: full }))

    const records = createSessionLog(storage).add(record({ id: 'newest' }))
    expect(records).toHaveLength(MAX_RECORDS)
    expect(records[0].id).toBe('r1')
    expect(records.at(-1)?.id).toBe('newest')
  })

  it('does not throw when storage refuses to write', () => {
    const storage = createMemoryStorage()
    storage.setItem = () => {
      throw new Error('QuotaExceededError')
    }
    expect(() => createSessionLog(storage).add(record())).not.toThrow()
  })
})

describe('log queries', () => {
  const records = [
    record({ id: 'a', moduleId: 'arithmetic', levelIndex: 0, score: 60 }),
    record({ id: 'b', moduleId: 'arithmetic', levelIndex: 1, score: 85 }),
    record({ id: 'c', moduleId: 'headings', levelIndex: 0, score: 40 }),
  ]

  it('finds the best score for a drill across levels', () => {
    expect(bestScore(records, 'arithmetic')).toBe(85)
  })

  it('finds the best score at one level', () => {
    expect(bestScore(records, 'arithmetic', 0)).toBe(60)
  })

  it('returns null for a drill that was never run', () => {
    expect(bestScore(records, 'radar')).toBeNull()
  })

  it('counts sessions per drill', () => {
    expect(sessionCount(records, 'arithmetic')).toBe(2)
    expect(sessionCount(records, 'radar')).toBe(0)
  })

  it('remembers the level of the most recent session of a drill', () => {
    expect(lastLevelIndex(records, 'arithmetic')).toBe(1)
    expect(lastLevelIndex(records, 'headings')).toBe(0)
    expect(lastLevelIndex(records, 'radar')).toBeNull()
  })
})
