import fs from 'fs'
import path from 'path'
import { heading, info, success, spinner, handleError } from '../core/output'
import { getTemplateFiles, getTemplateInfo, TemplateType } from '../core/templates'

interface TemplateOpts {
  output: string
  force?: boolean
}

const VALID: TemplateType[] = ['loyalty', 'gaming', 'social']

export function template(type: string, opts: TemplateOpts) {
  if (!VALID.includes(type as TemplateType)) {
    console.error(`\n  error: unknown template '${type}'`)
    console.error(`  valid types: ${VALID.join(', ')}`)
    process.exit(1)
  }

  const tmplType = type as TemplateType
  const tmplInfo = getTemplateInfo(tmplType)
  const outDir = path.resolve(opts.output)

  heading(`compresskit template — ${tmplType}`)
  info('type', `${tmplInfo.label} (${tmplInfo.desc})`)
  info('output', outDir)

  // refuse to clobber an existing non-empty dir unless --force
  if (fs.existsSync(outDir) && fs.readdirSync(outDir).length > 0 && !opts.force) {
    console.error(`\n  error: output dir is not empty: ${outDir}`)
    console.error('  hint:  pass --force to overwrite, or pick an empty -o path')
    process.exit(1)
  }

  const spin = spinner('scaffolding project...')
  spin.start()

  // get all files for this template
  const files = getTemplateFiles(tmplType)

  // create dirs + write files
  let fileCount = 0
  try {
    for (const f of files) {
      const fullPath = path.join(outDir, f.path)
      const dir = path.dirname(fullPath)
      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(fullPath, f.content, 'utf-8')
      fileCount++
    }
  } catch (e) {
    spin.fail('failed to write files')
    handleError(e)
  }

  spin.succeed(`${fileCount} files created`)

  // print file tree
  console.log('')
  for (const f of files) {
    const depth = f.path.split('/').length - 1
    const indent = '  ' + '  '.repeat(depth)
    const name = path.basename(f.path)
    info(indent + name, f.path)
  }

  success(`${tmplType} template ready at ${outDir}`)
  console.log('')
  info('next steps', `cd ${opts.output} && anchor build`)
}
