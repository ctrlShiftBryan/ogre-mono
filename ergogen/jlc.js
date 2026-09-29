// Footprints from JLCPCB's own parts library, so the board carries the pads and
// orientation their assembly line expects. footprints/jlc/<name>.kicad_mod is a
// footprint pulled with easyeda2kicad (`easyeda2kicad --full --lcsc_id C…`),
// kept verbatim apart from its 3D model reference; each carries the part's
// LCSC number as a footprint property, which the JLC BOM/CPL export reads.
// A wrapper in footprints/ (ogre_e73.js and friends) names the pins and calls
// `place` here.
//
// place(name, p, nets, opts)
//   name: file in footprints/jlc/, without .kicad_mod
//   p: the ergogen params of the calling footprint (at, r, ref, ref_hide, side)
//   nets: { padName: net } as ergogen net params ('' leaves a pad unconnected)
//   opts.value: the value text (part number or value), on F.Fab
//   opts.lcsc: LCSC number, when the file's isn't the part used (a 10k on the
//     0603 resistor footprint); '' drops the property (hand-soldered parts)
//   opts.id: footprint id, ogre:<id>; defaults to the file name
//   opts.rotate: degrees added to the footprint's rotation, when the wrapper's
//     frame differs from JLC's drawing. This turns the whole footprint, so the
//     CPL rotation stays right: never rotate the pads in the file instead.
//   p.side 'back' mirrors the whole footprint onto the back of the board.

const fs = require('fs')
const path = require('path')

const num = v => +(+v).toFixed(4)

// easyeda2kicad writes arcs the old way, centre + start point + sweep; KiCad 8+
// wants start, mid and end points
const arcs = text => text.replace(/\(fp_arc \(start ([-\d.]+) ([-\d.]+)\) \(end ([-\d.]+) ([-\d.]+)\) \(angle ([-\d.]+)\)/g, (_, cx, cy, sx, sy, a) => {
  const at = t => {
    const rad = a * t * Math.PI / 180
    const dx = sx - cx, dy = sy - cy
    return `${num(+cx + dx * Math.cos(rad) - dy * Math.sin(rad))} ${num(+cy + dx * Math.sin(rad) + dy * Math.cos(rad))}`
  }
  return `(fp_arc (start ${num(sx)} ${num(sy)}) (mid ${at(0.5)}) (end ${at(1)})`
})

const cache = {}
const load = name => {
  if (!cache[name]) cache[name] = arcs(fs.readFileSync(path.join(__dirname, 'footprints/jlc', `${name}.kicad_mod`), 'utf8'))
  return cache[name]
}

// [start, end) of each (token …) block at the top level of text, skipping strings
const blocks = (text, token) => {
  const out = []
  let i = 0
  for (;;) {
    i = text.indexOf(`(${token} `, i)
    if (i < 0) return out
    let depth = 0, quoted = false, j = i
    for (; j < text.length; j++) {
      const c = text[j]
      if (quoted) { if (c === '"') quoted = false; continue }
      if (c === '"') quoted = true
      else if (c === '(') depth++
      else if (c === ')' && --depth === 0) break
    }
    out.push([i, j + 1])
    i = j + 1
  }
}

// mirror onto the back: x negated, F./B. layers swapped, text read from behind
const flip = fp => fp
  .replace(/\((at|start|end|center|xy) ([-\d.]+) ([-\d.]+)/g, (_, k, x, y) => `(${k} ${num(-x)} ${y}`)
  .replace(/\b([FB])\.(Cu|SilkS|Fab|Mask|CrtYd|Paste|Adhes)\b/g, (_, s, l) => `${s === 'F' ? 'B' : 'F'}.${l}`)
  .replace(/\(effects \(font \(size ([\d.]+ [\d.]+)\) \(thickness ([\d.]+)\)\)\)/g, '(effects (font (size $1) (thickness $2)) (justify mirror))')

const place = (name, p, nets = {}, opts = {}) => {
  const r = num(p.r + (opts.rotate || 0))
  const at = `(at ${p.x} ${p.y} ${r})`
  let fp = load(name)

  fp = fp.replace(/^\(module \S+ \(layer F\.Cu\)[^\n]*/, `(module ogre:${opts.id || name} (layer F.Cu) (tedit 5DD4F656)\n\tAT`)
  fp = fp.replace(/\(fp_text reference REF\*\* \(at ([-\d.]+) ([-\d.]+)\) \(layer F\.SilkS\)/,
    `(fp_text reference "${p.ref}" (at $1 $2 ${r}) (layer F.SilkS) ${p.ref_hide}`)
  fp = fp.replace(/\(fp_text value \S+ \(at ([-\d.]+) ([-\d.]+)\) \(layer F\.Fab\)/,
    `(fp_text value "${opts.value || name}" (at $1 $2 ${r}) (layer F.Fab)`)
  if (opts.lcsc !== undefined) {
    fp = opts.lcsc ? fp.replace(/\(property "LCSC Part" "[^"]*"\)/, `(property "LCSC Part" "${opts.lcsc}")`)
      : fp.replace(/\n\t\(property "LCSC Part" "[^"]*"\)/, '')
  }

  // pads: the footprint's rotation goes onto each pad's own angle (KiCad keeps
  // pad angles absolute), and the pad's net goes before its closing paren
  let out = '', last = 0
  for (const [a, b] of blocks(fp, 'pad')) {
    let pad = fp.slice(a, b)
    const m = pad.match(/^\(pad "?([^"\s)]*)"? \S+ \S+ \(at ([-\d.]+) ([-\d.]+)(?: ([-\d.]+))?\)/)
    if (m) {
      const [, id, x, y, angle] = m
      pad = pad.replace(m[0], `(pad ${id === '' ? '""' : id} ${m[0].split(' ')[2]} ${m[0].split(' ')[3]} (at ${x} ${y} ${num(+(angle || 0) + r)})`)
      const net = nets[id]
      if (net !== undefined && String(net) !== '') pad = pad.slice(0, -1) + ` ${net})`
    }
    out += fp.slice(last, a) + pad
    last = b
  }
  fp = out + fp.slice(last)

  return (p.side === 'back' ? flip(fp) : fp).replace('AT', at)
}

module.exports = { place, flip, blocks }
