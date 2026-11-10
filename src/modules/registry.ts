import type { AnyModule, Category } from '../core/types'
import { arithmeticModule } from './arithmetic'
import { headingsModule } from './headings'

/** Every drill that can be run, in the order shown on the home screen. */
export const modules: readonly AnyModule[] = [arithmeticModule, headingsModule]

export function findModule(id: string): AnyModule | undefined {
  return modules.find((module) => module.id === id)
}

export const CATEGORY_LABELS: Record<Category, string> = {
  numerical: 'Numerical',
  spatial: 'Spatial',
  attention: 'Attention',
  memory: 'Memory',
  multitasking: 'Multitasking',
}

export interface PlannedDrill {
  title: string
  summary: string
  category: Category
}

/**
 * Drills that are designed but not built yet. Shown on the home screen so the
 * direction of the project is visible in the app; ROADMAP.md has the detail.
 */
export const plannedDrills: readonly PlannedDrill[] = [
  {
    title: 'Radar conflicts',
    summary: 'Watch traffic on a simplified radar and flag the pairs that will lose separation.',
    category: 'spatial',
  },
  {
    title: 'Vigilance clock',
    summary: 'Follow a dot stepping round a clock face and catch the rare double step.',
    category: 'attention',
  },
  {
    title: 'Digit span',
    summary: 'Hear a string of digits once and type it back, forwards or reversed.',
    category: 'memory',
  },
  {
    title: 'Dual task',
    summary: 'Check sums while keeping a drifting marker inside its box.',
    category: 'multitasking',
  },
  {
    title: 'Cube nets',
    summary: 'Decide which cube a flat pattern folds into.',
    category: 'spatial',
  },
]
