// Writes output/reference-left.dxf and reference-right.dxf: each half as it builds
// now, to draw a new outline over in Illustrator or any other vector editor. Both
// are in the same coordinates, so they line up when opened together.
// Layers: Edge.Cuts (board edge, break line), User.Drawings (every keycap at its
// real size), F.Courtyard / B.Courtyard (switches, reset switches; the nice!nano
// footprint has none). Units are mm and the coordinates are ergogen's own,
// y up, so a drawing that keeps them lines up with the config.
// Usage: npm run reference   (needs kicad-cli)
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')
const { run, write, OUT } = require('./build')

const HALVES = ['left', 'right']
const kicad = ['kicad-cli', '/Applications/KiCad/KiCad.app/Contents/MacOS/kicad-cli']
  .find(c => { try { execFileSync(c, ['version'], { stdio: 'ignore' }); return true } catch { return false } })

run().then(results => {
  if (!kicad) throw new Error('kicad-cli not found: the reference DXF is plotted from the PCB')
  write(results, OUT)
  // build.js puts the drill origin where it moved the board on the page, so
  // plotting from it keeps ergogen's coordinates;
  // drill marks are left out, since KiCad repeats them on every layer
  for (const half of HALVES) {
    const pcb = path.join(OUT, `pcbs/${half}.kicad_pcb`), dxf = path.join(OUT, `reference-${half}.dxf`)
    execFileSync(kicad, ['pcb', 'export', 'dxf', '--mode-single', '--output-units', 'mm',
      '--use-drill-origin', '--drill-shape-opt', '0', '--exclude-refdes', '--exclude-value',
      '-l', 'Edge.Cuts,Dwgs.User,F.CrtYd,B.CrtYd', '-o', dxf, pcb], { stdio: 'ignore' })
    console.log(`Wrote ${dxf}`)
  }
}).catch(err => { console.error(err.message || err); process.exit(1) })
