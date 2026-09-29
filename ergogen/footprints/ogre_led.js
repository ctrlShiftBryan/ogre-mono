// A 3 mm through-hole LED, soldered by hand after assembly (KiCad's LED_D3.0mm:
// 2.54 mm pitch, 0.9 mm drills), on the front so it shines up through a hole in
// the case. Pad 1 is the cathode (the flat side of the dome), at the origin;
// the anode is at local +x. No LCSC number: it's not on the assembly BOM.
// Nets
//    anode: pad 2
//    cathode: pad 1
// Params
//    value: what it's for, on the fab layer ('STATUS', 'CHARGE')
//    color: noted on the fab layer next to it

const esc = s => String(s).replace(/"/g, '\\"')

module.exports = {
  params: { designator: 'LED', anode: undefined, cathode: undefined, value: 'LED', color: '' },
  body: p => {
    const r = p.r
    const color = p.color ? `\n      (fp_text user "${esc(p.color)}" (at 1.27 -2.7 ${r}) (layer F.Fab) (effects (font (size 0.8 0.8) (thickness 0.12))))` : ''
    return `
    (module ogre:LED_3mm (layer F.Cu) (tedit 5DD4F656)
      (at ${p.x} ${p.y} ${r})
      (attr through_hole)
      (fp_text reference "${p.ref}" (at 1.27 2.7 ${r}) (layer F.SilkS) ${p.ref_hide} (effects (font (size 0.8 0.8) (thickness 0.12))))
      (fp_text value "${esc(p.value)}" (at 1.27 0 ${r}) (layer F.Fab) (effects (font (size 0.8 0.8) (thickness 0.12))))${color}

      (fp_circle (center 1.27 0) (end 2.77 0) (layer F.Fab) (width 0.1))
      (fp_line (start -0.23 -1.4) (end -0.23 1.4) (layer F.Fab) (width 0.1))
      (fp_arc (start 0.47 -1.386) (mid 1.27 -1.6) (end 2.07 -1.386) (layer F.SilkS) (width 0.12))
      (fp_arc (start 2.07 1.386) (mid 1.27 1.6) (end 0.47 1.386) (layer F.SilkS) (width 0.12))
      (fp_line (start -1.15 -1.2) (end -1.15 1.2) (layer F.SilkS) (width 0.12))

      (fp_line (start -1.15 -2) (end 3.7 -2) (layer F.CrtYd) (width 0.05))
      (fp_line (start 3.7 -2) (end 3.7 2) (layer F.CrtYd) (width 0.05))
      (fp_line (start 3.7 2) (end -1.15 2) (layer F.CrtYd) (width 0.05))
      (fp_line (start -1.15 2) (end -1.15 -2) (layer F.CrtYd) (width 0.05))

      (pad 1 thru_hole rect (at 0 0 ${r}) (size 1.8 1.8) (drill 0.9) (layers *.Cu *.Mask) ${p.cathode})
      (pad 2 thru_hole circle (at 2.54 0 ${r}) (size 1.8 1.8) (drill 0.9) (layers *.Cu *.Mask) ${p.anode})
    )
    `
  }
}
