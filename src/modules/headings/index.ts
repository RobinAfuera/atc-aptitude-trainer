import type { TrainingModule } from '../../core/types'
import { generateHeadingsItem, type HeadingsItem } from './generate'
import { HeadingsView } from './HeadingsView'
import { formatTurn } from './logic'

/** The answer is the index of the chosen option. */
export const headingsModule: TrainingModule<HeadingsItem, number> = {
  id: 'headings',
  title: 'Heading turns',
  summary: 'Pick the shortest turn from one heading onto another.',
  category: 'spatial',
  instructions: [
    'You are flying one heading and are told to turn onto another.',
    'Choose the shortest turn: its direction and its size in degrees. Click an option or press 1 to 4.',
    'One option always reaches the new heading the long way round. It counts as wrong.',
  ],
  levels: [
    {
      detail: 'Headings in steps of 30°. The compass marks both headings.',
      itemCount: 15,
      timeLimitMs: 10_000,
    },
    {
      detail: 'Headings in steps of 10°. The compass marks only your current heading.',
      itemCount: 15,
      timeLimitMs: 8_000,
    },
    { detail: 'Headings in steps of 5°. No compass.', itemCount: 15, timeLimitMs: 8_000 },
  ],
  generate: generateHeadingsItem,
  isCorrect: (item, answer) => answer === item.correctIndex,
  solution: (item) => formatTurn(item.options[item.correctIndex]),
  View: HeadingsView,
}
