import { heading, info, success } from '../core/output'

interface TemplateOpts {
  output: string
}

const VALID = ['loyalty', 'gaming', 'social']

export function template(type: string, opts: TemplateOpts) {
  if (!VALID.includes(type)) {
    console.error(`\n  error: unknown template '${type}'`)
    console.error(`  valid types: ${VALID.join(', ')}`)
    process.exit(1)
  }

  heading(`compresskit template — ${type}`)
  info('type', type)
  info('output', opts.output)
  info('status', 'scaffolding...')
  success(`${type} template ready at ${opts.output}`)
}
