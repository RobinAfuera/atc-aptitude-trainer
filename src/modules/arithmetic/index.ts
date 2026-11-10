import type { TrainingModule } from '../../core/types'
import { ArithmeticView } from './ArithmeticView'
import { generateArithmeticItem, type ArithmeticItem } from './generate'

export const arithmeticModule: TrainingModule<ArithmeticItem, number> = {
  id: 'arithmetic',
  title: 'Mental arithmetic',
  summary: 'Work out calculations in your head against the clock.',
  category: 'numerical',
  instructions: [
    'A calculation appears. Work it out in your head and type the result.',
    'Press Enter to check it. Each item has its own time limit, shown by the bar; when the bar runs out, the item counts as missed.',
    'A correct answer scores more the faster you give it. A wrong answer scores nothing, so guessing does not pay.',
  ],
  levels: [
    { detail: 'Add and subtract two-digit numbers.', itemCount: 15, timeLimitMs: 10_000 },
    {
      detail: 'Multiply and divide, and add or subtract three-digit numbers.',
      itemCount: 15,
      timeLimitMs: 15_000,
    },
    {
      detail: 'Two-step calculations, and speed, time and distance.',
      itemCount: 12,
      timeLimitMs: 20_000,
    },
  ],
  generate: generateArithmeticItem,
  isCorrect: (item, answer) => answer === item.answer,
  solution: (item) => String(item.answer),
  View: ArithmeticView,
}
