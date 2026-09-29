// Builds, then opens one half's KiCad project (output/pcbs/left.kicad_pro or
// right.kicad_pro) in KiCad, to look around, validate and place parts. The board is build output: each build rewrites it in
// place, so placements come back by hand into config.yaml (see AGENTS.md). After
// a rebuild, File > Revert in the PCB editor reloads the board.
// Usage: npm run kicad [left|right]   (left by default)
const path = require('path')
const { spawn } = require('child_process')
const { run, write, OUT } = require('./build')

const half = process.argv[2] || 'left'
if (!['left', 'right'].includes(half)) { console.error(`no half "${half}": left or right`); process.exit(1) }
const PRO = path.join(OUT, `pcbs/${half}.kicad_pro`)
const open = process.platform === 'darwin' ? ['open', ['-a', 'KiCad', PRO]] : ['kicad', [PRO]]

run().then(results => {
  write(results, OUT)
  const child = spawn(...open, { detached: true, stdio: 'ignore' })
  child.on('error', err => { console.error(`couldn't start KiCad: ${err.message}`); process.exit(1) })
  child.on('spawn', () => { child.unref(); console.log(`Opened ${PRO}`) })
}).catch(err => { console.error(err.message || err); process.exit(1) })
