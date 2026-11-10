/**
 * Hash-based routes, so the app works on any static host (GitHub Pages
 * included) without server-side rewrites.
 */
export type Route =
  | { name: 'home' }
  | { name: 'drill'; moduleId: string }
  | { name: 'log' }
  | { name: 'not-found' }

export const routes = {
  home: '#/',
  drill: (moduleId: string) => `#/drill/${encodeURIComponent(moduleId)}`,
  log: '#/log',
} as const

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/^\/+|\/+$/g, '')
  if (path === '') return { name: 'home' }
  if (path === 'log') return { name: 'log' }

  const drill = /^drill\/([^/]+)$/.exec(path)
  if (drill) {
    try {
      return { name: 'drill', moduleId: decodeURIComponent(drill[1]) }
    } catch {
      return { name: 'not-found' }
    }
  }
  return { name: 'not-found' }
}
