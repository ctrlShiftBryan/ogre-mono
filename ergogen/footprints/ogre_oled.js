// 0.91" 128x32 SSD1306 I2C OLED module on a 4-pin header, as on the Corne
// (crkbd `kbd:OLED`: 4 pins at 2.54 mm): mounted on the front, display up, the
// header at one end and the module lying over the controller toward local -y.
// Pins run SDA, SCL, VCC, GND from pad 1 (the Corne's order with the OLED on
// the front), which common modules (GND VCC SCL SDA along their pin edge, read
// face up) plug into the right way round. Pads are the nice!nano's Mill-Max size
// (2 mm, 1.49 mm drill), so the module can sit on sockets too.
// Nets
//    sda, scl, vcc, gnd: pads 1-4
// Params
//    side: 'front' (as drawn) or 'back', mirrored onto the back of the board

const flip = fp => fp
  .replace(/\((at|start|end) ([-\d.]+) /g, (_, k, x) => `(${k} ${-x} `)
  .replace(/\b([FB])\.(Cu|SilkS|Fab|Mask|CrtYd|Paste)\b/g, (_, s, l) => `${s === 'F' ? 'B' : 'F'}.${l}`)
  .replace(/\(thickness ([\d.]+)\)\)\)/g, '(thickness $1)) (justify mirror))')

const LABELS = ['SDA', 'SCL', 'VCC', 'GND']

module.exports = {
  params: {
    designator: 'OLED',
    sda: undefined,
    scl: undefined,
    vcc: undefined,
    gnd: undefined,
    side: 'front'
  },
  body: p => {
    const r = p.r
    const nets = [p.sda, p.scl, p.vcc, p.gnd]
    const xs = [-3.81, -1.27, 1.27, 3.81]
    const pads = xs.map((x, i) =>
      `(pad ${i + 1} thru_hole ${i === 0 ? 'rect' : 'roundrect'} (at ${x} 0 ${r}) (size 2 2) (drill 1.49) (layers *.Cu *.Mask)${i === 0 ? '' : ' (roundrect_rratio 0.5)'} ${nets[i]})`)
    const labels = xs.map((x, i) =>
      `(fp_text user "${LABELS[i]}" (at ${x} -2.3 ${r}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.12))))`)
    const fp = `
    (module ogre:OLED_128x32 (layer F.Cu) (tedit 5DD4F656)
      AT
      (fp_text reference "${p.ref}" (at 7.2 0 ${r}) (layer F.SilkS) ${p.ref_hide} (effects (font (size 0.8 0.8) (thickness 0.15))))
      (fp_text value "OLED" (at 0 -18 ${r}) (layer F.Fab) (effects (font (size 1 1) (thickness 0.15))))
      ${labels.join('\n      ')}

      (fp_line (start -5.1 -1.27) (end 5.1 -1.27) (layer F.SilkS) (width 0.15))
      (fp_line (start 5.1 -1.27) (end 5.1 1.27) (layer F.SilkS) (width 0.15))
      (fp_line (start 5.1 1.27) (end -5.1 1.27) (layer F.SilkS) (width 0.15))
      (fp_line (start -5.1 1.27) (end -5.1 -1.27) (layer F.SilkS) (width 0.15))

      (fp_line (start -6 1.9) (end 6 1.9) (layer F.Fab) (width 0.1))
      (fp_line (start 6 1.9) (end 6 -36.1) (layer F.Fab) (width 0.1))
      (fp_line (start 6 -36.1) (end -6 -36.1) (layer F.Fab) (width 0.1))
      (fp_line (start -6 -36.1) (end -6 1.9) (layer F.Fab) (width 0.1))

      (fp_line (start -5.35 -1.25) (end 5.35 -1.25) (layer F.CrtYd) (width 0.05))
      (fp_line (start 5.35 -1.25) (end 5.35 1.25) (layer F.CrtYd) (width 0.05))
      (fp_line (start 5.35 1.25) (end -5.35 1.25) (layer F.CrtYd) (width 0.05))
      (fp_line (start -5.35 1.25) (end -5.35 -1.25) (layer F.CrtYd) (width 0.05))

      ${pads.join('\n      ')}
    )
    `
    return (p.side === 'back' ? flip(fp) : fp).replace('AT', p.at)
  }
}
