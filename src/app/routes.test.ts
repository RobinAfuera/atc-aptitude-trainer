import { describe, expect, it } from 'vitest'
import { parseRoute, routes } from './routes'

describe('parseRoute', () => {
  it('treats an empty hash as home', () => {
    expect(parseRoute('')).toEqual({ name: 'home' })
    expect(parseRoute('#')).toEqual({ name: 'home' })
    expect(parseRoute('#/')).toEqual({ name: 'home' })
  })

  it('reads the session log route', () => {
    expect(parseRoute('#/log')).toEqual({ name: 'log' })
    expect(parseRoute('#/log/')).toEqual({ name: 'log' })
  })

  it('reads a drill route', () => {
    expect(parseRoute('#/drill/arithmetic')).toEqual({ name: 'drill', moduleId: 'arithmetic' })
  })

  it('round-trips every link the app builds', () => {
    expect(parseRoute(routes.home)).toEqual({ name: 'home' })
    expect(parseRoute(routes.log)).toEqual({ name: 'log' })
    expect(parseRoute(routes.drill('heading turns'))).toEqual({
      name: 'drill',
      moduleId: 'heading turns',
    })
  })

  it('reports anything else as not found', () => {
    expect(parseRoute('#/nope')).toEqual({ name: 'not-found' })
    expect(parseRoute('#/drill')).toEqual({ name: 'not-found' })
    expect(parseRoute('#/drill/a/b')).toEqual({ name: 'not-found' })
    expect(parseRoute('#/drill/%E0%A4%A')).toEqual({ name: 'not-found' })
  })
})
