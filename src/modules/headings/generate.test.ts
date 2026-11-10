import { describe, expect, it } from 'vitest'
import { createRng } from '../../core/rng'
import { generateHeadingsItem, HEADINGS_LEVEL_COUNT, type HeadingsItem } from './generate'
import { applyTurn, shortestTurn } from './logic'

function sample(levelIndex: number, count = 600): HeadingsItem[] {
  const items: HeadingsItem[] = []
  for (let seed = 1; seed <= 6; seed++) {
    const rng = createRng(seed * 31)
    for (let i = 0; i < count / 6; i++) items.push(generateHeadingsItem(rng, levelIndex))
  }
  return items
}

const levels = [0, 1, 2]

describe('generateHeadingsItem', () => {
  it('is deterministic for a given seed', () => {
    const a = createRng(77)
    const b = createRng(77)
    for (let i = 0; i < 30; i++) {
      expect(generateHeadingsItem(a, 1)).toEqual(generateHeadingsItem(b, 1))
    }
  })

  it.each(levels)('marks the shortest turn as correct at level index %i', (levelIndex) => {
    for (const item of sample(levelIndex)) {
      expect(item.options[item.correctIndex]).toEqual(shortestTurn(item.from, item.to))
    }
  })

  it.each(levels)('offers four different turns at level index %i', (levelIndex) => {
    for (const item of sample(levelIndex)) {
      const labels = item.options.map((o) => `${o.direction}-${o.degrees}`)
      expect(new Set(labels).size).toBe(4)
    }
  })

  it.each(levels)('has exactly one shortest turn among the options at level index %i', (levelIndex) => {
    for (const item of sample(levelIndex)) {
      const shortest = shortestTurn(item.from, item.to)
      const matches = item.options.filter(
        (o) => o.direction === shortest.direction && o.degrees === shortest.degrees,
      )
      expect(matches).toHaveLength(1)
    }
  })

  it.each(levels)('never asks for no turn or a 180 degree turn at level index %i', (levelIndex) => {
    for (const item of sample(levelIndex)) {
      const { degrees } = shortestTurn(item.from, item.to)
      expect(degrees).toBeGreaterThan(0)
      expect(degrees).toBeLessThan(180)
    }
  })

  it.each(levels)('keeps every option a real turn at level index %i', (levelIndex) => {
    for (const item of sample(levelIndex)) {
      for (const option of item.options) {
        expect(option.degrees).toBeGreaterThan(0)
        expect(option.degrees).toBeLessThan(360)
      }
    }
  })

  it('includes the long way round as a trap: it arrives, but is not shortest', () => {
    for (const item of sample(1)) {
      const arrivals = item.options.filter((o) => applyTurn(item.from, o) === item.to)
      expect(arrivals).toHaveLength(2)
    }
  })

  it('uses coarser headings and more compass help at lower levels', () => {
    const steps = [30, 10, 5]
    const aids = ['full', 'plain', 'none']
    levels.forEach((levelIndex) => {
      for (const item of sample(levelIndex)) {
        expect(item.from % steps[levelIndex]).toBe(0)
        expect(item.to % steps[levelIndex]).toBe(0)
        expect(item.compass).toBe(aids[levelIndex])
        expect(item.from).toBeGreaterThanOrEqual(1)
        expect(item.from).toBeLessThanOrEqual(360)
      }
    })
  })

  it('asks for left and right turns about equally often', () => {
    const items = sample(1)
    const left = items.filter((i) => i.options[i.correctIndex].direction === 'left').length
    expect(left / items.length).toBeGreaterThan(0.4)
    expect(left / items.length).toBeLessThan(0.6)
  })

  it('rejects a level that does not exist', () => {
    expect(() => generateHeadingsItem(createRng(1), HEADINGS_LEVEL_COUNT)).toThrow(RangeError)
  })
})
