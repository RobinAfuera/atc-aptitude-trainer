/** Milliseconds as seconds with one decimal: 3412 becomes "3.4 s". */
export function formatSeconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)} s`
}

/** A time limit in whole seconds where possible: 10000 becomes "10 s". */
export function formatTimeLimit(ms: number): string {
  const seconds = ms / 1000
  return `${Number.isInteger(seconds) ? seconds : seconds.toFixed(1)} s`
}

const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

/** An ISO timestamp in the reader's own locale; the raw text if it can't be read. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : dateTime.format(date)
}
