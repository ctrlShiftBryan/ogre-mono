// Pro Micro on Mill-Max sockets, pad layout from the 2019 Ogre (Pro-MillMax-v2).
// Pads are numbered 1-24 counterclockwise from TX0; pad 1 is next to the USB end.
//   pads 1-12:  TX0(D3) RX1(D2) GND GND D1 D0 D4 C6 D7 E6 B4 B5
//   pads 13-24: B6 B2 B3 B1 F7 F6 F5 F4 VCC RST GND RAW
// Params
//    pad1..pad24: net on each pad ('' leaves it unconnected)
// Sits under the keys, on the back of the board.

const params = { designator: 'MCU' }   // not 'U': ergogen reads that as the 19.05 mm unit
for (let i = 1; i <= 24; i++) params[`pad${i}`] = { type: 'net', value: '' }

module.exports = {
  params,
  body: p => {
    const pads = []
    for (let i = 1; i <= 24; i++) {
      const x = i <= 12 ? -13.97 + 2.54 * (i - 1) : 13.97 - 2.54 * (i - 13)
      const y = i <= 12 ? 7.62 : -7.62
      const shape = i === 1 ? 'rect' : 'circle'
      pads.push(`(pad ${i} thru_hole ${shape} (at ${x.toFixed(2)} ${y} ${p.r}) (size 2 2) (drill 1.49) (layers *.Cu *.Mask) ${p['pad' + i]})`)
    }
    return `
    (module ogre:ProMicro_MillMax (layer F.Cu) (tedit 5DD4F656)
      ${p.at}
      (fp_text reference "${p.ref}" (at 0 0 ${p.r + 90}) (layer B.SilkS) ${p.ref_hide} (effects (font (size 1 1) (thickness 0.15)) (justify mirror)))
      (fp_text value "" (at 0 0 ${p.r}) (layer F.Fab) hide (effects (font (size 1 1) (thickness 0.15))))

      (fp_line (start -16.5 -8.89) (end 15.24 -8.89) (layer B.SilkS) (width 0.15))
      (fp_line (start 15.24 -8.89) (end 15.24 8.89) (layer B.SilkS) (width 0.15))
      (fp_line (start 15.24 8.89) (end -16.5 8.89) (layer B.SilkS) (width 0.15))
      (fp_text user USB (at -15.5 0 ${p.r + 90}) (layer B.SilkS) (effects (font (size 1 1) (thickness 0.15)) (justify mirror)))

      (fp_line (start -19.304 -3.81) (end -14.224 -3.81) (layer Dwgs.User) (width 0.15))
      (fp_line (start -14.224 -3.81) (end -14.224 3.81) (layer Dwgs.User) (width 0.15))
      (fp_line (start -14.224 3.81) (end -19.304 3.81) (layer Dwgs.User) (width 0.15))
      (fp_line (start -19.304 3.81) (end -19.304 -3.81) (layer Dwgs.User) (width 0.15))

      (fp_line (start -18 -9.1) (end 15.5 -9.1) (layer B.CrtYd) (width 0.05))
      (fp_line (start 15.5 -9.1) (end 15.5 9.1) (layer B.CrtYd) (width 0.05))
      (fp_line (start 15.5 9.1) (end -18 9.1) (layer B.CrtYd) (width 0.05))
      (fp_line (start -18 9.1) (end -18 -9.1) (layer B.CrtYd) (width 0.05))

      ${pads.join('\n      ')}
    )
    `
  }
}
