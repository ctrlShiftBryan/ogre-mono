// MX switch: its holes, keycap outline and legend, from the 2024 Ogre library
// (ogre.2024.pretty: CherryMX_Hotswap-diode). The copper is elsewhere: the
// hotswap socket is ogre_socket and the diode ogre_socket_diode, each a part of
// its own on the back, placed from the same key. No nets here.
// Params
//    legend: printed on both silkscreens (key's `legend` via '{{legend}}'): under the
//      switch on the front, in the strip past the socket on the back, clear of the
//      parts in the strips between socket rows
//    stab: add Cherry/Costar PCB-mount stabilizer holes (2U and up; key's `stab` via '{{stab}}')
//    turn: degrees the switch turns on its key (key's `turn` via '{{turn}}'), so one
//      footprint entry serves every key and designators stay in key order
//    cap_w, cap_h: keycap size in mm, drawn on Dwgs.User

const esc = s => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')

module.exports = {
  params: {
    designator: 'MX',
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
      (fp_text user "${esc(p.legend)}" (at 0 -8.2 ${r}) (layer B.SilkS) (effects (font (size 1 1) (thickness 0.15)) (justify mirror)))` : ''
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

    )
    `
  }
}
