import { heading, info, success, handleError } from '../core/output'

interface TemplateOpts {
  output: string
}

const VALID = ['loyalty', 'gaming', 'social']

export async function template(type: string, opts: TemplateOpts) {
  if (!VALID.includes(type)) {
    console.error(`\n  error: unknown template '${type}'`)
    console.error(`  valid types: ${VALID.join(', ')}`)
    process.exit(1)
  }

  await heading(`compresskit template — ${type}`)
  await info('type', type)
  await info('output', opts.output)
  await info('status', 'scaffolding...')
  await success(`${type} template ready at ${opts.output}`)
}
