/**
 * The session log: one record per finished drill, kept in the browser's
 * localStorage. Nothing leaves the device.
 */
export interface SessionRecord {
  id: string
  moduleId: string
  levelIndex: number
  /** ISO 8601 timestamp. */
  finishedAt: string
  /** Seed the items were generated from, so a session can be replayed. */
  seed: number
  itemCount: number
  correct: number
  timedOut: number
  meanResponseMs: number | null
  score: number
}

/** The part of the Web Storage API the log needs; lets tests pass a fake. */
export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export interface SessionLog {
  /** All records, oldest first. */
  load(): SessionRecord[]
  /** Append a record and return the updated list. */
  add(record: SessionRecord): SessionRecord[]
  clear(): void
}

export const STORAGE_KEY = 'atc-aptitude-trainer:session-log'
const SCHEMA_VERSION = 1
/** Oldest records are dropped beyond this, to stay well inside storage quotas. */
export const MAX_RECORDS = 1000

interface StoredLog {
  version: number
  records: SessionRecord[]
}

function isRecord(value: unknown): value is SessionRecord {
  if (typeof value !== 'object' || value === null) return false
  const r = value as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    typeof r.moduleId === 'string' &&
    typeof r.levelIndex === 'number' &&
    typeof r.finishedAt === 'string' &&
    typeof r.seed === 'number' &&
    typeof r.itemCount === 'number' &&
    typeof r.correct === 'number' &&
    typeof r.timedOut === 'number' &&
    (r.meanResponseMs === null || typeof r.meanResponseMs === 'number') &&
    typeof r.score === 'number'
  )
}

export function createSessionLog(storage: KeyValueStorage): SessionLog {
  const load = (): SessionRecord[] => {
    try {
      const raw = storage.getItem(STORAGE_KEY)
      if (raw === null) return []
      const parsed = JSON.parse(raw) as Partial<StoredLog> | null
      if (!parsed || parsed.version !== SCHEMA_VERSION || !Array.isArray(parsed.records)) return []
      // Skip anything malformed instead of throwing the whole log away.
      return parsed.records.filter(isRecord)
    } catch {
      return []
    }
  }

  const save = (records: SessionRecord[]): void => {
    try {
      const stored: StoredLog = { version: SCHEMA_VERSION, records }
      storage.setItem(STORAGE_KEY, JSON.stringify(stored))
    } catch {
      // Storage full or blocked (private browsing): the session still counts
      // on screen, it just isn't kept.
    }
  }

  return {
    load,
    add(record) {
      const records = [...load(), record].slice(-MAX_RECORDS)
      save(records)
      return records
    },
    clear() {
      try {
        storage.removeItem(STORAGE_KEY)
      } catch {
        // Nothing to clear if storage is unavailable.
      }
    },
  }
}

/** In-memory stand-in for when localStorage is unavailable, and for tests. */
export function createMemoryStorage(): KeyValueStorage {
  const data = new Map<string, string>()
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value)
    },
    removeItem: (key) => {
      data.delete(key)
    },
  }
}

/** Highest score for a drill, optionally at one level; null if never run. */
export function bestScore(
  records: readonly SessionRecord[],
  moduleId: string,
  levelIndex?: number,
): number | null {
  const scores = records
    .filter((r) => r.moduleId === moduleId && (levelIndex === undefined || r.levelIndex === levelIndex))
    .map((r) => r.score)
  return scores.length === 0 ? null : Math.max(...scores)
}

export function sessionCount(records: readonly SessionRecord[], moduleId: string): number {
  return records.filter((r) => r.moduleId === moduleId).length
}

/** The level of the most recent session of a drill; null if never run. */
export function lastLevelIndex(records: readonly SessionRecord[], moduleId: string): number | null {
  const last = records.findLast((r) => r.moduleId === moduleId)
  return last ? last.levelIndex : null
}
