// The switch diode, from the 2024 Ogre library's hotswap footprint
// (CherryMX_Hotswap-diode), as a part of its own: SOD-123 on the back, or
// through-hole. It was drawn at (8.15, 0.63) in the switch footprint, at the
// key's right edge; anode toward local -y.
// Nets
//    from: anode, pad 2 (from the switch)
//    to: cathode, pad 1 (to the row)
// Params
//    place: 'x,y,r' from the key, in the key's frame (mm, y up) and degrees,
//      from its `diode` ('{{diode}}'); empty for the switch's right edge, where
//      the 2024 footprint had it built in. The footprint places itself from this,
//      so one entry serves every key and designators stay in key order.

const DEFAULT = [8.15, -0.63, 0]

module.exports = {
  params: {
    designator: 'D',
    from: undefined,
    to: undefined,
    place: ''
  },
  body: p => {
    const [dx, dy, dr] = p.place ? String(p.place).split(',').map(Number) : DEFAULT
    const a = p.r * Math.PI / 180
    const x = p.x + dx * Math.cos(a) - dy * Math.sin(a)
    const y = p.y - (dx * Math.sin(a) + dy * Math.cos(a))   // KiCad y points down
    const r = p.r + dr
    return `
    (module ogre:Socket_Diode (layer F.Cu) (tedit 5DD4F656)
      (at ${+x.toFixed(6)} ${+y.toFixed(6)} ${r})
      (fp_text reference "${p.ref}" (at 1.6 0 ${r + 90}) (layer B.SilkS) ${p.ref_hide} (effects (font (size 0.8 0.8) (thickness 0.12)) (justify mirror)))
      (fp_text value "" (at 0 0 ${r}) (layer B.Fab) hide (effects (font (size 0.8 0.8) (thickness 0.12)) (justify mirror)))

      (fp_line (start -0.75 -2.7) (end -0.75 2.7) (layer B.SilkS) (width 0.15))
      (fp_line (start -0.75 -2.7) (end 0.75 -2.7) (layer B.SilkS) (width 0.15))
      (fp_line (start -0.75 2.7) (end 0.75 2.7) (layer B.SilkS) (width 0.15))
      (fp_line (start 0.75 2.7) (end 0.75 -2.7) (layer B.SilkS) (width 0.15))
      (fp_line (start -0.5 -0.5) (end 0.5 -0.5) (layer B.SilkS) (width 0.15))
      (fp_line (start -0.5 0.5) (end 0.5 0.5) (layer B.SilkS) (width 0.15))
      (fp_line (start 0 0.4) (end -0.5 -0.5) (layer B.SilkS) (width 0.15))
      (fp_line (start 0.5 -0.5) (end 0 0.4) (layer B.SilkS) (width 0.15))

      (fp_line (start -1 -4.5) (end 1 -4.5) (layer B.CrtYd) (width 0.05))
      (fp_line (start 1 -4.5) (end 1 4.4) (layer B.CrtYd) (width 0.05))
      (fp_line (start 1 4.4) (end -1 4.4) (layer B.CrtYd) (width 0.05))
      (fp_line (start -1 4.4) (end -1 -4.5) (layer B.CrtYd) (width 0.05))

      (pad 2 thru_hole rect (at 0 -3.69 ${r}) (size 1.524 1.524) (drill 0.762) (layers *.Cu *.Mask) ${p.from})
      (pad 2 smd rect (at 0 -1.775 ${r + 270}) (size 1.4 1) (layers B.Cu B.Paste B.Mask) ${p.from})
      (pad 1 smd rect (at 0 1.775 ${r + 270}) (size 1.4 1) (layers B.Cu B.Paste B.Mask) ${p.to})
      (pad 1 thru_hole circle (at 0.02 3.56 ${r}) (size 1.4 1.4) (drill 0.7) (layers *.Cu *.Mask) ${p.to})
    )
    `
  }
}
