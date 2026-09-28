// Through-hole switch diode (1N4148, 7.62 mm pitch), as on the 2019 Ogre.
// Nets
//    from: anode, pad 2 (from the switch)
//    to: cathode, square pad 1 (to the row)

module.exports = {
  params: {
    designator: 'D',
    from: undefined,
    to: undefined
  },
  body: p => `
    (module ogre:Diode_THT (layer F.Cu) (tedit 5DD4F656)
      ${p.at}
      (fp_text reference "${p.ref}" (at 0 0 ${p.r}) (layer F.Fab) ${p.ref_hide} (effects (font (size 0.8 0.8) (thickness 0.12))))
      (fp_text value "" (at 0 0 ${p.r}) (layer F.Fab) hide (effects (font (size 0.8 0.8) (thickness 0.12))))

      (fp_line (start -2 -0.95) (end 2 -0.95) (layer F.SilkS) (width 0.12))
      (fp_line (start 2 -0.95) (end 2 0.95) (layer F.SilkS) (width 0.12))
      (fp_line (start 2 0.95) (end -2 0.95) (layer F.SilkS) (width 0.12))
      (fp_line (start -2 0.95) (end -2 -0.95) (layer F.SilkS) (width 0.12))
      (fp_line (start 1.4 -0.95) (end 1.4 0.95) (layer F.SilkS) (width 0.3))
      (fp_line (start -2 -0.95) (end 2 -0.95) (layer B.SilkS) (width 0.12))
      (fp_line (start 2 -0.95) (end 2 0.95) (layer B.SilkS) (width 0.12))
      (fp_line (start 2 0.95) (end -2 0.95) (layer B.SilkS) (width 0.12))
      (fp_line (start -2 0.95) (end -2 -0.95) (layer B.SilkS) (width 0.12))
      (fp_line (start 1.4 -0.95) (end 1.4 0.95) (layer B.SilkS) (width 0.3))

      (fp_line (start -4.7 -1) (end 4.7 -1) (layer F.CrtYd) (width 0.05))
      (fp_line (start 4.7 -1) (end 4.7 1) (layer F.CrtYd) (width 0.05))
      (fp_line (start 4.7 1) (end -4.7 1) (layer F.CrtYd) (width 0.05))
      (fp_line (start -4.7 1) (end -4.7 -1) (layer F.CrtYd) (width 0.05))

      (pad 1 thru_hole rect (at 3.81 0 ${p.r}) (size 1.651 1.651) (drill 0.9906) (layers *.Cu *.Mask) ${p.to})
      (pad 2 thru_hole circle (at -3.81 0 ${p.r}) (size 1.651 1.651) (drill 0.9906) (layers *.Cu *.Mask) ${p.from})
    )
  `
}
