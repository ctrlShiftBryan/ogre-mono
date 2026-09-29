// Torex XC6220B331MR-G 3.3 V 1 A LDO (LCSC C86534, SOT-25), JLCPCB's footprint
// (footprints/jlc/xc6220). The nice!nano v2's external-VCC regulator: VDDH in,
// VCC out for anything the board powers besides the controller (LED strips),
// CE from the controller's P0.13 so firmware can cut it, with a 10 MΩ pull-up
// to VDDH so it's on by default.
// Pins: 1 VIN  2 GND  3 CE  4 NC  5 VOUT
// Nets: vin, vout, ce, gnd

const { place } = require('../jlc')

const net = value => ({ type: 'net', value })

module.exports = {
  params: { designator: 'IC', side: 'front', vin: net('VDDH'), vout: net('VCC'), ce: net('PWR_EN'), gnd: net('GND') },
  body: p => place('xc6220', p, { 1: p.vin, 2: p.gnd, 3: p.ce, 5: p.vout }, { id: 'XC6220', value: 'XC6220B331MR-G' })
    .replace(/([FB])\.SilkS/g, '$1.Fab')   // outline on the fab layer, not the silkscreen
}
