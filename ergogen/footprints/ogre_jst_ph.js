// JST PH 3-pin horizontal battery connector (S3B-PH-K), from the 2024 Ogre
// library (ogre.2024.pretty). Reworked from KiCad's stock part: the middle pin
// is pad 1 and both outer pins are pad 2, so a 2-wire battery lead lands the
// same way plugged into either side.
// Nets
//    pad1: middle pin
//    pad2: both outer pins

module.exports = {
  params: {
    designator: 'J',
    pad1: undefined,
    pad2: undefined
  },
  body: p => {
    const r = p.r
    return `
    (module ogre:JST_PH_S3B-PH-K_Horizontal (layer F.Cu) (tedit 5DD4F656)
      ${p.at}
      (fp_text reference "${p.ref}" (at 2 -2.55 ${r + 180}) (layer F.SilkS) ${p.ref_hide} (effects (font (size 1 1) (thickness 0.15))))
      (fp_text value "BAT" (at 2 7.45 ${r + 180}) (layer F.Fab) (effects (font (size 1 1) (thickness 0.15))))

      (fp_line (start -2.06 -1.46) (end -2.06 6.36) (layer F.SilkS) (width 0.12))
      (fp_line (start -2.06 0.14) (end -1.14 0.14) (layer F.SilkS) (width 0.12))
      (fp_line (start -2.06 6.36) (end 6.06 6.36) (layer F.SilkS) (width 0.12))
      (fp_line (start -1.3 2.5) (end -1.3 4.1) (layer F.SilkS) (width 0.12))
      (fp_line (start -1.3 4.1) (end -0.3 4.1) (layer F.SilkS) (width 0.12))
      (fp_line (start -1.14 -1.46) (end -2.06 -1.46) (layer F.SilkS) (width 0.12))
      (fp_line (start -1.14 0.14) (end -1.14 -1.46) (layer F.SilkS) (width 0.12))
      (fp_line (start -0.86 0.14) (end -1.14 0.14) (layer F.SilkS) (width 0.12))
      (fp_line (start -0.86 0.14) (end -0.86 -1.075) (layer F.SilkS) (width 0.12))
      (fp_line (start -0.8 4.1) (end -0.8 6.36) (layer F.SilkS) (width 0.12))
      (fp_line (start -0.3 2.5) (end -1.3 2.5) (layer F.SilkS) (width 0.12))
      (fp_line (start -0.3 4.1) (end -0.3 2.5) (layer F.SilkS) (width 0.12))
      (fp_line (start -0.3 4.1) (end -0.3 6.36) (layer F.SilkS) (width 0.12))
      (fp_line (start 0.5 2) (end 3.5 2) (layer F.SilkS) (width 0.12))
      (fp_line (start 0.5 6.36) (end 0.5 2) (layer F.SilkS) (width 0.12))
      (fp_line (start 3.5 2) (end 3.5 6.36) (layer F.SilkS) (width 0.12))
      (fp_line (start 4.3 2.5) (end 5.3 2.5) (layer F.SilkS) (width 0.12))
      (fp_line (start 4.3 4.1) (end 4.3 2.5) (layer F.SilkS) (width 0.12))
      (fp_line (start 5.14 -1.46) (end 5.14 0.14) (layer F.SilkS) (width 0.12))
      (fp_line (start 5.14 0.14) (end 4.86 0.14) (layer F.SilkS) (width 0.12))
      (fp_line (start 5.3 2.5) (end 5.3 4.1) (layer F.SilkS) (width 0.12))
      (fp_line (start 5.3 4.1) (end 4.3 4.1) (layer F.SilkS) (width 0.12))
      (fp_line (start 6.06 -1.46) (end 5.14 -1.46) (layer F.SilkS) (width 0.12))
      (fp_line (start 6.06 0.14) (end 5.14 0.14) (layer F.SilkS) (width 0.12))
      (fp_line (start 6.06 6.36) (end 6.06 -1.46) (layer F.SilkS) (width 0.12))

      (fp_line (start -2.45 -1.85) (end -2.45 6.75) (layer F.CrtYd) (width 0.05))
      (fp_line (start -2.45 6.75) (end 6.45 6.75) (layer F.CrtYd) (width 0.05))
      (fp_line (start 6.45 -1.85) (end -2.45 -1.85) (layer F.CrtYd) (width 0.05))
      (fp_line (start 6.45 6.75) (end 6.45 -1.85) (layer F.CrtYd) (width 0.05))

      (fp_line (start -1.95 -1.35) (end -1.95 6.25) (layer F.Fab) (width 0.1))
      (fp_line (start -1.95 6.25) (end 5.95 6.25) (layer F.Fab) (width 0.1))
      (fp_line (start -1.25 -1.35) (end -1.95 -1.35) (layer F.Fab) (width 0.1))
      (fp_line (start -1.25 0.25) (end -1.25 -1.35) (layer F.Fab) (width 0.1))
      (fp_line (start -0.5 1.375) (end 0.5 1.375) (layer F.Fab) (width 0.1))
      (fp_line (start 0 0.875) (end -0.5 1.375) (layer F.Fab) (width 0.1))
      (fp_line (start 0.5 1.375) (end 0 0.875) (layer F.Fab) (width 0.1))
      (fp_line (start 5.25 -1.35) (end 5.25 0.25) (layer F.Fab) (width 0.1))
      (fp_line (start 5.25 0.25) (end -1.25 0.25) (layer F.Fab) (width 0.1))
      (fp_line (start 5.95 -1.35) (end 5.25 -1.35) (layer F.Fab) (width 0.1))
      (fp_line (start 5.95 6.25) (end 5.95 -1.35) (layer F.Fab) (width 0.1))

      (pad 1 thru_hole roundrect (at 2 0 ${r}) (size 1.2 1.75) (drill 0.75) (layers *.Cu *.Mask) (roundrect_rratio 0.2083333333) ${p.pad1})
      (pad 2 thru_hole oval (at 0 0 ${r}) (size 1.2 1.75) (drill 0.75) (layers *.Cu *.Mask) ${p.pad2})
      (pad 2 thru_hole oval (at 4 0 ${r}) (size 1.2 1.75) (drill 0.75) (layers *.Cu *.Mask) ${p.pad2})
    )
    `
  }
}
