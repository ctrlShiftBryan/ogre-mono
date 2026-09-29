// Checks the generated PCBs, one per half (output/pcbs/left.kicad_pcb and
// right.kicad_pcb; run `npm run build` first):
//   - one hotswap switch and one diode per key, wired col -> switch -> diode -> row,
//     and the half's key n (points order, L/Rn on the keycap render) is MXn and Dn
//   - the 10x7 matrix has no duplicate positions, and each row is on its own half
//   - every nice!nano pad carries its net
//   - the reset switch
//   - KiCad DRC (overlaps, clearances), if kicad-cli is installed
// Usage: npm run check
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')
const { run } = require('./build')

const PCBS = path.join(__dirname, 'output/pcbs')
const HALVES = { left: { mirrored: false, rows: [0, 1, 2, 3, 4] }, right: { mirrored: true, rows: [5, 6, 7, 8, 9] } }

const parse = text => text.split(/\n\s*\(module /).slice(1).map(block => {
  const ref = block.match(/\(fp_text reference "([^"]*)"/)[1]
  const kind = block.match(/^(\S+)/)[1]
  const pads = {}
  for (const m of block.matchAll(/\(pad "?([^"\s]*)"? [^\n]*?\(net \d+ "([^"]*)"\)/g)) {
    (pads[m[1]] = pads[m[1]] || new Set()).add(m[2])
  }
  return { ref, kind, pads }
})

const range = (n, f) => Array.from({ length: n }, (_, i) => f(i))
const expectedMcu = rows => ({
  1: '', 2: '', 3: 'GND', 4: 'GND', 5: '', 6: '', 7: '',
  ...Object.fromEntries(rows.map((r, i) => [8 + i, `row${r}`])),
  13: '', ...Object.fromEntries(range(7, i => [20 - i, `col${i}`])),
  21: 'VCC', 22: 'RESET', 23: 'GND', 24: ''
})

const cli = ['/Applications/KiCad/KiCad.app/Contents/MacOS/kicad-cli', '/Applications/KiCad-2/KiCad.app/Contents/MacOS/kicad-cli', 'kicad-cli']
  .find(c => { try { execFileSync(c, ['version'], { stdio: 'ignore' }); return true } catch { return false } })

;(async () => {
  const errors = []
  const { points } = await run()
  const seen = {}

  for (const [half, { mirrored, rows }] of Object.entries(HALVES)) {
    const pcb = path.join(PCBS, `${half}.kicad_pcb`)
    const fps = parse(fs.readFileSync(pcb, 'utf8'))
    const net = (fp, pad) => [...(fp.pads[pad] || [])].join('+')
    const err = e => errors.push(`${half}: ${e}`)

    // switches and diodes: switch pad 1 column, pad 2 to the diode's anode (the key's net);
    // diode pad 1, the cathode, to the row
    const switches = fps.filter(f => f.kind.includes('CherryMX_Hotswap'))
    const diodes = fps.filter(f => f.kind.includes('Socket_Diode'))
    const keys = Object.values(points).filter(p => !!p.meta.mirrored === mirrored)
    if (switches.length !== keys.length) err(`${switches.length} switches for ${keys.length} keys`)
    if (diodes.length !== keys.length) err(`${diodes.length} diodes for ${keys.length} keys`)
    keys.forEach((p, i) => {
      const { name, row_net: row, col_net: col } = p.meta
      const sw = switches.filter(f => net(f, '2') === name)
      const d = diodes.filter(f => net(f, '2') === name)
      if (sw.length !== 1) err(`${name}: ${sw.length} switches`)
      else {
        if (net(sw[0], '1') !== col) err(`${name}: switch pad 1 on ${net(sw[0], '1')}, expected ${col}`)
        if (sw[0].ref !== `MX${i + 1}`) err(`${name}: switch is ${sw[0].ref}, expected MX${i + 1} (key ${i + 1})`)
      }
      if (d.length !== 1) err(`${name}: ${d.length} diodes`)
      else {
        if (net(d[0], '1') !== row) err(`${name}: diode cathode on ${net(d[0], '1')}, expected ${row}`)
        if (d[0].ref !== `D${i + 1}`) err(`${name}: diode is ${d[0].ref}, expected D${i + 1} (key ${i + 1})`)
      }
      const rc = `${row}/${col}`
      if (seen[rc]) err(`${name} and ${seen[rc]} share ${rc}`)
      seen[rc] = name
      if (!rows.includes(+row.slice(3))) err(`${name}: ${row} is on the wrong half`)
    })

    // controller and reset switch
    const mcus = fps.filter(f => f.kind.includes('NiceNano'))
    if (mcus.length !== 1) err(`${mcus.length} nice!nanos`)
    else {
      const want = expectedMcu(rows)
      for (let pad = 1; pad <= 24; pad++) {
        if (net(mcus[0], String(pad)) !== want[pad]) err(`${mcus[0].ref} pad ${pad}: ${net(mcus[0], String(pad)) || '(none)'}, expected ${want[pad] || '(none)'}`)
      }
    }
    const resets = fps.filter(f => f.kind.includes('SW_PUSH'))
    if (resets.length !== 1 || net(resets[0], '1') !== 'GND' || net(resets[0], '2') !== 'RESET') err('expected one reset switch on GND / RESET')

    console.log(`${half}: ${switches.length} hotswap switches, ${diodes.length} diodes, ${mcus.length} nice!nano, ${resets.length} reset switch`)

    // KiCad DRC
    if (cli) {
      const report = path.join(PCBS, `${half}.drc.json`)
      execFileSync(cli, ['pcb', 'drc', pcb, '--format', 'json', '--severity-all', '-o', report], { stdio: 'ignore' })
      const drc = JSON.parse(fs.readFileSync(report, 'utf8'))
      // generated footprints aren't in a KiCad library, and nothing is routed yet
      const real = drc.violations.filter(v => v.type !== 'lib_footprint_issues')
      for (const v of real) err(`DRC ${v.type}: ${v.items.map(i => i.description).join(' | ')}`)
      console.log(`${half}: KiCad DRC ${real.length} violations (${drc.unconnected_items.length} unrouted connections, expected before routing)`)
    }
  }
  if (!cli) console.log('KiCad DRC skipped (kicad-cli not found)')
  console.log(`${Object.keys(seen).length} matrix positions`)

  if (errors.length) { console.error('\nFAIL:\n' + errors.join('\n')); process.exit(1) }
  console.log('OK')
})()
