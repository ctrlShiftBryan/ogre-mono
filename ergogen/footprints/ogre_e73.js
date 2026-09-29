// Ebyte E73-2G4M08S1C: an nRF52840 module with its antenna, matching and
// crystals inside (LCSC C356849), JLCPCB's footprint (footprints/jlc/e73). It
// runs in high-voltage mode like a nice!nano: the battery (through the charger)
// feeds VDDH, and the chip's own regulator puts 3.3 V out on DCCH, which an
// inductor carries to VDD. The ceramic antenna is the module's local +y end
// (the silkscreen box past the pads): keep it at a board edge, with no copper
// under it or beside it on either layer.
// Pins (module pad: chip pin), from Ebyte's manual, section 3:
//   1 P1.11  2 P1.10  3 P0.03  4 P0.28  5 GND  6 P1.13  7 P0.02  8 P0.29
//   9 P0.31  10 P0.30  11 XL1/P0.00  12 P0.26  13 XL2/P0.01  14 P0.06  15 P0.05
//   16 P0.08  17 P1.09  18 P0.04/AIN2  19 VDD  20 P0.12  21 GND  22 P0.07
//   23 VDDH  24 GND  25 DCCH  26 RESET/P0.18  27 VBUS  28 P0.15  29 D-  30 P0.17
//   31 D+  32 P0.20  33 P0.13  34 P0.22  35 P0.24  36 P1.00  37 SWDIO  38 P1.02
//   39 SWDCLK  40 P1.04  41 P0.09/NFC1  42 P1.06  43 P0.10/NFC2
// Nets (all optional but the matrix; '' leaves a pad unconnected)
//   col_0..col_7: the half's eight columns, on P1.11 P1.10 P0.03 P0.28 P1.13 P0.02 P0.29 P0.31
//   row_0..row_5: the half's six rows, on P0.30 P0.26 P0.06 P0.05 P0.08 P1.09
//   vddh: high-voltage supply in (battery or USB, from the charger's OUT)
//   dcch: regulator out, to the inductor;  vdd: 3.3 V, from the inductor
//   vbus: USB 5 V (for USB detection);  dm, dp: USB data
//   reset: to the reset switch (internal pull-up);  swdio, swdclk: programming
//   xl1, xl2: 32.768 kHz crystal (optional)
//   led: P0.15, the nice!nano's status LED pin;  vcc_ctl: P0.13, the nice!nano's
//     external-VCC cut-off pin, to the LDO's CE
// Params
//   side: 'front' or 'back'

const { place } = require('../jlc')

const net = value => ({ type: 'net', value })
const params = { designator: 'MCU', side: 'front' }   // not 'U': ergogen reads that as the 19.05 mm unit
for (let c = 0; c <= 7; c++) params[`col_${c}`] = net('')
for (let r = 0; r <= 5; r++) params[`row_${r}`] = net('')
Object.assign(params, {
  gnd: net('GND'), vddh: net('VDDH'), dcch: net('DCCH'), vdd: net('VDD'),
  vbus: net('VBUS'), dm: net('D-'), dp: net('D+'), reset: net('RESET'),
  swdio: net('SWDIO'), swdclk: net('SWDCLK'), xl1: net('XL1'), xl2: net('XL2'),
  led: net('BLED'), vcc_ctl: net('PWR_EN')
})

const PADS = {
  col_0: 1, col_1: 2, col_2: 3, col_3: 4, col_4: 6, col_5: 7, col_6: 8, col_7: 9,
  row_0: 10, row_1: 12, row_2: 14, row_3: 15, row_4: 16, row_5: 17,
  xl1: 11, xl2: 13, vdd: 19, vddh: 23, dcch: 25, reset: 26, vbus: 27, led: 28,
  dm: 29, dp: 31, vcc_ctl: 33, swdio: 37, swdclk: 39
}

module.exports = {
  params,
  body: p => {
    const nets = { 5: p.gnd, 21: p.gnd, 24: p.gnd }
    for (const [name, pad] of Object.entries(PADS)) nets[pad] = p[name]
    return place('e73', p, nets, { id: 'E73-2G4M08S1C', value: 'E73-2G4M08S1C', value_size: 1 })
      .replace(/([FB])\.SilkS/g, '$1.Fab')   // outline on the fab layer: the antenna end sits on the board edge
  }
}
