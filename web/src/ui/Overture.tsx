import { useEffect, useRef, useState } from 'react'
import styles from './Overture.module.css'

export function Overture() {
  return (
    <section id="top" className={styles.over}>
      <div className={styles.grid}>
        <aside className={styles.colLeft}>
          <div className={styles.meta}>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>VOL.</span>
              <span>01</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>ISSUE</span>
              <span>ZK · COMPRESSION</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>PRINTED</span>
              <span>SOLANA · DEVNET</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>LICENSE</span>
              <span>MIT</span>
            </div>
          </div>
          <div className={styles.folioMark} aria-hidden>
            ⁂
          </div>
        </aside>

        <div className={styles.colMain}>
          <p className={styles.kicker}>A specimen book of Solana ZK compression.</p>
          <div className={styles.shipped} role="status">
            <span className={styles.shippedDot} aria-hidden />
            <span className={styles.shippedKey}>Shipped April 17, 2026 · v0.1.0</span>
            <span className={styles.shippedSep} aria-hidden>·</span>
            <span className={styles.shippedSay}>It works. Install it, try it.</span>
          </div>
          <h1 className={styles.headline}>
            Migrate any program.
            <br />
            Keep <em className={styles.em}>five&#8239;percent</em>
            <span className={styles.tail} aria-hidden>
              {' '}of the rent.
            </span>
          </h1>
          <p className={styles.lede}>
            <span className="asterism" />
            compresskit is a five-command CLI for reading, costing, and migrating
            Solana accounts to Light Protocol&#8217;s ZK compression. It ships a
            zero-surprise migration plan, three Anchor templates, and a cost
            ledger you can hand to finance.
          </p>
          <InstallBlock />
        </div>

        <div className={styles.colFolio}>
          <span className={styles.folioBig}>№01</span>
          <span className={styles.folioLabel}>Folio</span>
          <span className={styles.folioYear}>MMXXVI</span>
        </div>
      </div>
    </section>
  )
}

type CopyState = 'idle' | 'copied' | 'failed'

function InstallBlock() {
  const [state, setState] = useState<CopyState>('idle')
  const timer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  const onCopy = async () => {
    const cmd = 'npm i -g @dominator/compresskit'
    try {
      if (!navigator.clipboard?.writeText) throw new Error('no clipboard')
      await navigator.clipboard.writeText(cmd)
      setState('copied')
    } catch {
      setState('failed')
    }
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setState('idle'), 1600)
  }

  const label = state === 'copied' ? 'copied' : state === 'failed' ? 'failed' : 'copy'

  return (
    <div id="install" className={styles.install}>
      <div className={styles.installRow}>
        <span className={styles.installDollar}>$</span>
        <code>npm i -g @dominator/compresskit</code>
        <button
          className={styles.copy}
          onClick={onCopy}
          aria-live="polite"
          data-state={state}
        >
          {label}
        </button>
      </div>
      <div className={styles.installNote}>
        Works with any Anchor-deployed program. Reads the IDL from chain.
      </div>
    </div>
  )
}
