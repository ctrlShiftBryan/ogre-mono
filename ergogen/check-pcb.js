// Checks the generated PCB (output/pcbs/ogre.kicad_pcb; run `npm run build` first):
//   - one switch and one diode per key, wired col -> switch -> diode -> row
//   - the 10x7 matrix has no duplicate positions
//   - every Pro Micro pad carries the as-built board's net (U1/U2 halves, U3 center)
//   - reset switches and TRRS jacks
//   - KiCad DRC (overlaps, clearances), if kicad-cli is installed
// Usage: npm run check
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')
const { run } = require('./build')

const PCB = path.join(__dirname, 'output/pcbs/ogre.kicad_pcb')

const parse = text => text.split(/\n\s*\(module /).slice(1).map(block => {
  const ref = block.match(/\(fp_text reference "([^"]*)"/)[1]
  const kind = block.match(/^(\S+)/)[1]
  const at = block.match(/\(at ([-\d.e]+) ([-\d.e]+)/).slice(1).map(Number)
  const pads = {}
  for (const m of block.matchAll(/\(pad "?([^"\s]*)"? [^\n]*?\(net \d+ "([^"]*)"\)/g)) {
    (pads[m[1]] = pads[m[1]] || new Set()).add(m[2])
  }
  return { ref, kind, at, pads }
})

const range = (n, f) => Array.from({ length: n }, (_, i) => f(i))
const halfMcu = (rows, data, reset) => ({
  1: data[0], 2: data[1], 3: 'GND', 4: 'GND', 5: '', 6: '', 7: '',
  ...Object.fromEntries(rows.map((r, i) => [8 + i, r])),
  13: '', ...Object.fromEntries(range(7, i => [20 - i, `col${i}`])),
  21: 'VCC', 22: reset, 23: 'GND', 24: ''
})
const EXPECTED_MCU = {
  MCU1: halfMcu(range(5, i => `row${i}`), ['SCL1', 'SDA1'], 'RESET1'),
  MCU2: halfMcu(range(5, i => `row${i + 5}`), ['SCL2', 'SDA2'], 'RESET2'),
  MCU3: {
    1: 'row0', 2: 'row1', 3: 'GND', 4: 'GND',
    ...Object.fromEntries(range(8, i => [5 + i, `row${i + 2}`])),
    13: '', ...Object.fromEntries(range(7, i => [20 - i, `col${i}`])),
    21: 'VCC', 22: 'RESET0', 23: 'GND', 24: ''
  }
}

;(async () => {
  const errors = []
  const { points } = await run()
  const fps = parse(fs.readFileSync(PCB, 'utf8'))
  const net = (fp, pad) => [...(fp.pads[pad] || [])].join('+')

  // switches and diodes
  const switches = fps.filter(f => f.kind.includes('MX_PCB'))
  const diodes = fps.filter(f => f.kind.includes('Diode'))
  const keys = Object.values(points)
  if (switches.length !== keys.length) errors.push(`${switches.length} switches for ${keys.length} keys`)
  if (diodes.length !== keys.length) errors.push(`${diodes.length} diodes for ${keys.length} keys`)
  const seen = {}
  for (const p of keys) {
    const { name, row_net: row, col_net: col } = p.meta
    const sw = switches.filter(f => net(f, '2') === name)
    const d = diodes.filter(f => net(f, '2') === name)
    if (sw.length !== 1) errors.push(`${name}: ${sw.length} switches`)
    else if (net(sw[0], '1') !== col) errors.push(`${name}: switch pin 1 on ${net(sw[0], '1')}, expected ${col}`)
    if (d.length !== 1) errors.push(`${name}: ${d.length} diodes`)
    else if (net(d[0], '1') !== row) errors.push(`${name}: diode cathode on ${net(d[0], '1')}, expected ${row}`)
    const rc = `${row}/${col}`
    if (seen[rc]) errors.push(`${name} and ${seen[rc]} share ${rc}`)
    seen[rc] = name
    const r = +row.slice(3)
    if (p.meta.mirrored ? r < 5 : r > 4) errors.push(`${name}: ${row} is on the wrong half`)
  }

  // controllers: U1 left of U3, U2 right of it
  for (const [ref, want] of Object.entries(EXPECTED_MCU)) {
    const fp = fps.find(f => f.ref === ref)
    if (!fp) { errors.push(`${ref} missing`); continue }
    for (let pad = 1; pad <= 24; pad++) {
      if (net(fp, String(pad)) !== want[pad]) errors.push(`${ref} pad ${pad}: ${net(fp, String(pad)) || '(none)'}, expected ${want[pad] || '(none)'}`)
    }
  }
  const x = ref => (fps.find(f => f.ref === ref) || { at: [NaN] }).at[0]
  if (!(x('MCU1') < x('MCU3') && x('MCU3') < x('MCU2'))) errors.push('controllers not placed left / center / right')

  // reset switches and jacks
  for (const [ref, reset] of [['SW1', 'RESET1'], ['SW2', 'RESET2'], ['SW3', 'RESET0']]) {
    const fp = fps.find(f => f.ref === ref)
    if (!fp || net(fp, '1') !== 'GND' || net(fp, '2') !== reset) errors.push(`${ref}: expected GND / ${reset}`)
  }
  for (const [ref, n] of [['TRRS1', 1], ['TRRS2', 2]]) {
    const fp = fps.find(f => f.ref === ref)
    const got = fp && [1, 2, 3, 4].map(p => net(fp, String(p))).join(',')
    if (got !== `GND,VCC,SDA${n},SCL${n}`) errors.push(`${ref}: ${got}, expected GND,VCC,SDA${n},SCL${n}`)
  }

  console.log(`${switches.length} switches, ${diodes.length} diodes, ${Object.keys(seen).length} matrix positions, ` +
    `${fps.filter(f => f.ref.startsWith('MCU')).length} Pro Micros, 3 reset switches, 2 TRRS jacks`)

  // KiCad DRC
  const cli = ['/Applications/KiCad/KiCad.app/Contents/MacOS/kicad-cli', '/Applications/KiCad-2/KiCad.app/Contents/MacOS/kicad-cli', 'kicad-cli']
    .find(c => { try { execFileSync(c, ['version'], { stdio: 'ignore' }); return true } catch { return false } })
  if (cli) {
    const report = path.join(__dirname, 'output/pcbs/drc.json')
    execFileSync(cli, ['pcb', 'drc', PCB, '--format', 'json', '--severity-all', '-o', report], { stdio: 'ignore' })
    const drc = JSON.parse(fs.readFileSync(report, 'utf8'))
    // generated footprints aren't in a KiCad library, and nothing is routed yet
    const real = drc.violations.filter(v => v.type !== 'lib_footprint_issues')
    for (const v of real) errors.push(`DRC ${v.type}: ${v.items.map(i => i.description).join(' | ')}`)
    console.log(`KiCad DRC: ${real.length} violations (${drc.unconnected_items.length} unrouted connections, expected before routing)`)
  } else {
    console.log('KiCad DRC skipped (kicad-cli not found)')
  }

  if (errors.length) { console.error('\nFAIL:\n' + errors.join('\n')); process.exit(1) }
  console.log('OK')
})()
