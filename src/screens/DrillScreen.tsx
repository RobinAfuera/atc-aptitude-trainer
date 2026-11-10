import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { formatSeconds, formatTimeLimit } from '../app/format'
import { routes } from '../app/routes'
import { TimeBar } from '../components/TimeBar'
import { createRng, randomSeed } from '../core/rng'
import { summarize, type SessionSummary } from '../core/scoring'
import { createSession, currentResponse, sessionReducer } from '../core/session'
import { bestScore, lastLevelIndex, type SessionRecord } from '../core/sessionLog'
import type { AnyModule } from '../core/types'
import { findModule } from '../modules/registry'

/** How long the verdict stays on screen before the next item. */
const FEEDBACK_MS_CORRECT = 700
/** Longer after a miss, so the right answer can be read. */
const FEEDBACK_MS_MISS = 1900

interface DrillScreenProps {
  moduleId: string
  records: readonly SessionRecord[]
  onFinished: (record: SessionRecord) => void
}

export function DrillScreen({ moduleId, records, onFinished }: DrillScreenProps) {
  const module = findModule(moduleId)
  if (!module) {
    return (
      <section className="intro">
        <h1>No drill called “{moduleId}”</h1>
        <p>
          It may have been renamed or removed. <a href={routes.home}>Choose a drill</a> from the
          list.
        </p>
      </section>
    )
  }
  return <Drill key={module.id} module={module} records={records} onFinished={onFinished} />
}

interface RunConfig {
  levelIndex: number
  seed: number
}

interface DrillProps {
  module: AnyModule
  records: readonly SessionRecord[]
  onFinished: (record: SessionRecord) => void
}

function Drill({ module, records, onFinished }: DrillProps) {
  const [config, setConfig] = useState<RunConfig | null>(null)

  if (config === null) {
    const remembered = lastLevelIndex(records, module.id) ?? 0
    return (
      <Briefing
        module={module}
        records={records}
        initialLevelIndex={Math.min(remembered, module.levels.length - 1)}
        onStart={(levelIndex) => setConfig({ levelIndex, seed: randomSeed() })}
      />
    )
  }

  return (
    <Run
      // A new seed means a new session: remount to reset all of its state.
      key={config.seed}
      module={module}
      config={config}
      records={records}
      onFinished={onFinished}
      onRunAgain={() => setConfig({ levelIndex: config.levelIndex, seed: randomSeed() })}
      onLeave={() => setConfig(null)}
    />
  )
}

interface BriefingProps {
  module: AnyModule
  records: readonly SessionRecord[]
  initialLevelIndex: number
  onStart: (levelIndex: number) => void
}

function Briefing({ module, records, initialLevelIndex, onStart }: BriefingProps) {
  const [levelIndex, setLevelIndex] = useState(initialLevelIndex)

  return (
    <form
      className="briefing"
      onSubmit={(event) => {
        event.preventDefault()
        onStart(levelIndex)
      }}
    >
      <h1>{module.title}</h1>
      <ul className="briefing-instructions">
        {module.instructions.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <fieldset className="levels">
        <legend>Level</legend>
        {module.levels.map((level, index) => {
          const best = bestScore(records, module.id, index)
          return (
            <label key={level.detail} className="level">
              <input
                type="radio"
                name="level"
                checked={levelIndex === index}
                onChange={() => setLevelIndex(index)}
              />
              <span className="level-body">
                <span className="level-name">Level {index + 1}</span>
                <span className="level-detail">{level.detail}</span>
                <span className="level-meta">
                  <span className="num">{level.itemCount}</span> items,{' '}
                  <span className="num">{formatTimeLimit(level.timeLimitMs)}</span> each.{' '}
                  {best === null ? (
                    'Not run yet.'
                  ) : (
                    <>
                      Best score <span className="num">{best}</span>.
                    </>
                  )}
                </span>
              </span>
            </label>
          )
        })}
      </fieldset>

      <div className="actions">
        <button className="button" type="submit">
          Start drill
        </button>
        <a className="button button--quiet" href={routes.home}>
          Back to drills
        </a>
      </div>
    </form>
  )
}

interface RunProps {
  module: AnyModule
  config: RunConfig
  records: readonly SessionRecord[]
  onFinished: (record: SessionRecord) => void
  onRunAgain: () => void
  onLeave: () => void
}

function Run({ module, config, records, onFinished, onRunAgain, onLeave }: RunProps) {
  const level = module.levels[config.levelIndex]

  // Every item is generated up front from the seed, so a session is
  // reproducible and nothing is computed while the clock is running.
  const items = useMemo(() => {
    const rng = createRng(config.seed)
    return Array.from({ length: level.itemCount }, () => module.generate(rng, config.levelIndex))
  }, [module, config, level.itemCount])

  const [state, dispatch] = useReducer(sessionReducer, level.itemCount, createSession)
  const response = currentResponse(state)
  const shownAt = useRef(0)

  // The best score before this session, captured once so that saving this
  // session's record doesn't change what the result is compared against.
  const [previousBest] = useState(() => bestScore(records, module.id, config.levelIndex))

  // Start the clock when an item appears, and time it out at the limit.
  useEffect(() => {
    if (state.phase !== 'question') return
    shownAt.current = performance.now()
    const timer = window.setTimeout(
      () => dispatch({ type: 'timeout', timeLimitMs: level.timeLimitMs }),
      level.timeLimitMs,
    )
    return () => window.clearTimeout(timer)
  }, [state.phase, state.index, level.timeLimitMs])

  // Show the verdict briefly, then move on.
  const wasCorrect = response?.correct ?? false
  useEffect(() => {
    if (state.phase !== 'feedback') return
    const timer = window.setTimeout(
      () => dispatch({ type: 'next' }),
      wasCorrect ? FEEDBACK_MS_CORRECT : FEEDBACK_MS_MISS,
    )
    return () => window.clearTimeout(timer)
  }, [state.phase, state.index, wasCorrect])

  const finished = state.phase === 'finished'
  const summary = useMemo(
    () => (finished ? summarize(state.responses, level.timeLimitMs) : null),
    [finished, state.responses, level.timeLimitMs],
  )

  // Save the session exactly once, when it finishes.
  const saved = useRef(false)
  useEffect(() => {
    if (!summary || saved.current) return
    saved.current = true
    onFinished({
      id: `${Date.now().toString(36)}-${config.seed.toString(36)}`,
      moduleId: module.id,
      levelIndex: config.levelIndex,
      finishedAt: new Date().toISOString(),
      seed: config.seed,
      itemCount: summary.itemCount,
      correct: summary.correct,
      timedOut: summary.timedOut,
      meanResponseMs: summary.meanResponseMs,
      score: summary.score,
    })
  }, [summary, module.id, config, onFinished])

  if (summary) {
    return (
      <Results
        module={module}
        levelIndex={config.levelIndex}
        summary={summary}
        previousBest={previousBest}
        onRunAgain={onRunAgain}
        onLeave={onLeave}
      />
    )
  }

  const item = items[state.index]
  const locked = state.phase === 'feedback'
  const View = module.View

  const handleAnswer = (answer: unknown) => {
    if (state.phase !== 'question') return
    dispatch({
      type: 'answer',
      correct: module.isCorrect(item, answer),
      responseMs: performance.now() - shownAt.current,
    })
  }

  let verdict = ''
  let verdictClass = 'verdict'
  if (response) {
    if (response.correct) {
      verdict = `Correct in ${formatSeconds(response.responseMs)}.`
      verdictClass += ' verdict--good'
    } else {
      const lead = response.timedOut ? 'Out of time.' : 'Not correct.'
      verdict = `${lead} The answer is ${module.solution(item)}.`
      verdictClass += ' verdict--bad'
    }
  }

  return (
    <section className="run" aria-label={`${module.title}, level ${config.levelIndex + 1}`}>
      <div className="run-status">
        <p>
          Item <span className="num">{state.index + 1}</span> of{' '}
          <span className="num">{state.itemCount}</span>
        </p>
        <p>
          {module.title}, level {config.levelIndex + 1}
        </p>
      </div>
      <TimeBar key={state.index} durationMs={level.timeLimitMs} paused={locked} />

      <div className="run-item">
        <View key={state.index} item={item} locked={locked} onAnswer={handleAnswer} />
      </div>

      <p className={verdictClass} role="status">
        {verdict}
      </p>

      <button className="button button--quiet" type="button" onClick={onLeave}>
        Stop without saving
      </button>
    </section>
  )
}

interface ResultsProps {
  module: AnyModule
  levelIndex: number
  summary: SessionSummary
  previousBest: number | null
  onRunAgain: () => void
  onLeave: () => void
}

function Results({ module, levelIndex, summary, previousBest, onRunAgain, onLeave }: ResultsProps) {
  let comparison: string
  if (previousBest === null) {
    comparison = 'First session at this level. This is the score to beat.'
  } else if (summary.score > previousBest) {
    comparison = `New best at this level. The previous best was ${previousBest}.`
  } else if (summary.score === previousBest) {
    comparison = `Level with your best at this level, ${previousBest}.`
  } else {
    comparison = `Your best at this level is ${previousBest}.`
  }

  return (
    <section className="results">
      <h1>
        {module.title}, level {levelIndex + 1}
      </h1>

      <div className="results-board">
        <div className="results-score">
          <p className="results-score-value mono">{summary.score}</p>
          <p className="results-score-label">Score out of 100</p>
        </div>
        <dl className="results-figures">
          <div>
            <dt>Correct</dt>
            <dd className="num">
              {summary.correct} of {summary.itemCount}
            </dd>
          </div>
          <div>
            <dt>Out of time</dt>
            <dd className="num">{summary.timedOut}</dd>
          </div>
          <div>
            <dt>Mean response</dt>
            <dd className="num">
              {summary.meanResponseMs === null ? 'None' : formatSeconds(summary.meanResponseMs)}
            </dd>
          </div>
        </dl>
      </div>

      <p className="results-comparison">{comparison}</p>
      <p className="section-note">
        A correct answer scores 60 to 100 depending on how fast it was. A miss scores 0. The session
        score is the average over all items.
      </p>

      <div className="actions">
        <button className="button" type="button" onClick={onRunAgain} autoFocus>
          Run again
        </button>
        <button className="button button--quiet" type="button" onClick={onLeave}>
          Change level
        </button>
        <a className="button button--quiet" href={routes.log}>
          Open session log
        </a>
      </div>
    </section>
  )
}
