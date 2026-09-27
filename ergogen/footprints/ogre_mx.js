// PCB-mount (5-pin) MX switch, geometry from the as-built Ogre's MX_PCB_* footprints.
// Nets
//    from: pin 1 (column)
//    to: pin 2 (to the diode)
// Params
//    legend: printed on both silkscreens (key's `legend` via '{{legend}}')
//    stab: add Cherry/Costar PCB-mount stabilizer holes (2U and up)
//    cap_w, cap_h: keycap size in mm, drawn on Dwgs.User

const esc = s => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')

module.exports = {
  params: {
    designator: 'MX',
    from: undefined,
    to: undefined,
    legend: '',
    stab: false,
    cap_w: 18.05,
    cap_h: 18.05
  },
  body: p => {
    const r = p.r
    const w = p.cap_w / 2, h = p.cap_h / 2
    const legend = p.legend ? `
      (fp_text user "${esc(p.legend)}" (at 0 4.6 ${r}) (layer F.SilkS) (effects (font (size 1 1) (thickness 0.15))))
      (fp_text user "${esc(p.legend)}" (at 0 4.6 ${r}) (layer B.SilkS) (effects (font (size 1 1) (thickness 0.15)) (justify mirror)))` : ''
    const stab = p.stab ? `
      (pad "" np_thru_hole circle (at -11.938 -6.985 ${r}) (size 3.048 3.048) (drill 3.048) (layers *.Cu *.Mask))
      (pad "" np_thru_hole circle (at 11.938 -6.985 ${r}) (size 3.048 3.048) (drill 3.048) (layers *.Cu *.Mask))
      (pad "" np_thru_hole circle (at -11.938 8.255 ${r}) (size 3.9878 3.9878) (drill 3.9878) (layers *.Cu *.Mask))
      (pad "" np_thru_hole circle (at 11.938 8.255 ${r}) (size 3.9878 3.9878) (drill 3.9878) (layers *.Cu *.Mask))` : ''
    return `
    (module ogre:MX_PCB (layer F.Cu) (tedit 5DD4F656)
      ${p.at}
      (fp_text reference "${p.ref}" (at 0 3.175 ${r}) (layer Dwgs.User) ${p.ref_hide} (effects (font (size 1 1) (thickness 0.15))))
      (fp_text value "" (at 0 0 ${r}) (layer F.Fab) hide (effects (font (size 1 1) (thickness 0.15))))
      ${legend}

      (fp_line (start -7 -7) (end 7 -7) (layer Eco2.User) (width 0.15))
      (fp_line (start 7 -7) (end 7 7) (layer Eco2.User) (width 0.15))
      (fp_line (start 7 7) (end -7 7) (layer Eco2.User) (width 0.15))
      (fp_line (start -7 7) (end -7 -7) (layer Eco2.User) (width 0.15))

      (fp_line (start ${-w} ${-h}) (end ${w} ${-h}) (layer Dwgs.User) (width 0.15))
      (fp_line (start ${w} ${-h}) (end ${w} ${h}) (layer Dwgs.User) (width 0.15))
      (fp_line (start ${w} ${h}) (end ${-w} ${h}) (layer Dwgs.User) (width 0.15))
      (fp_line (start ${-w} ${h}) (end ${-w} ${-h}) (layer Dwgs.User) (width 0.15))

      (fp_line (start -7 -7) (end 7 -7) (layer F.CrtYd) (width 0.05))
      (fp_line (start 7 -7) (end 7 7) (layer F.CrtYd) (width 0.05))
      (fp_line (start 7 7) (end -7 7) (layer F.CrtYd) (width 0.05))
      (fp_line (start -7 7) (end -7 -7) (layer F.CrtYd) (width 0.05))

      (pad "" np_thru_hole circle (at 0 0 ${r}) (size 3.9878 3.9878) (drill 3.9878) (layers *.Cu *.Mask))
      (pad "" np_thru_hole circle (at -5.08 0 ${r}) (size 1.7 1.7) (drill 1.7) (layers *.Cu *.Mask))
      (pad "" np_thru_hole circle (at 5.08 0 ${r}) (size 1.7 1.7) (drill 1.7) (layers *.Cu *.Mask))
      ${stab}
      (pad 1 thru_hole circle (at 2.54 -5.08 ${r}) (size 2.286 2.286) (drill 1.4986) (layers *.Cu *.Mask) ${p.from})
      (pad 2 thru_hole circle (at -3.81 -2.54 ${r}) (size 2.286 2.286) (drill 1.4986) (layers *.Cu *.Mask) ${p.to})
    )
    `
  }
}
