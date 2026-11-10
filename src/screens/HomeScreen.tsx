import { routes } from '../app/routes'
import { bestScore, sessionCount, type SessionRecord } from '../core/sessionLog'
import { CATEGORY_LABELS, modules, plannedDrills } from '../modules/registry'

interface HomeScreenProps {
  records: readonly SessionRecord[]
}

/**
 * The home screen is laid out as a strip board: one flight-progress-style
 * strip per drill, with the holder colour showing the ability it trains.
 */
export function HomeScreen({ records }: HomeScreenProps) {
  return (
    <>
      <section className="intro">
        <h1>Timed drills for air traffic controller selection</h1>
        <p>
          Short sessions that train the abilities selection tests look for, scored on accuracy and
          speed. Your results are kept in this browser, so you can see whether practice is moving
          them.
        </p>
      </section>

      <section aria-labelledby="ready-heading">
        <h2 id="ready-heading">Ready to run</h2>
        <ul className="bay">
          {modules.map((module) => {
            const best = bestScore(records, module.id)
            return (
              <li key={module.id}>
                <a className={`strip strip--${module.category}`} href={routes.drill(module.id)}>
                  <span className="strip-holder" aria-hidden="true" />
                  <span className="strip-cell strip-cell--main">
                    <span className="strip-title">{module.title}</span>
                    <span className="strip-summary">{module.summary}</span>
                  </span>
                  <span className="strip-cell">
                    <span className="strip-key">Ability</span>
                    <span className="strip-value">{CATEGORY_LABELS[module.category]}</span>
                  </span>
                  <span className="strip-cell">
                    <span className="strip-key">Sessions</span>
                    <span className="strip-value num">{sessionCount(records, module.id)}</span>
                  </span>
                  <span className="strip-cell">
                    <span className="strip-key">Best score</span>
                    <span className="strip-value num">{best ?? 'None yet'}</span>
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="planned-heading">
        <h2 id="planned-heading">Planned</h2>
        <p className="section-note">
          Designed but not built yet. The roadmap in the repository has the details.
        </p>
        <ul className="bay">
          {plannedDrills.map((drill) => (
            <li key={drill.title}>
              <div className={`strip strip--planned strip--${drill.category}`}>
                <span className="strip-holder" aria-hidden="true" />
                <span className="strip-cell strip-cell--main">
                  <span className="strip-title">{drill.title}</span>
                  <span className="strip-summary">{drill.summary}</span>
                </span>
                <span className="strip-cell">
                  <span className="strip-key">Ability</span>
                  <span className="strip-value">{CATEGORY_LABELS[drill.category]}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
