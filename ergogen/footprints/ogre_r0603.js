// An r0603 resistor from JLCPCB's library (footprints/jlc/r0603; the file's part
// is C25804). The LCSC number names the exact part, so the BOM export picks it
// up. Its outline is on the fab layer, not the silkscreen.
// Nets
//    from: pad 1
//    to: pad 2
// Params
//    value: printed value
//    lcsc: the part's LCSC number
//    side: 'front' or 'back'

const { place } = require('../jlc')

module.exports = {
  params: { designator: 'R', side: 'front', value: '', lcsc: 'C25804', from: undefined, to: undefined },
  body: p => place('r0603', p, { 1: p.from, 2: p.to }, { id: 'R_0603', value: p.value || 'r0603', lcsc: p.lcsc })
    .replace(/([FB])\.SilkS/g, '$1.Fab')
}
