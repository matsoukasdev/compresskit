import styles from './Ribbon.module.css'
import { useEffect, useState } from 'react'

export function Ribbon() {
  const [now, setNow] = useState(() => stamp())

  useEffect(() => {
    const t = window.setInterval(() => setNow(stamp()), 30_000)
    return () => window.clearInterval(t)
  }, [])

  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        <a href="#top" className={styles.mark}>
          <span className={styles.markGlyph} aria-hidden>
            ▤
          </span>
          <span className={styles.markWord}>compresskit</span>
          <span className={styles.markVer}>0.1.0</span>
        </a>

        <nav className={styles.nav} aria-label="primary">
          <a href="#commands">Commands</a>
          <a href="#kits">Templates</a>
          <a href="#install">Install</a>
          <a
            className={styles.gh}
            href="https://github.com/matsoukasdev/compresskit"
            target="_blank"
            rel="noreferrer"
          >
            GitHub ↗
          </a>
        </nav>

        <span className={styles.meta} aria-hidden>
          {now}
        </span>
      </div>
      <div className={styles.ruleBold} />
    </header>
  )
}

function stamp() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} · ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`
}
