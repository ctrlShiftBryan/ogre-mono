// MX switch on a Kailh hotswap socket, from the 2024 Ogre library
// (ogre.2024.pretty: CherryMX_Hotswap-diode, without its built-in diode; that
// diode is ogre_socket_diode, a part of its own). The socket pads also carry
// plated slots, so a switch can be soldered in without one.
// Nets
//    from: socket pad 1 (column)
//    to: socket pad 2, to the diode's anode (defaults to the key's name)
// Params
//    legend: printed on both silkscreens (key's `legend` via '{{legend}}')
//    stab: add Cherry/Costar PCB-mount stabilizer holes (2U and up; key's `stab` via '{{stab}}')
//    turn: degrees the switch turns on its key (key's `turn` via '{{turn}}'), so one
//      footprint entry serves every key and designators stay in key order
//    cap_w, cap_h: keycap size in mm, drawn on Dwgs.User

const esc = s => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')

module.exports = {
  params: {
    designator: 'MX',
    from: undefined,
    to: { type: 'net', value: '{{name}}' },
    legend: '',
    stab: false,
    cap_w: 18.05,
    cap_h: 18.05,
    turn: ''
  },
  body: p => {
    const r = p.r + Number(p.turn || 0)
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
    (module ogre:CherryMX_Hotswap (layer F.Cu) (tedit 5DD4F656)
      (at ${p.x} ${p.y} ${r})
      (fp_text reference "${p.ref}" (at 7.1 8.2 ${r}) (layer F.SilkS) ${p.ref_hide} (effects (font (size 1 1) (thickness 0.15))))
      (fp_text value "" (at -4.8 8.3 ${r}) (layer F.Fab) hide (effects (font (size 1 1) (thickness 0.15))))
      ${legend}

      (fp_line (start -5.9 -4.7) (end -5.9 -3.95) (layer B.SilkS) (width 0.15))
      (fp_line (start -5.9 -3.95) (end -5.7 -3.95) (layer B.SilkS) (width 0.15))
      (fp_line (start -5.8 -4.05) (end -5.8 -4.7) (layer B.SilkS) (width 0.3))
      (fp_line (start -5.65 -5.55) (end -5.65 -1.1) (layer B.SilkS) (width 0.15))
      (fp_line (start -5.65 -1.1) (end -2.62 -1.1) (layer B.SilkS) (width 0.15))
      (fp_line (start -5.45 -1.3) (end -3 -1.3) (layer B.SilkS) (width 0.5))
      (fp_line (start -5.3 -1.6) (end -5.3 -3.4) (layer B.SilkS) (width 0.8))
      (fp_line (start -4.17 -5.1) (end -4.17 -2.86) (layer B.SilkS) (width 3))
      (fp_line (start -0.4 -3) (end 4.4 -3) (layer B.SilkS) (width 0.15))
      (fp_line (start 2.6 -4.8) (end -4.1 -4.8) (layer B.SilkS) (width 3.5))
      (fp_line (start 3.9 -6) (end 3.9 -3.5) (layer B.SilkS) (width 1))
      (fp_line (start 4.2 -3.25) (end 2.9 -3.3) (layer B.SilkS) (width 0.5))
      (fp_line (start 4.25 -6.4) (end 3 -6.4) (layer B.SilkS) (width 0.4))
      (fp_line (start 4.38 -4) (end 4.38 -6.25) (layer B.SilkS) (width 0.15))
      (fp_line (start 4.4 -6.6) (end -3.8 -6.6) (layer B.SilkS) (width 0.15))
      (fp_line (start 4.4 -3) (end 4.4 -6.6) (layer B.SilkS) (width 0.15))
      (fp_arc (start -5.9 -4.7) (mid -5.243504 -6.084924) (end -3.8 -6.6) (layer B.SilkS) (width 0.15))
      (fp_arc (start -3.016318 -1.521471) (mid -2.268709 -2.886118) (end -0.8 -3.4) (layer B.SilkS) (width 1))
      (fp_arc (start -2.616318 -1.121471) (mid -1.868709 -2.486118) (end -0.4 -3) (layer B.SilkS) (width 0.15))

      (fp_line (start ${-w} ${-h}) (end ${w} ${-h}) (layer Dwgs.User) (width 0.15))
      (fp_line (start ${w} ${-h}) (end ${w} ${h}) (layer Dwgs.User) (width 0.15))
      (fp_line (start ${w} ${h}) (end ${-w} ${h}) (layer Dwgs.User) (width 0.15))
      (fp_line (start ${-w} ${h}) (end ${-w} ${-h}) (layer Dwgs.User) (width 0.15))
      (fp_line (start -7 -7) (end -6 -7) (layer Dwgs.User) (width 0.15))
      (fp_line (start -7 -6) (end -7 -7) (layer Dwgs.User) (width 0.15))
      (fp_line (start -7 6) (end -7 7) (layer Dwgs.User) (width 0.15))
      (fp_line (start -7 7) (end -6 7) (layer Dwgs.User) (width 0.15))
      (fp_line (start 6 7) (end 7 7) (layer Dwgs.User) (width 0.15))
      (fp_line (start 7 -7) (end 6 -7) (layer Dwgs.User) (width 0.15))
      (fp_line (start 7 -7) (end 7 -6) (layer Dwgs.User) (width 0.15))
      (fp_line (start 7 7) (end 7 6) (layer Dwgs.User) (width 0.15))

      (pad "" np_thru_hole circle (at 0 0 ${r + 90}) (size 4.1 4.1) (drill 4.1) (layers *.Cu *.Mask))
      (pad "" np_thru_hole circle (at -5.08 0 ${r}) (size 1.9 1.9) (drill 1.9) (layers *.Cu *.Mask))
      (pad "" np_thru_hole circle (at 5.08 0 ${r}) (size 1.9 1.9) (drill 1.9) (layers *.Cu *.Mask))
      (pad "" np_thru_hole circle (at -3.81 -2.54 ${r}) (size 3 3) (drill 3) (layers *.Cu *.Mask))
      (pad "" np_thru_hole circle (at 2.54 -5.08 ${r}) (size 3 3) (drill 3) (layers *.Cu *.Mask))
      ${stab}

      (pad 1 smd rect (at -7.085 -2.54 ${r + 180}) (size 2.55 2.5) (layers B.Cu B.Paste B.Mask) ${p.from})
      (pad 1 thru_hole oval (at -7.59 -2.53 ${r}) (size 1.524 2.5) (drill oval 0.762 1.8) (layers *.Cu *.Mask) ${p.from})
      (pad 2 smd rect (at 5.842 -5.08 ${r + 180}) (size 2.55 2.5) (layers B.Cu B.Paste B.Mask) ${p.to})
      (pad 2 thru_hole oval (at 6.33 -5.08 ${r}) (size 1.524 2.5) (drill oval 0.762 1.8) (layers *.Cu *.Mask) ${p.to})
    )
    `
  }
}
