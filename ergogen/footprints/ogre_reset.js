// Reset switch: a 5.1 mm surface-mount tactile switch (XKB TS-1187A-B-A-B, LCSC
// C318884), JLCPCB's footprint (footprints/jlc/ts1187a). Its four pads are two
// pairs joined inside the switch; which pairs isn't worth trusting, so the nets
// go on the diagonal, pads 1 and 4, which the button joins whichever way the
// pairs run. Pads 2 and 3 just hold it down.
// Nets
//    from: pad 4 (GND)
//    to: pad 1 (RESET)
// Params
//    side: 'front' or 'back'

const { place } = require('../jlc')

module.exports = {
  params: { designator: 'SW', side: 'front', from: undefined, to: undefined },
  body: p => place('ts1187a', p, { 1: p.to, 4: p.from }, { id: 'SW_Reset_TS1187A', value: 'RESET' })
}
