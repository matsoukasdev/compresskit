import { useEffect, useRef, useState } from 'react'
import styles from './SizeStudy.module.css'

const bars = [
  { size: '82 B', count: 312, solRegular: 0.29, solCompressed: 0.0145 },
  { size: '165 B', count: 890, solRegular: 2.104, solCompressed: 0.1052 },
  { size: '340 B', count: 45, solRegular: 0.497, solCompressed: 0.0249 }
]

export function SizeStudy() {
  const [phase, setPhase] = useState<'regular' | 'compressed'>('regular')
  const [auto, setAuto] = useState(true)
  const wrap = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!wrap.current) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setInView(true)
      },
      { threshold: 0.3 }
    )
    io.observe(wrap.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!inView || !auto) return
    let cancelled = false
    const loop = () => {
      if (cancelled) return
      window.setTimeout(() => {
        if (cancelled) return
        setPhase((p) => (p === 'regular' ? 'compressed' : 'regular'))
        loop()
      }, 2600)
    }
    loop()
    return () => {
      cancelled = true
    }
  }, [inView, auto])

  const pickPhase = (p: 'regular' | 'compressed') => {
    setAuto(false)
    setPhase(p)
  }

  const max = Math.max(...bars.map((b) => b.solRegular))

  return (
    <section ref={wrap} className={styles.study} aria-label="rent comparison study">
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <span className={styles.plate}>PL. I</span>
          <h2 className={styles.title}>
            Rent, <em>before</em> and <em>after</em>.
          </h2>
        </div>
        <p className={styles.caption}>
          Each column is one size group from a real SPL token program. The bar
          is rent paid on chain — measured in SOL.
        </p>

        <div className={styles.toggle} role="tablist" aria-label="state">
          <button
            role="tab"
            aria-selected={phase === 'regular'}
            className={phase === 'regular' ? styles.toggleOn : styles.toggleOff}
            onClick={() => pickPhase('regular')}
          >
            Regular
          </button>
          <button
            role="tab"
            aria-selected={phase === 'compressed'}
            className={phase === 'compressed' ? styles.toggleOn : styles.toggleOff}
            onClick={() => pickPhase('compressed')}
          >
            Compressed
          </button>
        </div>
      </div>

      <div className={styles.stage}>
        <div className={styles.ticks} aria-hidden>
          {[1, 0.75, 0.5, 0.25, 0].map((t) => (
            <div key={t} className={styles.tick} style={{ bottom: `${t * 100}%` }}>
              <span>{(t * max).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {bars.map((b) => {
          const regPct = (b.solRegular / max) * 100
          const comPct = (b.solCompressed / max) * 100
          const pct = phase === 'regular' ? regPct : comPct
          const value = phase === 'regular' ? b.solRegular : b.solCompressed
          return (
            <div key={b.size} className={styles.col}>
              <div className={styles.colTrack}>
                <div
                  className={styles.colBar}
                  style={{
                    height: `${pct}%`,
                    background: phase === 'regular' ? 'var(--ink)' : 'var(--coral)'
                  }}
                >
                  <span className={styles.colNum}>{value.toFixed(4)}</span>
                </div>
                <div
                  className={styles.colGhost}
                  style={{ height: `${regPct}%` }}
                  aria-hidden
                />
              </div>
              <div className={styles.colMeta}>
                <div className={styles.colSize}>{b.size}</div>
                <div className={styles.colCount}>×{b.count}</div>
              </div>
            </div>
          )
        })}

        <div className={styles.sum}>
          <div className={styles.sumRow}>
            <span className={styles.sumKey}>Regular</span>
            <span className={styles.sumVal}>2.8910 SOL</span>
          </div>
          <div className={styles.sumRow}>
            <span className={styles.sumKey}>Compressed</span>
            <span className={styles.sumValCoral}>0.1446 SOL</span>
          </div>
          <hr className={styles.sumRule} />
          <div className={styles.sumRow}>
            <span className={styles.sumKey}>Returned</span>
            <span className={styles.sumValBig}>2.7464 SOL</span>
          </div>
        </div>
      </div>
    </section>
  )
}
