// 32.768 kHz crystal for the controller's low-frequency clock: Epson FC-135
// (LCSC C20340322, 3.2 x 1.5 mm), JLCPCB's footprint (footprints/jlc/fc135).
// Optional: without it the nRF52840 runs its RC oscillator, at a little more
// sleep current.
// Nets: a, b (XL1 and XL2; a crystal has no polarity)

const { place } = require('../jlc')

const net = value => ({ type: 'net', value })

module.exports = {
  params: { designator: 'Y', side: 'front', a: net('XL1'), b: net('XL2') },
  body: p => place('fc135', p, { 1: p.a, 2: p.b }, { id: 'Crystal_FC-135', value: '32.768kHz' })
}
