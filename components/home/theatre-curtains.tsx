const SWAGS = 6
const VB_W = 1200

function swagCurve(yTop: number, yDip: number) {
  const period = VB_W / SWAGS
  let d = `M 0 ${yTop}`
  for (let i = 0; i < SWAGS; i++) {
    const x0 = i * period
    const x1 = (i + 1) * period
    const mid = (x0 + x1) / 2
    d += ` C ${x0 + period * 0.28} ${yTop}, ${mid - period * 0.16} ${yDip}, ${mid} ${yDip}`
    d += ` C ${mid + period * 0.16} ${yDip}, ${x1 - period * 0.28} ${yTop}, ${x1} ${yTop}`
  }
  return d
}

function swagFill(yTop: number, yDip: number) {
  return `${swagCurve(yTop, yDip)} L ${VB_W} 0 L 0 0 Z`
}

const FRINGE = Array.from({ length: 97 }, (_, index) => {
  const x = (index / 96) * VB_W
  const period = VB_W / SWAGS
  const wave = Math.sin(((x % period) / period) * Math.PI)
  const y = 28 + wave * 62
  return { x, y, len: 7 + wave * 9 }
})

function TasselMark() {
  return (
    <svg viewBox="0 0 24 56" width="16" height="38" aria-hidden>
      <path d="M12 0 V14" stroke="var(--theme-accent)" strokeWidth="1.4" />
      <circle cx="12" cy="17.5" r="3.1" fill="var(--theme-accent)" />
      <path
        d="M4.5 21.5 C8 26 16 26 19.5 21.5 L17.2 50.5 C14.6 46.5 9.4 46.5 6.8 50.5 Z"
        fill="var(--theme-accent)"
      />
      <path d="M8.2 24 L12 48" stroke="color-mix(in srgb, var(--theme-dark) 55%, transparent)" strokeWidth="0.7" />
      <path d="M15.8 24 L12 48" stroke="color-mix(in srgb, white 35%, transparent)" strokeWidth="0.6" />
    </svg>
  )
}

function Drape({ side }: { side: 'left' | 'right' }) {
  return (
    <div className={`theatre-drape theatre-drape-${side}`}>
      <div className="theatre-cloth theatre-cloth-rear" />
      <div className="theatre-cloth theatre-cloth-front">
        <span className="theatre-sheen" />
        <span className="theatre-hem" />
        <span className="theatre-lip" />
      </div>
    </div>
  )
}

export function TheatreCurtains() {
  return (
    <>
    <div className="theatre-shade theatre-shade-top" />
      <div className="theatre-shade theatre-shade-left" />
      <div className="theatre-shade theatre-shade-right" />
    <div className="theatre-curtains" aria-hidden>
      <Drape side="left" />
      <Drape side="right" />
      <div className="theatre-valance">
        <svg className="theatre-swag" viewBox={`0 0 ${VB_W} 150`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="theatre-swag-face" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="color-mix(in srgb, var(--theme-dark) 78%, var(--theme-accent))" />
              <stop offset="48%" stopColor="color-mix(in srgb, var(--theme-dark) 46%, var(--theme-accent))" />
              <stop offset="100%" stopColor="color-mix(in srgb, var(--theme-dark) 88%, black)" />
            </linearGradient>
            <pattern id="theatre-swag-folds" width="86" height="150" patternUnits="userSpaceOnUse">
              <rect width="86" height="150" fill="url(#theatre-swag-face)" />
              <rect width="16" height="150" fill="color-mix(in srgb, black 32%, transparent)" />
              <rect x="34" width="14" height="150" fill="color-mix(in srgb, var(--theme-accent) 38%, transparent)" />
              <rect x="70" width="16" height="150" fill="color-mix(in srgb, black 24%, transparent)" />
            </pattern>
          </defs>
          <path d={swagFill(22, 108)} fill="color-mix(in srgb, var(--theme-dark) 92%, black)" />
          <path d={swagFill(18, 92)} fill="url(#theatre-swag-folds)" />
          <path
            d={swagCurve(18, 92)}
            fill="none"
            stroke="var(--theme-accent)"
            strokeWidth="2.25"
            strokeDasharray="1.5 2.4"
            vectorEffect="non-scaling-stroke"
          />
          {FRINGE.map((tick) => (
            <line
              key={tick.x}
              x1={tick.x}
              y1={tick.y}
              x2={tick.x}
              y2={tick.y + tick.len}
              stroke="var(--theme-accent)"
              strokeWidth="1.15"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        <div className="theatre-pelmet" />
        <div className="theatre-tassels">
          {Array.from({ length: SWAGS }, (_, index) => {
            const fromCenter = Math.abs(index - (SWAGS - 1) / 2)
            return (
              <span
                key={index}
                className="theatre-tassel"
                style={{
                  left: `${((index + 0.5) / SWAGS) * 100}%`,
                  animationDelay: `${0.55 + fromCenter * 0.07}s`,
                  animationDirection: index % 2 === 0 ? 'normal' : 'reverse',
                }}
              >
                <TasselMark />
              </span>
            )
          })}
        </div>
      </div>
    </div>
    </>
  )
}
