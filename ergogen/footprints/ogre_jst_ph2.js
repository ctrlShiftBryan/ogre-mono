// JST PH 2-pin side-entry through-hole battery connector (S2B-PH-K), KiCad's
// stock footprint (Connector_JST: JST_PH_S2B-PH-K_1x02_P2.00mm_Horizontal). The
// plug enters from local +y. JST sets no polarity, and batteries differ, so
// `plus` says which pad takes the battery's + lead; the silkscreen marks it.
// Nets
//    pos: battery + (the nice!nano's B+, through the power switch)
//    neg: battery - (GND)
// Params
//    plus: 1 or 2, the pad for pos
//    side: 'front' (as drawn) or 'back', mirrored onto the back of the board

const flip = fp => fp
  .replace(/\((at|start|end) ([-\d.]+) /g, (_, k, x) => `(${k} ${-x} `)
  .replace(/\b([FB])\.(Cu|SilkS|Fab|Mask|CrtYd|Paste)\b/g, (_, s, l) => `${s === 'F' ? 'B' : 'F'}.${l}`)
  .replace(/\(thickness ([\d.]+)\)\)\)/g, '(thickness $1)) (justify mirror))')

module.exports = {
  params: {
    designator: 'J',
    pos: undefined,
    neg: undefined,
    plus: 1,
    side: 'front'
  },
  body: p => {
    const r = p.r
    const [net1, net2] = p.plus === 2 ? [p.neg, p.pos] : [p.pos, p.neg]
    const plus_x = p.plus === 2 ? 2 : 0
    const fp = `
    (module ogre:JST_PH_S2B-PH-K (layer F.Cu) (tedit 5DD4F656)
      AT
      (fp_text reference "${p.ref}" (at 1 -2.55 ${r}) (layer F.SilkS) ${p.ref_hide} (effects (font (size 1 1) (thickness 0.15))))
      (fp_text value "BAT" (at 1 7.45 ${r}) (layer F.Fab) (effects (font (size 1 1) (thickness 0.15))))
      (fp_text user "+" (at ${plus_x} -2.55 ${r}) (layer F.SilkS) (effects (font (size 1.2 1.2) (thickness 0.2))))

      (fp_line (start -2.06 -1.46) (end -2.06 6.36) (layer F.SilkS) (width 0.12))
      (fp_line (start -2.06 0.14) (end -1.14 0.14) (layer F.SilkS) (width 0.12))
      (fp_line (start -2.06 6.36) (end 4.06 6.36) (layer F.SilkS) (width 0.12))
      (fp_line (start -1.14 -1.46) (end -2.06 -1.46) (layer F.SilkS) (width 0.12))
      (fp_line (start -1.14 0.14) (end -1.14 -1.46) (layer F.SilkS) (width 0.12))
      (fp_line (start -0.86 0.14) (end -1.14 0.14) (layer F.SilkS) (width 0.12))
      (fp_line (start -0.86 0.14) (end -0.86 -1.075) (layer F.SilkS) (width 0.12))
      (fp_line (start -0.8 4.1) (end -0.8 6.36) (layer F.SilkS) (width 0.12))
      (fp_line (start -0.3 4.1) (end -0.3 6.36) (layer F.SilkS) (width 0.12))
      (fp_line (start 0.5 2) (end 1.5 2) (layer F.SilkS) (width 0.12))
      (fp_line (start 0.5 6.36) (end 0.5 2) (layer F.SilkS) (width 0.12))
      (fp_line (start 1.5 2) (end 1.5 6.36) (layer F.SilkS) (width 0.12))
      (fp_line (start 3.14 -1.46) (end 3.14 0.14) (layer F.SilkS) (width 0.12))
      (fp_line (start 3.14 0.14) (end 2.86 0.14) (layer F.SilkS) (width 0.12))
      (fp_line (start 4.06 -1.46) (end 3.14 -1.46) (layer F.SilkS) (width 0.12))
      (fp_line (start 4.06 0.14) (end 3.14 0.14) (layer F.SilkS) (width 0.12))
      (fp_line (start 4.06 6.36) (end 4.06 -1.46) (layer F.SilkS) (width 0.12))
      (fp_line (start -1.3 2.5) (end -0.3 2.5) (layer F.SilkS) (width 0.12))
      (fp_line (start -0.3 2.5) (end -0.3 4.1) (layer F.SilkS) (width 0.12))
      (fp_line (start -0.3 4.1) (end -1.3 4.1) (layer F.SilkS) (width 0.12))
      (fp_line (start -1.3 4.1) (end -1.3 2.5) (layer F.SilkS) (width 0.12))
      (fp_line (start 2.3 2.5) (end 3.3 2.5) (layer F.SilkS) (width 0.12))
      (fp_line (start 3.3 2.5) (end 3.3 4.1) (layer F.SilkS) (width 0.12))
      (fp_line (start 3.3 4.1) (end 2.3 4.1) (layer F.SilkS) (width 0.12))
      (fp_line (start 2.3 4.1) (end 2.3 2.5) (layer F.SilkS) (width 0.12))

      (fp_line (start -2.45 -1.85) (end 4.45 -1.85) (layer F.CrtYd) (width 0.05))
      (fp_line (start 4.45 -1.85) (end 4.45 6.75) (layer F.CrtYd) (width 0.05))
      (fp_line (start 4.45 6.75) (end -2.45 6.75) (layer F.CrtYd) (width 0.05))
      (fp_line (start -2.45 6.75) (end -2.45 -1.85) (layer F.CrtYd) (width 0.05))

      (fp_line (start -1.95 -1.35) (end -1.95 6.25) (layer F.Fab) (width 0.1))
      (fp_line (start -1.95 6.25) (end 3.95 6.25) (layer F.Fab) (width 0.1))
      (fp_line (start -1.25 -1.35) (end -1.95 -1.35) (layer F.Fab) (width 0.1))
      (fp_line (start -1.25 0.25) (end -1.25 -1.35) (layer F.Fab) (width 0.1))
      (fp_line (start -0.5 1.375) (end 0.5 1.375) (layer F.Fab) (width 0.1))
      (fp_line (start 0 0.875) (end -0.5 1.375) (layer F.Fab) (width 0.1))
      (fp_line (start 0.5 1.375) (end 0 0.875) (layer F.Fab) (width 0.1))
      (fp_line (start 3.25 -1.35) (end 3.25 0.25) (layer F.Fab) (width 0.1))
      (fp_line (start 3.25 0.25) (end -1.25 0.25) (layer F.Fab) (width 0.1))
      (fp_line (start 3.95 -1.35) (end 3.25 -1.35) (layer F.Fab) (width 0.1))
      (fp_line (start 3.95 6.25) (end 3.95 -1.35) (layer F.Fab) (width 0.1))

      (pad 1 thru_hole roundrect (at 0 0 ${r}) (size 1.2 1.75) (drill 0.75) (layers *.Cu *.Mask) (roundrect_rratio 0.208333) ${net1})
      (pad 2 thru_hole oval (at 2 0 ${r}) (size 1.2 1.75) (drill 0.75) (layers *.Cu *.Mask) ${net2})
    )
    `
    return (p.side === 'back' ? flip(fp) : fp).replace('AT', p.at)
  }
}
