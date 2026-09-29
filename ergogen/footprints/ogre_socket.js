// The hotswap socket under a key: a Kailh-compatible MX socket (HanElectricity
// CPG151101S11-2, LCSC C49352235), JLCPCB's footprint (footprints/jlc/socket),
// a part of its own so the JLC placement file gets the socket's own centre and
// angle. It places itself on the back of the switch (ogre_hotswap), its two
// pin holes over the switch's pins, so one entry serves every key and the
// designators stay in key order. Its outline is on the fab layer, not the
// silkscreen.
// Nets
//    from: pad 1 (column)
//    to: pad 2, to the diode's anode (defaults to the key's name)
// Params
//    turn: degrees the switch turns on its key (key's `turn` via '{{turn}}'),
//      the same as the switch's

const { place } = require('../jlc')

// the socket's centre from the switch's, in the key's frame (mm, y up); with the
// footprint turned 180° its holes land on the switch's pins at (-3.81, -2.54) and
// (2.54, -5.08) (KiCad y down) and its body bulges the way the 2024 library drew it
const OFFSET = [-0.635, 3.81]

module.exports = {
  params: {
    designator: 'S',
    from: undefined,
    to: { type: 'net', value: '{{name}}' },
    turn: ''
  },
  body: p => {
    const r = p.r + Number(p.turn || 0)
    const a = r * Math.PI / 180
    const [dx, dy] = OFFSET
    const x = +(p.x + dx * Math.cos(a) - dy * Math.sin(a)).toFixed(6)
    const y = +(p.y - (dx * Math.sin(a) + dy * Math.cos(a))).toFixed(6)   // KiCad y points down
    // the switch's pin holes are the switch footprint's; JLC's drawing repeats them
    return place('socket', { ...p, x, y, r, side: 'back' }, { 1: p.from, 2: p.to }, { id: 'Hotswap_Socket', value: 'CPG151101S11', rotate: 180 })
      .replace(/\n\t\(pad "" thru_hole[^\n]*/g, '')
      .replace(/B\.SilkS/g, 'B.Fab')   // its outline on the fab layer: the back silkscreen keeps the legends and diodes readable
  }
}
