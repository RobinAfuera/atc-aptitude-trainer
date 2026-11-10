import { useMemo, useSyncExternalStore } from 'react'
import { parseRoute, type Route } from './routes'

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

/** The current route, kept in step with the URL hash. */
export function useHashRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  return useMemo(() => parseRoute(hash), [hash])
}
