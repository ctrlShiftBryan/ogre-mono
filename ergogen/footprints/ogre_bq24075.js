// TI BQ24075 Li-ion charger and power path (LCSC C15464, QFN-16), JLCPCB's
// footprint (footprints/jlc/bq24075). Wired as on the nice!nano v2: USB in on
// IN, the battery on BAT, the system on OUT (from USB when present, else the
// battery), 500 mA USB limit (EN1 high, EN2 low), CE low so it charges whenever
// USB is there, SYSOFF low, the charge current set by the ISET resistor
// (K/R: 10k ≈ 100 mA) and the battery thermistor faked with 10k on TS.
// CHG pulls low while charging, for the charge LED.
// Pins: 1 TS  2,3 BAT  4 CE  5 EN2  6 EN1  7 PGOOD  8 VSS  9 CHG  10,11 OUT
//   12 ILIM  13 IN  14 TMR  15 SYSOFF  16 ISET  17 thermal pad
// Nets
//   in, out, bat, ts, iset, chg: as above ('' leaves one unconnected)
//   en1 (default VDDH), en2, ce, sysoff (default GND), gnd
//   pgood, ilim, tmr: unconnected by default
// Params
//   side: 'front' or 'back'

const { place } = require('../jlc')

const net = value => ({ type: 'net', value })

module.exports = {
  params: {
    designator: 'IC', side: 'front',   // not 'U': ergogen reads that as the 19.05 mm unit
    in: net('VBUS'), out: net('VDDH'), bat: net('VBAT'), ts: net('TS'), iset: net('ISET'), chg: net('CHG'),
    en1: net('VDDH'), en2: net('GND'), ce: net('GND'), sysoff: net('GND'), gnd: net('GND'),
    pgood: net(''), ilim: net(''), tmr: net('')
  },
  body: p => place('bq24075', p, {
    1: p.ts, 2: p.bat, 3: p.bat, 4: p.ce, 5: p.en2, 6: p.en1, 7: p.pgood, 8: p.gnd, 9: p.chg,
    10: p.out, 11: p.out, 12: p.ilim, 13: p.in, 14: p.tmr, 15: p.sysoff, 16: p.iset, 17: p.gnd
  }, { id: 'BQ24075', value: 'BQ24075RGTR' })
    .replace(/\(width 0\.1\) \n\t\t\t\)/, '(width 0)\n\t\t\t)')   // the thermal pad's polygon, drawn without a stroke: the part's own 0.225 mm to the pins
    .replace(/([FB])\.SilkS/g, '$1.Fab')   // outline on the fab layer, not the silkscreen
}
