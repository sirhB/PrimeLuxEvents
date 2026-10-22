// Writes lib/generated/public-images.json: every file path under public/images.
// Server code reads this manifest instead of the filesystem, so Vercel does not
// trace hundreds of MB of photos into each serverless function.
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const root = path.join(process.cwd(), 'public')
const out = []
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else out.push('/' + path.relative(root, full).split(path.sep).join('/'))
  }
}
walk(path.join(root, 'images'))
out.sort()
mkdirSync(path.join(process.cwd(), 'lib/generated'), { recursive: true })
writeFileSync(path.join(process.cwd(), 'lib/generated/public-images.json'), JSON.stringify(out, null, 0) + '\n')
console.log(`public-images manifest: ${out.length} files`)
