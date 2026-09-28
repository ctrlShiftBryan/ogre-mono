// 6 mm tactile reset switch, on the back of the board (as on the 2019 Ogre).
// Nets
//    from: pads 1 (GND)
//    to: pads 2 (RST)

module.exports = {
  params: {
    designator: 'SW',
    from: undefined,
    to: undefined
  },
  body: p => `
    (module ogre:SW_PUSH_6mm (layer B.Cu) (tedit 5DD4F656)
      ${p.at}
      (fp_text reference "${p.ref}" (at 0 0 ${p.r}) (layer B.SilkS) ${p.ref_hide} (effects (font (size 1 1) (thickness 0.15)) (justify mirror)))
      (fp_text value "" (at 0 0 ${p.r}) (layer B.Fab) hide (effects (font (size 1 1) (thickness 0.15)) (justify mirror)))

      (fp_line (start -2.1 -3.1) (end 2.1 -3.1) (layer B.SilkS) (width 0.12))
      (fp_line (start 2.1 -3.1) (end 2.1 3.1) (layer B.SilkS) (width 0.12))
      (fp_line (start 2.1 3.1) (end -2.1 3.1) (layer B.SilkS) (width 0.12))
      (fp_line (start -2.1 3.1) (end -2.1 -3.1) (layer B.SilkS) (width 0.12))
      (fp_circle (center 0 0) (end 1.75 0) (layer B.SilkS) (width 0.12))

      (fp_line (start -4.75 -3.75) (end 4.75 -3.75) (layer B.CrtYd) (width 0.05))
      (fp_line (start 4.75 -3.75) (end 4.75 3.75) (layer B.CrtYd) (width 0.05))
      (fp_line (start 4.75 3.75) (end -4.75 3.75) (layer B.CrtYd) (width 0.05))
      (fp_line (start -4.75 3.75) (end -4.75 -3.75) (layer B.CrtYd) (width 0.05))

      (pad 1 thru_hole circle (at -3.25 2.25 ${p.r}) (size 2 2) (drill 1.1) (layers *.Cu *.Mask) ${p.from})
      (pad 1 thru_hole circle (at 3.25 2.25 ${p.r}) (size 2 2) (drill 1.1) (layers *.Cu *.Mask) ${p.from})
      (pad 2 thru_hole circle (at -3.25 -2.25 ${p.r}) (size 2 2) (drill 1.1) (layers *.Cu *.Mask) ${p.to})
      (pad 2 thru_hole circle (at 3.25 -2.25 ${p.r}) (size 2 2) (drill 1.1) (layers *.Cu *.Mask) ${p.to})
    )
  `
}
