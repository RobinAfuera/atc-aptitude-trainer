import { useState } from 'react'
import { formatDateTime, formatSeconds } from '../app/format'
import { routes } from '../app/routes'
import type { SessionRecord } from '../core/sessionLog'
import { findModule } from '../modules/registry'

interface LogScreenProps {
  records: readonly SessionRecord[]
  onClear: () => void
}

export function LogScreen({ records, onClear }: LogScreenProps) {
  const [confirming, setConfirming] = useState(false)

  if (records.length === 0) {
    return (
      <section className="intro">
        <h1>Session log</h1>
        <p>
          No sessions yet. <a href={routes.home}>Run a drill</a> and its result is listed here.
        </p>
      </section>
    )
  }

  const newestFirst = [...records].reverse()

  return (
    <section>
      <h1>Session log</h1>
      <p className="section-note">
        <span className="num">{records.length}</span>{' '}
        {records.length === 1 ? 'session' : 'sessions'}, newest first. Kept in this browser only.
      </p>

      <div className="table-scroll">
        <table className="log">
          <thead>
            <tr>
              <th scope="col">Finished</th>
              <th scope="col">Drill</th>
              <th scope="col">Level</th>
              <th scope="col" className="log-number">
                Score
              </th>
              <th scope="col" className="log-number">
                Correct
              </th>
              <th scope="col" className="log-number">
                Mean response
              </th>
            </tr>
          </thead>
          <tbody>
            {newestFirst.map((record) => (
              <tr key={record.id}>
                <td>{formatDateTime(record.finishedAt)}</td>
                <td>{findModule(record.moduleId)?.title ?? record.moduleId}</td>
                <td className="num">{record.levelIndex + 1}</td>
                <td className="log-number num">{record.score}</td>
                <td className="log-number num">
                  {record.correct} of {record.itemCount}
                </td>
                <td className="log-number num">
                  {record.meanResponseMs === null ? 'None' : formatSeconds(record.meanResponseMs)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirming ? (
        <div className="actions" role="group" aria-label="Confirm deleting the session log">
          <p className="actions-question">
            Delete all <span className="num">{records.length}</span> sessions? This can't be
            undone.
          </p>
          <button
            className="button button--danger"
            type="button"
            onClick={() => {
              onClear()
              setConfirming(false)
            }}
          >
            Delete log
          </button>
          <button className="button button--quiet" type="button" onClick={() => setConfirming(false)}>
            Keep log
          </button>
        </div>
      ) : (
        <div className="actions">
          <button className="button button--quiet" type="button" onClick={() => setConfirming(true)}>
            Delete log
          </button>
        </div>
      )}
    </section>
  )
}
