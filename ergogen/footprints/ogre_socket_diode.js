// The switch diode: a 1N4148W in SOD-123F on the back (LCSC C81598), JLCPCB's
// footprint (footprints/jlc/sod123f), as a part of its own so it can be moved
// clear of traces. Cathode toward local +y, anode toward -y, as the 2024
// library's built-in diode was drawn.
// Nets
//    from: anode, pad 2 (from the switch)
//    to: cathode, pad 1 (to the row)
// Params
//    place: 'x,y,r' from the key, in the key's frame (mm, y up) and degrees,
//      from its `diode` ('{{diode}}'); empty for the switch's right edge, where
//      the 2024 footprint had it built in. The footprint places itself from this,
//      so one entry serves every key and designators stay in key order.

const { place } = require('../jlc')

const DEFAULT = [8.15, -0.63, 0]

module.exports = {
  params: {
    designator: 'D',
    from: undefined,
    to: undefined,
    place: ''
  },
  body: p => {
    const [dx, dy, dr] = p.place ? String(p.place).split(',').map(Number) : DEFAULT
    const a = p.r * Math.PI / 180
    const x = +(p.x + dx * Math.cos(a) - dy * Math.sin(a)).toFixed(6)
    const y = +(p.y - (dx * Math.sin(a) + dy * Math.cos(a))).toFixed(6)   // KiCad y points down
    // JLC draws the diode along x, cathode (pad 1) at -x; mirrored onto the back and
    // turned -90° the cathode is at +y (KiCad's y, down), where the 2024 library put it
    return place('sod123f', { ...p, x, y, r: p.r + dr, side: 'back' }, { 1: p.to, 2: p.from }, { id: 'Socket_Diode', value: '1N4148W', rotate: 270 })
  }
}
