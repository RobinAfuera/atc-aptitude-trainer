import { describe, expect, it } from 'vitest'
import { createRng } from '../core/rng'
import { findModule, modules } from './registry'

/**
 * Contract tests: every registered drill has to satisfy these, so a new
 * module is checked as soon as it is added to the registry.
 */
describe('module registry', () => {
  it('has unique ids', () => {
    const ids = modules.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('finds a module by id', () => {
    expect(findModule('arithmetic')?.title).toBe('Mental arithmetic')
    expect(findModule('nope')).toBeUndefined()
  })

  describe.each(modules.map((m) => [m.id, m] as const))('%s', (_id, module) => {
    it('describes itself', () => {
      expect(module.title).not.toBe('')
      expect(module.summary).not.toBe('')
      expect(module.instructions.length).toBeGreaterThan(0)
      expect(module.levels.length).toBeGreaterThan(0)
    })

    it('has sensible session lengths and time limits', () => {
      for (const level of module.levels) {
        expect(level.itemCount).toBeGreaterThanOrEqual(5)
        expect(level.timeLimitMs).toBeGreaterThanOrEqual(2000)
        expect(level.detail).not.toBe('')
      }
    })

    it('generates a full session at every level', () => {
      module.levels.forEach((level, levelIndex) => {
        const rng = createRng(1234 + levelIndex)
        for (let i = 0; i < level.itemCount; i++) {
          const item = module.generate(rng, levelIndex)
          expect(module.solution(item)).not.toBe('')
        }
      })
    })
  })
})
