// Builds config.yaml with the custom footprints in footprints/ and writes
// output/ like the ergogen CLI does (the CLI only picks up footprints when
// given a folder, and this folder also holds node_modules).
// Usage: node build.js            -> output/
//        require('./build').run() -> ergogen results
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const ergogen = require('ergogen')

const here = __dirname

// re-read on every run, so a watcher (serve.js) picks up edited footprints
const inject = () => {
  for (const f of fs.readdirSync(path.join(here, 'footprints'))) {
    if (!f.endsWith('.js')) continue
    const abs = path.join(here, 'footprints', f)
    delete require.cache[require.resolve(abs)]
    ergogen.inject('footprint', f.slice(0, -3), require(abs))
  }
}

const run = () => {
  inject()
  return ergogen.process(fs.readFileSync(path.join(here, 'config.yaml'), 'utf8'), { debug: true, svg: true })
}

// Board placement on KiCad's page: pcbs.<name>.params.origin in config.yaml, [x, y]
// in KiCad mm (y down). The finished PCB moves there as a whole, footprints and
// outline alike, and KiCad's aux (drill) origin goes to the same spot, so plots
// from the drill origin (reference.js) keep ergogen's own coordinates. The points,
// and so the snapshot, don't move: this only places the board on the page.
const origin = name => {
  const config = yaml.load(fs.readFileSync(path.join(here, 'config.yaml'), 'utf8'))
  return ((config.pcbs[name] || {}).params || {}).origin
}

// top-level children of (kicad_pcb ...), found by paren depth, skipping strings
// (legends like "( 9" hold parentheses)
const children = text => {
  const out = []
  let depth = 0, start = -1, quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) { if (c === '\\') i++; else if (c === '"') quoted = false; continue }
    if (c === '"') quoted = true
    else if (c === '(') { if (++depth === 2) start = i }
    else if (c === ')') { if (depth-- === 2) out.push([start, i + 1]) }
  }
  return out
}

const place = (pcb, [dx, dy]) => {
  const num = v => +v.toFixed(6)
  const move = (m, key, x, y) => `(${key} ${num(+x + dx)} ${num(+y + dy)}`
  let res = '', last = 0
  for (const [a, b] of children(pcb)) {
    let item = pcb.slice(a, b)
    if (/^\((module|footprint) /.test(item))   // the footprint's own (at), its first
      item = item.replace(/\((at) ([-\d.e]+) ([-\d.e]+)/, move)
    else if (/^\(gr_/.test(item))              // drawings are in board coordinates throughout
      item = item.replace(/\((start|end|mid|center|at|xy) ([-\d.e]+) ([-\d.e]+)/g, move)
    else if (item.startsWith('(setup'))
      item = item.replace('(setup', `(setup\n    (aux_axis_origin ${num(dx)} ${num(dy)})`)
    res += pcb.slice(last, a) + item
    last = b
  }
  return res + pcb.slice(last)
}

const write = (results, out) => {
  fs.rmSync(out, { recursive: true, force: true })
  const put = (rel, data) => {
    const abs = path.join(out, rel)
    fs.mkdirSync(path.dirname(abs), { recursive: true })
    fs.writeFileSync(abs, rel.endsWith('.yaml') ? yaml.dump(data, { indent: 4, noRefs: true }) : data)
  }
  const twodee = (rel, data) => {
    for (const ext of ['yaml', 'svg', 'dxf']) if (data && data[ext]) put(`${rel}.${ext}`, data[ext])
  }
  put('points/points.yaml', results.points)
  put('points/units.yaml', results.units)
  twodee('points/demo', results.demo)
  for (const [name, o] of Object.entries(results.outlines)) twodee(`outlines/${name}`, o)
  // ergogen stamps today's date into the title block (templates/kicad8.js); blank it
  // so rebuilding an unchanged config gives a byte-identical PCB
  for (const [name, pcb] of Object.entries(results.pcbs)) {
    const at = origin(name)
    const board = pcb.replace(/\(date "[^"]*"\)/, '(date "")')
    put(`pcbs/${name}.kicad_pcb`, at ? place(board, at) : board)
    // a project file beside the board, so KiCad opens it as a project; KiCad
    // fills in every setting left out. There is no schematic: the board is it.
    put(`pcbs/${name}.kicad_pro`, JSON.stringify({ meta: { filename: `${name}.kicad_pro`, version: 1 } }, null, 2) + '\n')
  }
}

module.exports = { run, write, OUT: path.join(here, 'output') }

if (require.main === module) {
  run().then(results => {
    write(results, path.join(here, 'output'))
    console.log(`Wrote ${path.join(here, 'output')}`)
  }).catch(err => { console.error(err); process.exit(1) })
}
