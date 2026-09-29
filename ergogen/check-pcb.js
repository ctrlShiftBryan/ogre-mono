// Checks the generated PCBs, one per half (output/pcbs/left.kicad_pcb and
// right.kicad_pcb; run `npm run build` first):
//   - one switch, one hotswap socket and one diode per key, wired
//     col -> socket -> diode -> row, and the half's key n (points order, L/Rn on
//     the keycap render) is MXn, Sn and Dn
//   - the 12x8 matrix has no duplicate positions, and each row is on its own half
//   - the controller module's pads carry their nets, and the charger, LDO, crystal,
//     passives, connectors, switches and LEDs are wired as the README describes
//   - every assembled part carries its LCSC number for the JLCPCB BOM
//   - KiCad DRC (overlaps, clearances), if kicad-cli is installed; the switches'
//     pin holes sit inside their sockets' courtyards by design, so that one is let through
// Usage: npm run check
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')
const { run } = require('./build')
const { blocks } = require('./jlc')

const PCBS = path.join(__dirname, 'output/pcbs')
const HALVES = { left: { mirrored: false, rows: [0, 1, 2, 3, 4, 5] }, right: { mirrored: true, rows: [6, 7, 8, 9, 10, 11] } }

// footprints: reference, kind (the module id), value, LCSC number, and the nets on each pad
const parse = text => text.split(/\n\s*\(module /).slice(1).map(block => {
  const ref = block.match(/\(fp_text reference "([^"]*)"/)[1]
  const kind = block.match(/^(\S+)/)[1]
  const value = (block.match(/\(fp_text value "([^"]*)"/) || [])[1] || ''
  const lcsc = (block.match(/\(property "LCSC Part" "([^"]*)"/) || [])[1] || ''
  const pads = {}
  for (const [a, b] of blocks(block, 'pad')) {   // a pad may run over several lines (the charger's thermal pad)
    const pad = block.slice(a, b)
    const id = pad.match(/^\(pad "?([^"\s]*)"?/)[1]
    const net = pad.match(/\(net \d+ "([^"]*)"\)/)
    if (net) (pads[id] = pads[id] || new Set()).add(net[1])
  }
  return { ref, kind, value, lcsc, pads }
})

const range = (n, f) => Array.from({ length: n }, (_, i) => f(i))

// the module: pad -> net (footprints/ogre_e73.js), '' for unconnected
const expectedMcu = rows => {
  const want = {}
  for (let pad = 1; pad <= 43; pad++) want[pad] = ''
  Object.assign(want, { 5: 'GND', 21: 'GND', 24: 'GND', 11: 'XL1', 13: 'XL2', 19: 'VDD', 23: 'VDDH', 25: 'DCCH', 26: 'RESET', 27: 'VBUS', 28: 'BLED', 29: 'D-', 31: 'D+', 33: 'PWR_EN', 37: 'SWDIO', 39: 'SWDCLK' })
  ;[1, 2, 3, 4, 6, 7, 8, 9].forEach((pad, c) => { want[pad] = `col${c}` })
  ;[10, 12, 14, 15, 16, 17].forEach((pad, i) => { want[pad] = `row${rows[i]}` })
  return want
}
const EXPECTED_CHARGER = { 1: 'TS', 2: 'VBAT', 3: 'VBAT', 4: 'GND', 5: 'GND', 6: 'VDDH', 7: '', 8: 'GND', 9: 'CHG', 10: 'VDDH', 11: 'VDDH', 12: '', 13: 'VBUS', 14: '', 15: 'GND', 16: 'ISET', 17: 'GND' }
const EXPECTED_LDO = { 1: 'VDDH', 2: 'GND', 3: 'PWR_EN', 4: '', 5: 'VCC' }
const EXPECTED_USB = { 1: 'VBUS', 2: 'D-', 3: 'D+', 4: 'GND', 6: 'GND', 7: 'GND' }
const EXPECTED_SWD = { 1: 'VDD', 2: 'SWDIO', 3: 'RESET', 4: 'SWDCLK', 5: 'GND', 6: '' }
// the two-pad parts: kind, value and the nets on pads 1 and 2
const EXPECTED_PASSIVES = [
  ['L_0805', '10uH', 'DCCH', 'VDD'],
  ['C_0603', '4.7uF', 'VDD', 'GND'], ['C_0603', '100nF', 'VDD', 'GND'],
  ['C_0603', '4.7uF', 'VDDH', 'GND'], ['C_0603', '4.7uF', 'VDDH', 'GND'], ['C_0603', '10uF', 'VDDH', 'GND'],
  ['C_0603', '4.7uF', 'VBUS', 'GND'], ['C_0603', '1uF', 'VBUS', 'GND'],
  ['C_0603', '4.7uF', 'VBAT', 'GND'], ['C_0603', '4.7uF', 'VCC', 'GND'],
  ['C_0603', '12pF', 'XL1', 'GND'], ['C_0603', '12pF', 'XL2', 'GND'],
  ['R_0603', '10k', 'TS', 'GND'], ['R_0603', '10k', 'ISET', 'GND'], ['R_0603', '10M', 'VDDH', 'PWR_EN'],
  ['R_0603', '1k', 'BLED', 'LED_S'], ['R_0603', '1k', 'VDDH', 'LED_C']
]
const HAND_SOLDERED = ['CherryMX_Hotswap', 'LED_3mm', 'SWD_TC2030-NL']   // no LCSC number: not on the assembly BOM

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
    const one = (name, kind) => {
      const found = fps.filter(f => f.kind === `ogre:${kind}`)
      if (found.length !== 1) err(`${found.length} ${name}s`)
      return found.length === 1 ? found[0] : null
    }
    const wired = (fp, want) => {
      if (!fp) return
      for (const [pad, n] of Object.entries(want)) {
        if (net(fp, pad) !== n) err(`${fp.ref} pad ${pad}: ${net(fp, pad) || '(none)'}, expected ${n || '(none)'}`)
      }
    }

    // keys: socket pad 1 column, pad 2 the key's net; diode pad 2 (anode) the key's net, pad 1 (cathode) the row
    const switches = fps.filter(f => f.kind === 'ogre:CherryMX_Hotswap')
    const sockets = fps.filter(f => f.kind === 'ogre:Hotswap_Socket')
    const diodes = fps.filter(f => f.kind === 'ogre:Socket_Diode')
    const keys = Object.values(points).filter(p => !!p.meta.mirrored === mirrored)
    if (switches.length !== keys.length) err(`${switches.length} switches for ${keys.length} keys`)
    if (sockets.length !== keys.length) err(`${sockets.length} sockets for ${keys.length} keys`)
    if (diodes.length !== keys.length) err(`${diodes.length} diodes for ${keys.length} keys`)
    keys.forEach((p, i) => {
      const { name, row_net: row, col_net: col } = p.meta
      const s = sockets.filter(f => net(f, '2') === name)
      const d = diodes.filter(f => net(f, '2') === name)
      if (s.length !== 1) err(`${name}: ${s.length} sockets`)
      else {
        if (net(s[0], '1') !== col) err(`${name}: socket pad 1 on ${net(s[0], '1')}, expected ${col}`)
        if (s[0].ref !== `S${i + 1}`) err(`${name}: socket is ${s[0].ref}, expected S${i + 1} (key ${i + 1})`)
      }
      if (d.length !== 1) err(`${name}: ${d.length} diodes`)
      else {
        if (net(d[0], '1') !== row) err(`${name}: diode cathode on ${net(d[0], '1')}, expected ${row}`)
        if (d[0].ref !== `D${i + 1}`) err(`${name}: diode is ${d[0].ref}, expected D${i + 1} (key ${i + 1})`)
      }
      if (!switches.some(f => f.ref === `MX${i + 1}`)) err(`${name}: no switch MX${i + 1}`)
      const rc = `${row}/${col}`
      if (seen[rc]) err(`${name} and ${seen[rc]} share ${rc}`)
      seen[rc] = name
      if (!rows.includes(+row.slice(3))) err(`${name}: ${row} is on the wrong half`)
    })

    // the controller and its power section
    wired(one('controller module', 'E73-2G4M08S1C'), expectedMcu(rows))
    wired(one('charger', 'BQ24075'), EXPECTED_CHARGER)
    wired(one('LDO', 'XC6220'), EXPECTED_LDO)
    wired(one('USB connector', 'USB_PicoEZmate'), EXPECTED_USB)
    wired(one('SWD header', 'SWD_TC2030-NL'), EXPECTED_SWD)
    wired(one('reset switch', 'SW_Reset_TS1187A'), { 1: 'RESET', 2: '', 3: '', 4: 'GND' })
    wired(one('power switch', 'SW_SPDT_MSK12C02'), { 1: 'VBAT', 2: 'BAT', 3: '' })
    const crystal = one('crystal', 'Crystal_FC-135')
    if (crystal && [net(crystal, '1'), net(crystal, '2')].sort().join() !== 'XL1,XL2') err('expected the crystal on XL1 / XL2')
    const battery = one('battery connector', 'JST_PH_S2B-PH-SM4')
    if (battery && [net(battery, '1'), net(battery, '2')].sort().join() !== 'BAT,GND') err('expected the battery connector on BAT / GND')
    const leds = fps.filter(f => f.kind === 'ogre:LED_3mm').map(f => `${net(f, '2')}>${net(f, '1')}`).sort().join()
    if (leds !== 'LED_C>CHG,LED_S>GND') err(`LEDs: ${leds || '(none)'}, expected the status LED LED_S > GND and the charge LED LED_C > CHG`)

    const passives = fps.filter(f => /^ogre:[RCL]_0(603|805)$/.test(f.kind)).map(f => [f.kind.slice(5), f.value, net(f, '1'), net(f, '2')].join(' '))
    const want = EXPECTED_PASSIVES.map(p => p.join(' '))
    for (const p of want) {
      const i = passives.indexOf(p)
      if (i < 0) err(`missing ${p}`)
      else passives.splice(i, 1)
    }
    for (const p of passives) err(`unexpected ${p}`)

    // the assembly BOM
    for (const f of fps) {
      const kind = f.kind.slice(5)
      if (HAND_SOLDERED.includes(kind)) { if (f.lcsc) err(`${f.ref} (${kind}) is hand-soldered but carries LCSC ${f.lcsc}`) }
      else if (!/^C\d+$/.test(f.lcsc)) err(`${f.ref} (${kind}) has no LCSC number`)
    }

    const assembled = fps.filter(f => f.lcsc).length
    console.log(`${half}: ${switches.length} switches, ${sockets.length} sockets, ${diodes.length} diodes, ${fps.length} footprints, ${assembled} assembled by JLC`)

    // KiCad DRC
    if (cli) {
      const report = path.join(PCBS, `${half}.drc.json`)
      execFileSync(cli, ['pcb', 'drc', pcb, '--format', 'json', '--severity-all', '-o', report], { stdio: 'ignore' })
      const drc = JSON.parse(fs.readFileSync(report, 'utf8'))
      // generated footprints aren't in a KiCad library, and nothing is routed yet
      const real = drc.violations.filter(v => v.type !== 'lib_footprint_issues')
        // the switch's pins go through the socket's courtyard by design
        .filter(v => !(v.type === 'npth_inside_courtyard' && /NPTH pad of MX(\d+)/.test(v.items[0].description) && v.items[1].description === `Footprint S${RegExp.$1}`))
      for (const v of real) err(`DRC ${v.type}: ${v.items.map(i => i.description).join(' | ')}`)
      console.log(`${half}: KiCad DRC ${real.length} violations (${drc.unconnected_items.length} unrouted connections, expected before routing)`)
    }
  }
  if (!cli) console.log('KiCad DRC skipped (kicad-cli not found)')
  console.log(`${Object.keys(seen).length} matrix positions`)

  if (errors.length) { console.error('\nFAIL:\n' + errors.join('\n')); process.exit(1) }
  console.log('OK')
})()
