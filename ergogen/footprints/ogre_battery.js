// JST PH 2-pin side-entry surface-mount battery connector (S2B-PH-SM4-TB, LCSC
// C295747), JLCPCB's footprint (footprints/jlc/jst_ph_smd). The plug enters
// from local -y (the signal pads' side). JST sets no polarity; pad 1 = + follows
// Adafruit and SparkFun (plug's mating face toward you, polarizing bump up: red
// on the right) and the community wireless Corne. About half of generic LiPos
// are wired the other way, so `plus` can move + to pad 2; the silkscreen marks it.
// Nets
//    pos: battery +, to the power switch
//    neg: battery - (GND)
// Params
//    plus: 1 or 2, the pad for pos
//    side: 'front' or 'back'

const { place } = require('../jlc')

const net = value => ({ type: 'net', value })

module.exports = {
  params: { designator: 'J', side: 'front', pos: net('BAT'), neg: net('GND'), plus: 1 },
  body: p => {
    const [n1, n2] = p.plus === 2 ? [p.neg, p.pos] : [p.pos, p.neg]
    const x = p.plus === 2 ? 1 : -1
    const mark = `\n\t(fp_text user "+" (at ${x} -5.6 ${p.r}) (layer F.SilkS) (effects (font (size 1 1) (thickness 0.2))))`   // past the + contact's solder tail
    return place('jst_ph_smd', p, { 1: n1, 2: n2 }, { id: 'JST_PH_S2B-PH-SM4', value: 'BAT' })
      .replace(/([FB])\.SilkS/g, '$1.Fab')   // outline on the fab layer; only the + mark goes on the silkscreen
      .replace(/\n\t\(pad 1 /, `${mark}\n\t(pad 1 `)
  }
}
