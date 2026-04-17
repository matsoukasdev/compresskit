import { Ribbon } from './ui/Ribbon'
import { Overture } from './ui/Overture'
import { SizeStudy } from './ui/SizeStudy'
import { Ledger } from './ui/Ledger'
import { Specimen } from './ui/Specimen'
import { Kits } from './ui/Kits'
import { Colophon } from './ui/Colophon'
import { specimens } from './data/specimens'

export function App() {
  return (
    <>
      <Ribbon />
      <main>
        <Overture />
        <SizeStudy />
        <Ledger />
        <section aria-label="Commands">
          {specimens.map((s, i) => (
            <Specimen key={s.id} spec={s} flip={i % 2 === 1} />
          ))}
        </section>
        <Kits />
      </main>
      <Colophon />
    </>
  )
}
