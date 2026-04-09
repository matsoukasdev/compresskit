interface CostOpts {
  network: string
}

export async function cost(programId: string, opts: CostOpts) {
  console.log(`\ncost comparison for ${programId} on ${opts.network}\n`)
  console.log('regular vs compressed — coming soon')
}
