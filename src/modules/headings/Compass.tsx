import { formatHeading, shortestTurn } from './logic'

interface CompassProps {
  from: number
  to: number
  /** Mark the target heading on the rim. */
  showTarget: boolean
  /** Draw the shortest turn as an arc, once the item is over. */
  showTurn: boolean
}

const CENTER = 120
const RADIUS = 96
/** Length of the heading needle; it stops short of the rose labels. */
const NEEDLE = 60
/** Rose labels as printed on a heading indicator: cardinals, then tens of degrees. */
const LABELS = ['N', '3', '6', 'E', '12', '15', 'S', '21', '24', 'W', '30', '33']

/** Point on a circle around the centre, for a heading measured clockwise from north. */
function point(heading: number, radius: number): [number, number] {
  const radians = (heading * Math.PI) / 180
  return [CENTER + radius * Math.sin(radians), CENTER - radius * Math.cos(radians)]
}

export function Compass({ from, to, showTarget, showTurn }: CompassProps) {
  const turn = shortestTurn(from, to)
  const [startX, startY] = point(from, RADIUS)
  const [endX, endY] = point(to, RADIUS)
  // SVG sweep flag 1 draws clockwise on screen, which is a right turn.
  const sweep = turn.direction === 'right' ? 1 : 0

  const label = showTarget
    ? `Compass. Current heading ${formatHeading(from)}, target heading ${formatHeading(to)}.`
    : `Compass. Current heading ${formatHeading(from)}.`

  return (
    <svg className="compass" viewBox="0 0 240 240" role="img" aria-label={label}>
      <circle className="compass-ring" cx={CENTER} cy={CENTER} r={RADIUS} />

      {Array.from({ length: 36 }, (_, i) => {
        const heading = i * 10
        const major = heading % 30 === 0
        const [x1, y1] = point(heading, RADIUS)
        const [x2, y2] = point(heading, RADIUS - (major ? 12 : 6))
        return (
          <line
            key={heading}
            className={major ? 'compass-tick compass-tick--major' : 'compass-tick'}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
          />
        )
      })}

      {LABELS.map((text, i) => {
        const [x, y] = point(i * 30, RADIUS - 26)
        return (
          <text key={text} className="compass-label" x={x} y={y}>
            {text}
          </text>
        )
      })}

      {showTurn && (
        <path
          className="compass-turn"
          d={`M ${startX} ${startY} A ${RADIUS} ${RADIUS} 0 0 ${sweep} ${endX} ${endY}`}
        />
      )}

      {(showTarget || showTurn) && (
        <path
          className="compass-target"
          transform={`rotate(${to} ${CENTER} ${CENTER})`}
          d={`M ${CENTER} ${CENTER - RADIUS + 3} l -8 -15 h 16 z`}
        />
      )}

      <g className="compass-aircraft" transform={`rotate(${from} ${CENTER} ${CENTER})`}>
        <line x1={CENTER} y1={CENTER} x2={CENTER} y2={CENTER - NEEDLE + 14} />
        <path d={`M ${CENTER} ${CENTER - NEEDLE} l 8 16 h -16 z`} />
        <circle cx={CENTER} cy={CENTER} r={4.5} />
      </g>
    </svg>
  )
}
