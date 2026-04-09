interface TemplateOpts {
  output: string
}

const VALID = ['loyalty', 'gaming', 'social']

export async function template(type: string, opts: TemplateOpts) {
  if (!VALID.includes(type)) {
    console.error(`unknown template: ${type}`)
    console.error(`valid: ${VALID.join(', ')}`)
    process.exit(1)
  }

  console.log(`\nscaffolding ${type} template → ${opts.output}\n`)
  console.log('template generator coming soon')
}
