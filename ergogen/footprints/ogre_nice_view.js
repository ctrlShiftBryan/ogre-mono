// nice!view (Sharp memory-in-pixel display, 160x68, 3-wire SPI) on its 5-pin
// header, pin order from the nice!view's KiCad library (HookyQR/nice_view_pcb):
// MOSI, SCK, VCC, GND, CS from pad 1, 2.54 mm apart. Mounted on the front,
// display up, the header at one end and the 14 x 36 mm module lying over the
// controller toward local -y. The first four pins are the Corne's 4-pin OLED
// header in the same order (SDA -> MOSI, SCL -> SCK), CS added past GND. Pads
// are the nice!nano's Mill-Max size (2 mm, 1.49 mm drill).
// Nets
//    mosi, sck, vcc, gnd, cs: pads 1-5
// Params
//    side: 'front' (as drawn) or 'back', mirrored onto the back of the board

const flip = fp => fp
  .replace(/\((at|start|end) ([-\d.]+) /g, (_, k, x) => `(${k} ${-x} `)
  .replace(/\b([FB])\.(Cu|SilkS|Fab|Mask|CrtYd|Paste)\b/g, (_, s, l) => `${s === 'F' ? 'B' : 'F'}.${l}`)
  .replace(/\(thickness ([\d.]+)\)\)\)/g, '(thickness $1)) (justify mirror))')

const LABELS = ['MOSI', 'SCK', 'VCC', 'GND', 'CS']

module.exports = {
  params: {
    designator: 'DISP',
    mosi: undefined,
    sck: undefined,
    vcc: undefined,
    gnd: undefined,
    cs: undefined,
    side: 'front'
  },
  body: p => {
    const r = p.r
    const nets = [p.mosi, p.sck, p.vcc, p.gnd, p.cs]
    const xs = [-5.08, -2.54, 0, 2.54, 5.08]
    const pads = xs.map((x, i) =>
      `(pad ${i + 1} thru_hole ${i === 0 ? 'rect' : 'roundrect'} (at ${x} 0 ${r}) (size 2 2) (drill 1.49) (layers *.Cu *.Mask)${i === 0 ? '' : ' (roundrect_rratio 0.5)'} ${nets[i]})`)
    const labels = xs.map((x, i) =>
      `(fp_text user "${LABELS[i]}" (at ${x} -2.3 ${r}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.12))))`)
    const fp = `
    (module ogre:nice_view (layer F.Cu) (tedit 5DD4F656)
      AT
      (fp_text reference "${p.ref}" (at 8.6 0 ${r}) (layer F.SilkS) ${p.ref_hide} (effects (font (size 0.8 0.8) (thickness 0.15))))
      (fp_text value "nice!view" (at 0 -17 ${r}) (layer F.Fab) (effects (font (size 1 1) (thickness 0.15))))
      ${labels.join('\n      ')}

      (fp_line (start -6.35 -1.27) (end 6.35 -1.27) (layer F.SilkS) (width 0.15))
      (fp_line (start 6.35 -1.27) (end 6.35 1.27) (layer F.SilkS) (width 0.15))
      (fp_line (start 6.35 1.27) (end -6.35 1.27) (layer F.SilkS) (width 0.15))
      (fp_line (start -6.35 1.27) (end -6.35 -1.27) (layer F.SilkS) (width 0.15))

      (fp_line (start -7 1.27) (end 7 1.27) (layer F.Fab) (width 0.1))
      (fp_line (start 7 1.27) (end 7 -34.73) (layer F.Fab) (width 0.1))
      (fp_line (start 7 -34.73) (end -7 -34.73) (layer F.Fab) (width 0.1))
      (fp_line (start -7 -34.73) (end -7 1.27) (layer F.Fab) (width 0.1))

      (fp_line (start -6.6 -1.25) (end 6.6 -1.25) (layer F.CrtYd) (width 0.05))
      (fp_line (start 6.6 -1.25) (end 6.6 1.25) (layer F.CrtYd) (width 0.05))
      (fp_line (start 6.6 1.25) (end -6.6 1.25) (layer F.CrtYd) (width 0.05))
      (fp_line (start -6.6 1.25) (end -6.6 -1.25) (layer F.CrtYd) (width 0.05))

      ${pads.join('\n      ')}
    )
    `
    return (p.side === 'back' ? flip(fp) : fp).replace('AT', p.at)
  }
}
