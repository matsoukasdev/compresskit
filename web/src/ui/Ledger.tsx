import styles from './Ledger.module.css'
import { ledgerFigures } from '../data/specimens'

export function Ledger() {
  return (
    <section className={styles.ledger} aria-label="headline figures">
      <div className={styles.band}>
        <span className={styles.plate}>PL. II</span>
        <h2 className={styles.heading}>The ledger, at a glance.</h2>
      </div>

      <div className={styles.rowHead}>
        <span>FIGURE</span>
        <span>OBSERVATION</span>
        <span>NOTE</span>
      </div>
      <hr className={styles.dividerBold} />

      {ledgerFigures.map((f, i) => (
        <div key={f.label} className={styles.row}>
          <div className={styles.num}>
            <span className={styles.numIdx}>{String(i + 1).padStart(2, '0')}</span>
            <span className={styles.numBig}>{f.big}</span>
          </div>
          <div className={styles.label}>{f.label}</div>
          <div className={styles.note}>{f.note}</div>
        </div>
      ))}
    </section>
  )
}
