import { useEffect, useRef, useState } from 'react'
import styles from './Specimen.module.css'
import type { OutputLine, Specimen as Spec } from '../data/specimens'

interface Props {
  spec: Spec
  flip: boolean
}

export function Specimen({ spec, flip }: Props) {
  const [typed, setTyped] = useState('')
  const [done, setDone] = useState(false)
  const [runCount, setRunCount] = useState(0)
  const wrap = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    if (!wrap.current) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !started.current) {
            started.current = true
            setRunCount((c) => c + 1)
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    )
    io.observe(wrap.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (runCount === 0) return
    setTyped('')
    setDone(false)
    let i = 0
    const cmd = spec.command
    const every = 18
    const t = window.setInterval(() => {
      i += 1
      setTyped(cmd.slice(0, i))
      if (i >= cmd.length) {
        window.clearInterval(t)
        window.setTimeout(() => setDone(true), 220)
      }
    }, every)
    return () => window.clearInterval(t)
  }, [runCount, spec.command])

  const onRun = () => setRunCount((c) => c + 1)

  return (
    <article
      ref={wrap}
      id={spec.index === '01' ? 'commands' : undefined}
      className={`${styles.spec} ${flip ? styles.flip : ''}`}
    >
      <div className={styles.prose}>
        <div className={styles.header}>
          <span className={styles.index}>{spec.index}</span>
          <span className={styles.folio}>{spec.folio}</span>
        </div>
        <h2 className={styles.title}>{spec.title}</h2>
        <p className={styles.tag}>{spec.tagline}</p>
        <hr className={styles.hair} />
        <p className={styles.body}>{spec.prose}</p>
        <dl className={styles.aside}>
          {spec.aside.map((a) => (
            <div key={a.label} className={styles.asideRow}>
              <dt className={styles.asideKey}>{a.label}</dt>
              <dd className={styles.asideVal}>{a.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className={styles.paper}>
        <div className={styles.paperHead}>
          <div className={styles.paperHeadLeft}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.paperLabel}>
              specimen / {spec.id.toUpperCase()} — compresskit(1)
            </span>
          </div>
          <button className={styles.runBtn} onClick={onRun} title="replay demo">
            <span aria-hidden>↻ </span>run
          </button>
        </div>

        <div className={styles.paperBody}>
          <div className={styles.promptLine}>
            <span className={styles.promptGlyph}>❯</span>
            <code>
              {typed}
              <span className={styles.caret} aria-hidden>
                ▌
              </span>
            </code>
          </div>

          <div
            className={`${styles.output} ${done ? styles.outputOn : ''}`}
            aria-live="polite"
          >
            <div className={styles.head}>{spec.heading}</div>
            {spec.output.map((l, i) => (
              <Line key={i} line={l} />
            ))}
          </div>
        </div>

        <div className={styles.paperFoot}>
          <span>exit 0</span>
          <span>·</span>
          <span>stdout · {spec.output.length} lines</span>
        </div>
      </div>
    </article>
  )
}

function Line({ line }: { line: OutputLine }) {
  if (line.kind === 'text') {
    return <div className={tone(line.tone)}>{line.text}</div>
  }
  if (line.kind === 'rule') {
    return <div className={styles.dashed} aria-hidden />
  }
  if (line.kind === 'kv') {
    return (
      <div className={styles.kv}>
        <span className={styles.kvKey}>{line.key}</span>
        <span className={styles.kvDots} aria-hidden />
        <span className={`${styles.kvVal} ${tone(line.tone)}`}>{line.value}</span>
      </div>
    )
  }
  if (line.kind === 'head') {
    return (
      <div className={styles.thead}>
        {line.cells.map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </div>
    )
  }
  if (line.kind === 'row') {
    const isTwo = line.cells.length === 2
    return (
      <div className={`${styles.trow} ${isTwo ? styles.trowTwo : ''}`}>
        {line.cells.map((c, i) => (
          <span key={i} className={tone(line.tones?.[i])}>
            {c}
          </span>
        ))}
      </div>
    )
  }
  if (line.kind === 'bullet') {
    return (
      <div className={styles.bullet}>
        <span className={styles.bulletIcon}>{line.icon ?? '•'}</span>
        <span>{line.text}</span>
      </div>
    )
  }
  return null
}

function tone(t?: 'mute' | 'coral' | 'moss' | 'ink') {
  if (t === 'coral') return styles.coral
  if (t === 'moss') return styles.moss
  if (t === 'mute') return styles.mute
  if (t === 'ink') return styles.ink
  return ''
}
