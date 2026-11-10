import { useEffect, useState } from 'react'
import type { ItemViewProps } from '../../core/types'
import { Compass } from './Compass'
import type { HeadingsItem } from './generate'
import { formatHeading, formatTurn } from './logic'

export function HeadingsView({ item, locked, onAnswer }: ItemViewProps<HeadingsItem, number>) {
  const [chosen, setChosen] = useState<number | null>(null)

  const choose = (index: number) => {
    if (locked) return
    setChosen(index)
    onAnswer(index)
  }

  // Keys 1 to 4 pick an option, so the drill can be run without the mouse.
  useEffect(() => {
    if (locked) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return
      const index = Number(event.key) - 1
      if (Number.isInteger(index) && index >= 0 && index < item.options.length) {
        event.preventDefault()
        setChosen(index)
        onAnswer(index)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [locked, item, onAnswer])

  return (
    <div className={item.compass === 'none' ? 'headings headings--no-compass' : 'headings'}>
      <div className="headings-task">
        <p className="headings-prompt">
          Flying heading <strong className="mono">{formatHeading(item.from)}</strong>. Turn onto
          heading <strong className="mono">{formatHeading(item.to)}</strong>.
        </p>
        <ol className="options" aria-label="Shortest turn">
          {item.options.map((option, index) => {
            const state = !locked
              ? ''
              : index === item.correctIndex
                ? ' is-correct'
                : index === chosen
                  ? ' is-wrong'
                  : ''
            return (
              <li key={`${option.direction}-${option.degrees}`}>
                <button
                  type="button"
                  className={`option${state}`}
                  disabled={locked}
                  onClick={() => choose(index)}
                >
                  <kbd className="option-key">{index + 1}</kbd>
                  <span className="option-label">{formatTurn(option)}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
      {item.compass !== 'none' && (
        <Compass
          from={item.from}
          to={item.to}
          showTarget={item.compass === 'full'}
          showTurn={locked}
        />
      )}
    </div>
  )
}
