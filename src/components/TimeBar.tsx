import type { CSSProperties } from 'react'

interface TimeBarProps {
  durationMs: number
  /** Freeze the bar where it is, once the item has been answered. */
  paused: boolean
}

/**
 * The time left for the current item. Purely visual: the session runner owns
 * the actual timeout. Mount it with a new `key` per item to restart it.
 */
export function TimeBar({ durationMs, paused }: TimeBarProps) {
  const style: CSSProperties = {
    animationDuration: `${durationMs}ms`,
    animationPlayState: paused ? 'paused' : 'running',
  }
  return (
    <div className="timebar" aria-hidden="true">
      <div className="timebar-fill" style={style} />
    </div>
  )
}
