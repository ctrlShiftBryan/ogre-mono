// Builds, then opens output/pcbs/ogre.kicad_pro in KiCad, to look around and
// validate. The project is build output like the rest of output/: the next
// build overwrites it, so changes belong in config.yaml and footprints/, not
// in KiCad. After a rebuild, File > Revert in the PCB editor reloads the board.
// Usage: npm run kicad
const path = require('path')
const { spawn } = require('child_process')
const { run, write, OUT } = require('./build')

const PRO = path.join(OUT, 'pcbs/ogre.kicad_pro')
const open = process.platform === 'darwin' ? ['open', ['-a', 'KiCad', PRO]] : ['kicad', [PRO]]

run().then(results => {
  write(results, OUT)
  const child = spawn(...open, { detached: true, stdio: 'ignore' })
  child.on('error', err => { console.error(`couldn't start KiCad: ${err.message}`); process.exit(1) })
  child.on('spawn', () => { child.unref(); console.log(`Opened ${PRO}`) })
}).catch(err => { console.error(err.message || err); process.exit(1) })
