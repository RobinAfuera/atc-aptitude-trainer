import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { ItemViewProps } from '../../core/types'
import { parseAnswer, type ArithmeticItem } from './generate'

export function ArithmeticView({ item, locked, onAnswer }: ItemViewProps<ArithmeticItem, number>) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // The runner mounts a fresh view per item, so this puts the cursor in the
  // answer box as soon as each calculation appears.
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (locked) return
    const value = parseAnswer(text)
    if (value !== null) onAnswer(value)
  }

  return (
    <form className="arithmetic" onSubmit={submit}>
      <p className="arithmetic-caption">{item.caption ?? 'Work out'}</p>
      <p
        className={
          item.caption === null
            ? 'arithmetic-expression mono'
            : 'arithmetic-expression arithmetic-expression--phrase mono'
        }
      >
        {item.expression}
      </p>
      <div className="arithmetic-entry">
        <label htmlFor="arithmetic-answer">Your answer</label>
        <input
          id="arithmetic-answer"
          ref={inputRef}
          className="mono"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          enterKeyHint="done"
          value={text}
          readOnly={locked}
          onChange={(event) => setText(event.target.value.replace(/\D/g, '').slice(0, 6))}
        />
        <button className="button" type="submit" disabled={locked || text === ''}>
          Check answer
        </button>
      </div>
    </form>
  )
}
