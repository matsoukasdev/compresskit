import styles from './Colophon.module.css'

export function Colophon() {
  return (
    <footer className={styles.foot}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.mark} aria-hidden>
              ▤
            </div>
            <div>
              <div className={styles.brandName}>compresskit</div>
              <div className={styles.brandTag}>
                A specimen book of ZK compression for Solana.
              </div>
            </div>
          </div>

          <div className={styles.cta}>
            <div className={styles.ctaRow}>
              <span className={styles.dollar}>$</span>
              <code>npm i -g @dominator/compresskit</code>
            </div>
            <a
              className={styles.ghLink}
              href="https://github.com/matsoukasdev/compresskit"
              target="_blank"
              rel="noreferrer"
            >
              View on GitHub ↗
            </a>
          </div>
        </div>

        <hr className={styles.ruleBold} />

        <div className={styles.bottom}>
          <div className={styles.colophon}>
            <div className={styles.cKey}>COLOPHON</div>
            <p>
              Set in <em>Fraunces</em> at display sizes, <em>Inter</em> for body,
              and <em>DM Mono</em> in the specimen panes. Printed on cream paper,
              or the closest web equivalent (<code>#F5F0E6</code>).
            </p>
          </div>

          <div className={styles.meta}>
            <div className={styles.metaRow}>
              <span>BUILD</span>
              <span>0.1.0</span>
            </div>
            <div className={styles.metaRow}>
              <span>LICENSE</span>
              <span>MIT</span>
            </div>
            <div className={styles.metaRow}>
              <span>STATUS</span>
              <span className={styles.live}>● live on npm</span>
            </div>
          </div>

          <div className={styles.tiny}>
            Not an endorsement by Solana Labs or Light Protocol. Independent work.
            Test on devnet; never mainnet without audit.
          </div>
        </div>
      </div>
    </footer>
  )
}
