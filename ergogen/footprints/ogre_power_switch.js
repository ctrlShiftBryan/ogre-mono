// SPDT side-actuated slide switch for power, Shouhan MSK-12C02 (LCSC C431540;
// pin-compatible with the Alps SSSS811101 the community wireless Corne uses),
// KiCad's stock footprint (Button_Switch_SMD: SW_SPDT_Shouhan_MSK12C02), with
// the LCSC number on it for the JLCPCB BOM. The lever sticks out
// toward local +y, so the body's +y edge (y = 1.4) goes on the board edge.
// Pad 2 is the common; sliding the lever toward pad 1 joins 2-1 (on), toward
// pad 3 joins 2-3 (off, pad 3 left open). The silkscreen marks the ON end.
// Nets
//    common: pad 2 (the battery's +)
//    on: pad 1 (the controller's B+)
//    off: pad 3 (usually unconnected)
// Params
//    side: 'front' (as drawn) or 'back', mirrored onto the back of the board

const flip = fp => fp
  .replace(/\((at|start|end) ([-\d.]+) /g, (_, k, x) => `(${k} ${-x} `)
  .replace(/\b([FB])\.(Cu|SilkS|Fab|Mask|CrtYd|Paste)\b/g, (_, s, l) => `${s === 'F' ? 'B' : 'F'}.${l}`)
  .replace(/\(thickness ([\d.]+)\)\)\)/g, '(thickness $1)) (justify mirror))')

module.exports = {
  params: {
    designator: 'SW',
    common: undefined,
    on: undefined,
    off: { type: 'net', value: '' },
    side: 'front'
  },
  body: p => {
    const r = p.r
    const fp = `
    (module ogre:SW_SPDT_MSK12C02 (layer F.Cu) (tedit 5DD4F656)
      AT
      (attr smd)
      (property "LCSC Part" "C431540")
      (fp_text reference "${p.ref}" (at 0 -3.7 ${r}) (layer F.SilkS) ${p.ref_hide} (effects (font (size 1 1) (thickness 0.15))))
      (fp_text value "POWER" (at 0 3.7 ${r}) (layer F.Fab) (effects (font (size 1 1) (thickness 0.15))))
      (fp_text user "ON" (at -5.6 0.3 ${r}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))

      (fp_line (start -3.45 -0.4) (end -3.45 0.4) (layer F.SilkS) (width 0.12))
      (fp_line (start -1.6 -1.5) (end 0.1 -1.5) (layer F.SilkS) (width 0.12))
      (fp_line (start 1.4 -1.5) (end 1.6 -1.5) (layer F.SilkS) (width 0.12))
      (fp_line (start 3.45 -0.4) (end 3.45 0.4) (layer F.SilkS) (width 0.12))

      (fp_line (start -4.45 -1.7) (end -4.45 1.7) (layer F.CrtYd) (width 0.05))
      (fp_line (start -4.45 -1.7) (end -2.8 -1.7) (layer F.CrtYd) (width 0.05))
      (fp_line (start -4.45 1.7) (end -1.7 1.7) (layer F.CrtYd) (width 0.05))
      (fp_line (start -2.8 -2.85) (end 2.8 -2.85) (layer F.CrtYd) (width 0.05))
      (fp_line (start -2.8 -1.7) (end -2.8 -2.85) (layer F.CrtYd) (width 0.05))
      (fp_line (start -1.7 1.7) (end -1.7 3.1) (layer F.CrtYd) (width 0.05))
      (fp_line (start 1.7 1.7) (end 4.45 1.7) (layer F.CrtYd) (width 0.05))
      (fp_line (start 1.7 3.1) (end -1.7 3.1) (layer F.CrtYd) (width 0.05))
      (fp_line (start 1.7 3.1) (end 1.7 1.7) (layer F.CrtYd) (width 0.05))
      (fp_line (start 2.8 -1.7) (end 2.8 -2.85) (layer F.CrtYd) (width 0.05))
      (fp_line (start 4.45 -1.7) (end 2.8 -1.7) (layer F.CrtYd) (width 0.05))
      (fp_line (start 4.45 1.7) (end 4.45 -1.7) (layer F.CrtYd) (width 0.05))

      (fp_line (start 0.15 1.4) (end 0.15 2.85) (layer F.Fab) (width 0.1))
      (fp_line (start 0.15 2.85) (end 1.45 2.85) (layer F.Fab) (width 0.1))
      (fp_line (start 1.45 1.4) (end 1.45 2.85) (layer F.Fab) (width 0.1))
      (fp_line (start -3.35 -1.4) (end 3.35 -1.4) (layer F.Fab) (width 0.1))
      (fp_line (start 3.35 -1.4) (end 3.35 1.4) (layer F.Fab) (width 0.1))
      (fp_line (start 3.35 1.4) (end -3.35 1.4) (layer F.Fab) (width 0.1))
      (fp_line (start -3.35 1.4) (end -3.35 -1.4) (layer F.Fab) (width 0.1))

      (pad "" np_thru_hole circle (at -1.5 0 ${r}) (size 0.85 0.85) (drill 0.85) (layers *.Mask))
      (pad "" np_thru_hole circle (at 1.5 0 ${r}) (size 0.85 0.85) (drill 0.85) (layers *.Mask))
      (pad 1 smd roundrect (at -2.25 -1.95 ${r}) (size 0.6 1.3) (layers F.Cu F.Mask F.Paste) (roundrect_rratio 0.25) ${p.on})
      (pad 2 smd roundrect (at 0.75 -1.95 ${r}) (size 0.6 1.3) (layers F.Cu F.Mask F.Paste) (roundrect_rratio 0.25) ${p.common})
      (pad 3 smd roundrect (at 2.25 -1.95 ${r}) (size 0.6 1.3) (layers F.Cu F.Mask F.Paste) (roundrect_rratio 0.25) ${p.off})
      (pad "" smd roundrect (at -3.675 -1.1 ${r}) (size 1.05 0.7) (layers F.Cu F.Mask F.Paste) (roundrect_rratio 0.25))
      (pad "" smd roundrect (at -3.675 1.1 ${r}) (size 1.05 0.7) (layers F.Cu F.Mask F.Paste) (roundrect_rratio 0.25))
      (pad "" smd roundrect (at 3.675 -1.1 ${r}) (size 1.05 0.7) (layers F.Cu F.Mask F.Paste) (roundrect_rratio 0.25))
      (pad "" smd roundrect (at 3.675 1.1 ${r}) (size 1.05 0.7) (layers F.Cu F.Mask F.Paste) (roundrect_rratio 0.25))
    )
    `
    return (p.side === 'back' ? flip(fp) : fp).replace('AT', p.at)
  }
}
