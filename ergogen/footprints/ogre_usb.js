// USB, as a Molex Pico-EZmate 4-pin connector (78171-0004, LCSC C588524),
// JLCPCB's footprint (footprints/jlc/ezmate), for the cable to a Unified
// Daughterboard S1 in the case (unified-daughterboard.github.io). The cable is
// one-to-one, so this copies the daughterboard's pinout: 1 VBUS, 2 D-, 3 D+,
// 4 GND. The daughterboard carries the USB-C port's fuse and ESD protection.
// The cable plugs in from local -x, the side of the two shell pads (on the
// daughterboard the opening faces away from its USB-C port, and its contact
// pads sit on the port's side); keep that side clear.
// Nets: vbus, dm, dp, gnd (the shell pads 6 and 7 go to gnd too)

const { place } = require('../jlc')

const net = value => ({ type: 'net', value })

module.exports = {
  params: { designator: 'J', side: 'front', vbus: net('VBUS'), dm: net('D-'), dp: net('D+'), gnd: net('GND') },
  body: p => place('ezmate', p, { 1: p.vbus, 2: p.dm, 3: p.dp, 4: p.gnd, 6: p.gnd, 7: p.gnd }, { id: 'USB_PicoEZmate', value: 'USB' })
}
