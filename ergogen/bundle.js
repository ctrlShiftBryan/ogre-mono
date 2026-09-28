// Packs config.yaml + footprints/ into output/ogre-ergo.ekb, the archive the
// ergogen web UI takes under "From Local File" (config and footprints
// together, straight from the working tree — no push, no paste).
// Usage: npm run bundle
const fs = require('fs')
const path = require('path')
const JSZip = require('jszip')

const here = __dirname
const out = path.join(here, 'output/ogre-ergo.ekb')
const zip = new JSZip()
zip.file('config.yaml', fs.readFileSync(path.join(here, 'config.yaml')))
const fps = fs.readdirSync(path.join(here, 'footprints')).filter(f => f.endsWith('.js'))
for (const f of fps) zip.file(`footprints/${f}`, fs.readFileSync(path.join(here, 'footprints', f)))

zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }).then(buf => {
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, buf)
  console.log(`${out} — config.yaml + ${fps.length} footprints, ${(buf.length / 1024).toFixed(1)} kB`)
})
