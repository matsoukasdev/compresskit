import styles from './Kits.module.css'
import { kits } from '../data/specimens'

export function Kits() {
  return (
    <section id="kits" className={styles.kits}>
      <div className={styles.head}>
        <span className={styles.plate}>PL. III</span>
        <h2 className={styles.title}>
          Three starters. <em>Fully furnished.</em>
        </h2>
        <p className={styles.lede}>
          Each template is a complete Anchor program paired with a Light Protocol
          TypeScript client. Seven files. <code>anchor build</code>. Ship.
        </p>
      </div>

      <div className={styles.grid}>
        {kits.map((k, i) => (
          <article key={k.code} className={styles.card} data-hue={k.hue}>
            <div className={styles.cardHead}>
              <span className={styles.cardCode}>{k.code}</span>
              <span className={styles.cardNum}>TEMPLATE {String(i + 1).padStart(2, '0')}</span>
            </div>
            <div className={styles.stack} aria-hidden>
              <span className={styles.block} />
              <span className={styles.block} />
              <span className={styles.block} />
            </div>
            <h3 className={styles.name}>{k.name}</h3>
            <p className={styles.lede2}>{k.lede}</p>
            <ul className={styles.pieces}>
              {k.pieces.map((p) => (
                <li key={p}>
                  <span className={styles.bul} />
                  {p}
                </li>
              ))}
            </ul>
            <div className={styles.cmd}>
              <span className={styles.cmdDollar}>$</span>
              <code>compresskit template {k.name.toLowerCase()}</code>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
