// An l0805 inductor from JLCPCB's library (footprints/jlc/l0805; the file's part
// is C1046). The LCSC number names the exact part, so the BOM export picks it
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
  params: { designator: 'L', side: 'front', value: '', lcsc: 'C1046', from: undefined, to: undefined },
  body: p => place('l0805', p, { 1: p.from, 2: p.to }, { id: 'L_0805', value: p.value || 'l0805', lcsc: p.lcsc })
    .replace(/([FB])\.SilkS/g, '$1.Fab')
}
