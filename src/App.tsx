import { routes } from './app/routes'
import { useHashRoute } from './app/useHashRoute'
import { useSessionLog } from './app/useSessionLog'
import { DrillScreen } from './screens/DrillScreen'
import { HomeScreen } from './screens/HomeScreen'
import { LogScreen } from './screens/LogScreen'

export default function App() {
  const route = useHashRoute()
  const { records, add, clear } = useSessionLog()

  return (
    <div className="app">
      <header className="masthead">
        <a className="masthead-name" href={routes.home}>
          ATC Aptitude Trainer
        </a>
        <nav aria-label="Main">
          <a href={routes.home} aria-current={route.name === 'home' ? 'page' : undefined}>
            Drills
          </a>
          <a href={routes.log} aria-current={route.name === 'log' ? 'page' : undefined}>
            Session log
          </a>
        </nav>
      </header>

      <main>
        {route.name === 'home' && <HomeScreen records={records} />}
        {route.name === 'drill' && (
          <DrillScreen moduleId={route.moduleId} records={records} onFinished={add} />
        )}
        {route.name === 'log' && <LogScreen records={records} onClear={clear} />}
        {route.name === 'not-found' && (
          <section className="intro">
            <h1>Nothing at this address</h1>
            <p>
              <a href={routes.home}>Go to the drills</a>.
            </p>
          </section>
        )}
      </main>

      <footer className="footnote">
        <p>
          An independent practice tool. It is not affiliated with EUROCONTROL or any air navigation
          service provider, and it does not reproduce any official selection test.
        </p>
      </footer>
    </div>
  )
}
