import { useCallback, useState } from 'react'
import {
  createMemoryStorage,
  createSessionLog,
  STORAGE_KEY,
  type KeyValueStorage,
  type SessionRecord,
} from '../core/sessionLog'

/** localStorage when the browser allows it, otherwise memory for this visit only. */
function browserStorage(): KeyValueStorage {
  try {
    const storage = window.localStorage
    storage.getItem(STORAGE_KEY) // throws if storage is blocked
    return storage
  } catch {
    return createMemoryStorage()
  }
}

const log = createSessionLog(browserStorage())

export function useSessionLog() {
  const [records, setRecords] = useState<SessionRecord[]>(() => log.load())

  const add = useCallback((record: SessionRecord) => {
    setRecords(log.add(record))
  }, [])

  const clear = useCallback(() => {
    log.clear()
    setRecords([])
  }, [])

  return { records, add, clear }
}
