// PJ-320A TRRS jack on the back of the board, geometry from the 2019 Ogre.
// The plug opening is at local y = 0; the body runs to y = -12.1.
// Nets: sleeve (pad 1), tip (pad 2), ring1 (pad 3), ring2 (pad 4)

module.exports = {
  params: {
    designator: 'TRRS',
    sleeve: undefined,
    tip: undefined,
    ring1: undefined,
    ring2: undefined
  },
  body: p => `
    (module ogre:TRRS_PJ-320A (layer B.Cu) (tedit 5DD4F656)
      ${p.at}
      (fp_text reference "${p.ref}" (at 0 -14.2 ${p.r}) (layer B.SilkS) ${p.ref_hide} (effects (font (size 1 1) (thickness 0.15)) (justify mirror)))
      (fp_text value "" (at 0 0 ${p.r}) (layer B.Fab) hide (effects (font (size 1 1) (thickness 0.15)) (justify mirror)))

      (fp_line (start -3.5 -1) (end -3.5 -12.6) (layer B.SilkS) (width 0.15))
      (fp_line (start -3.5 -12.6) (end 3.5 -12.6) (layer B.SilkS) (width 0.15))
      (fp_line (start 3.5 -12.6) (end 3.5 -1) (layer B.SilkS) (width 0.15))
      (fp_line (start 2.8 2) (end -2.8 2) (layer Dwgs.User) (width 0.15))
      (fp_line (start -2.8 0) (end -2.8 2) (layer Dwgs.User) (width 0.15))
      (fp_line (start 2.8 0) (end 2.8 2) (layer Dwgs.User) (width 0.15))

      (fp_line (start -3.65 0.2) (end 3.65 0.2) (layer B.CrtYd) (width 0.05))
      (fp_line (start 3.65 0.2) (end 3.65 -12.85) (layer B.CrtYd) (width 0.05))
      (fp_line (start 3.65 -12.85) (end -3.65 -12.85) (layer B.CrtYd) (width 0.05))
      (fp_line (start -3.65 -12.85) (end -3.65 0.2) (layer B.CrtYd) (width 0.05))

      (pad "" np_thru_hole circle (at 0 -8.6 ${p.r}) (size 0.8 0.8) (drill 0.8) (layers *.Cu *.Mask))
      (pad "" np_thru_hole circle (at 0 -1.6 ${p.r}) (size 0.8 0.8) (drill 0.8) (layers *.Cu *.Mask))
      (pad 1 thru_hole oval (at -2.3 -11.3 ${p.r}) (size 1.6 2) (drill oval 0.9 1.3) (layers *.Cu *.Mask) ${p.sleeve})
      (pad 2 thru_hole oval (at 2.3 -10.2 ${p.r}) (size 1.6 2) (drill oval 0.9 1.3) (layers *.Cu *.Mask) ${p.tip})
      (pad 3 thru_hole oval (at 2.3 -6.2 ${p.r}) (size 1.6 2) (drill oval 0.9 1.3) (layers *.Cu *.Mask) ${p.ring1})
      (pad 4 thru_hole oval (at 2.3 -3.2 ${p.r}) (size 1.6 2) (drill oval 0.9 1.3) (layers *.Cu *.Mask) ${p.ring2})
    )
  `
}
