import type { ComponentType } from 'react'
import type { Rng } from './rng'

/** The ability a drill exercises. Also decides the colour of its strip holder. */
export type Category = 'numerical' | 'spatial' | 'attention' | 'memory' | 'multitasking'

export interface Level {
  /** What changes at this level, in one short sentence. */
  detail: string
  /** Number of items in one session. */
  itemCount: number
  /** Time allowed per item, in milliseconds. */
  timeLimitMs: number
}

export interface ItemViewProps<Item, Answer> {
  item: Item
  /**
   * True once the item has been answered or has timed out. The view must stop
   * accepting input and may reveal the solution.
   */
  locked: boolean
  onAnswer: (answer: Answer) => void
}

/**
 * A drill. To add one, implement this interface in `src/modules/<id>/` and
 * register it in `src/modules/registry.ts`. The session runner, scoring and
 * session log work with any module that satisfies it.
 */
export interface TrainingModule<Item, Answer> {
  /** Stable identifier. Stored in the session log, so never rename it. */
  id: string
  title: string
  /** One sentence shown on the drill's strip. */
  summary: string
  category: Category
  /** Shown on the briefing screen before a session starts. */
  instructions: readonly string[]
  levels: readonly Level[]
  /** Build one item. Must be deterministic for a given RNG state. */
  generate(rng: Rng, levelIndex: number): Item
  isCorrect(item: Item, answer: Answer): boolean
  /** The correct answer as text, shown after a miss. */
  solution(item: Item): string
  View: ComponentType<ItemViewProps<Item, Answer>>
}

/**
 * Type-erased module, for the registry and the session runner. Each module is
 * fully typed where it is defined; `any` is confined to this one boundary.
 */
// oxlint-disable-next-line typescript/no-explicit-any
export type AnyModule = TrainingModule<any, any>
