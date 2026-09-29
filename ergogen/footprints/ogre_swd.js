// SWD programming pads for a Tag-Connect TC2030-NL cable (KiCad's
// Tag-Connect_TC2030-IDC-NL_2x03_P1.27mm_Vertical): six bare pads and three
// 0.99 mm locating holes, no part to fit. The nRF52840 arrives blank, so this
// is how the UF2 bootloader gets on once. The ARM Cortex pinout:
//   1 VTref (VDD)  2 SWDIO  3 nRESET  4 SWDCLK  5 GND  6 SWO
// Nets: vtref, swdio, reset, swdclk, gnd, swo ('' unconnected)
// Params
//    side: 'front' or 'back'

const { flip } = require('../jlc')

const net = value => ({ type: 'net', value })

module.exports = {
  params: {
    designator: 'J', side: 'front',
    vtref: net('VDD'), swdio: net('SWDIO'), reset: net('RESET'), swdclk: net('SWDCLK'), gnd: net('GND'), swo: net('')
  },
  body: p => {
    const r = p.r
    const pad = (n, x, y, net) => `(pad ${n} connect circle (at ${x} ${y} ${r}) (size 0.7874 0.7874) (layers F.Cu F.Mask) ${net})`
    const fp = `
    (module ogre:SWD_TC2030-NL (layer F.Cu) (tedit 5DD4F656)
      AT
      (attr smd)
      (fp_text reference "${p.ref}" (at 0 -2.2 ${r}) (layer F.SilkS) ${p.ref_hide} (effects (font (size 0.8 0.8) (thickness 0.12))))
      (fp_text value "SWD" (at 0 2.2 ${r}) (layer F.Fab) (effects (font (size 0.8 0.8) (thickness 0.12))))

      (fp_line (start -3.2 -1.7) (end 3.2 -1.7) (layer F.CrtYd) (width 0.05))
      (fp_line (start 3.2 -1.7) (end 3.2 1.7) (layer F.CrtYd) (width 0.05))
      (fp_line (start 3.2 1.7) (end -3.2 1.7) (layer F.CrtYd) (width 0.05))
      (fp_line (start -3.2 1.7) (end -3.2 -1.7) (layer F.CrtYd) (width 0.05))
      (fp_line (start -1.9 -1.2) (end -1.9 1.2) (layer F.SilkS) (width 0.12))
      (fp_line (start -1.9 1.2) (end 1.9 1.2) (layer F.SilkS) (width 0.12))
      (fp_line (start 1.9 1.2) (end 1.9 -1.2) (layer F.SilkS) (width 0.12))
      (fp_line (start 1.9 -1.2) (end -1.9 -1.2) (layer F.SilkS) (width 0.12))
      (fp_circle (center -1.27 1.65) (end -1.27 1.8) (layer F.SilkS) (width 0.12))

      (pad "" np_thru_hole circle (at -2.54 0 ${r}) (size 0.9906 0.9906) (drill 0.9906) (layers *.Cu *.Mask))
      (pad "" np_thru_hole circle (at 2.54 -1.016 ${r}) (size 0.9906 0.9906) (drill 0.9906) (layers *.Cu *.Mask))
      (pad "" np_thru_hole circle (at 2.54 1.016 ${r}) (size 0.9906 0.9906) (drill 0.9906) (layers *.Cu *.Mask))
      ${pad(1, -1.27, 0.635, p.vtref)}
      ${pad(2, -1.27, -0.635, p.swdio)}
      ${pad(3, 0, 0.635, p.reset)}
      ${pad(4, 0, -0.635, p.swdclk)}
      ${pad(5, 1.27, 0.635, p.gnd)}
      ${pad(6, 1.27, -0.635, p.swo)}
    )
    `
    return (p.side === 'back' ? flip(fp) : fp).replace('AT', p.at)
  }
}
