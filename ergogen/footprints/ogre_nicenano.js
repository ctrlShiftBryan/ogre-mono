// nice!nano (or any Pro Micro-footprint controller) on Mill-Max sockets, from
// the 2024 Ogre library (ogre.2024.pretty: ProMicro_v3). Same pad numbering and
// pinout as ogre_promicro; the controller sits on the front, face up, with the
// pads' mask open on the back only, and USB-C toward local -y.
//   pads 1-12:  TX0(D3) RX1(D2) GND GND D1 D0 D4 C6 D7 E6 B4 B5
//   pads 13-24: B6 B2 B3 B1 F7 F6 F5 F4 VCC RST GND RAW (B+ on a nice!nano)
// The Ogre 68 wires pads 7-12 to its six rows and pads 20 down to 13 to its
// eight columns (config.yaml, pcbs.left.footprints.mcu).
// Params
//    pad1..pad24: net on each pad ('' leaves it unconnected)
//    side: 'front' (as drawn) or 'back', the whole footprint mirrored onto the
//      back of the board, soldered from the front. Rotated a further 90°, a back
//      nice!nano puts every pad where ogre_promicro has it, 0.508 mm toward the USB.

const params = { designator: 'MCU', side: 'front' }   // not 'U': ergogen reads that as the 19.05 mm unit
for (let i = 1; i <= 24; i++) params[`pad${i}`] = { type: 'net', value: '' }

// pin labels on the front silkscreen, [text, x, y]
const labels = [
  ['D3/TX0', 4.155, -14.45], ['D2/RX1', 4.155, -11.9], ['GND', 4.955, -9.35], ['GND', 4.955, -6.9],
  ['SDA/D1/2', 3.455, -4.4], ['SCL/D0/3', 3.455, -1.9], ['D4/4', 4.705, 0.6], ['C6/5', 4.705, 3.15],
  ['D7/6', 4.705, 5.7], ['E6/7', 4.705, 8.25], ['B4/8', 4.705, 10.8], ['B5/9', 4.705, 13.3],
  ['10/B6', -4.395, 13.45], ['16/B2', -4.395, 10.95], ['14/B3', -4.395, 8.4], ['15/B1', -4.395, 5.85],
  ['A0/F7', -4.395, 3.3], ['A1/F6', -4.395, 0.75], ['A2/F5', -4.395, -1.75], ['A3/F4', -4.395, -4.25],
  ['VCC', -5.3355, -6.658], ['RST', -5.3355, -9.1345], ['GND', -5.22, -11.94], ['RAW', -5.3355, -14.278],
  ['USB-C', -0.05, -18.95]
]

// mirror onto the back: x negated, F./B. layers swapped, text read from behind
const flip = fp => fp
  .replace(/\((at|start|end) ([-\d.]+) /g, (_, k, x) => `(${k} ${-x} `)
  .replace(/\b([FB])\.(Cu|SilkS|Fab|Mask|CrtYd|Paste)\b/g, (_, s, l) => `${s === 'F' ? 'B' : 'F'}.${l}`)
  .replace(/\(thickness ([\d.]+)\)\)\)/g, '(thickness $1)) (justify mirror))')

module.exports = {
  params,
  body: p => {
    const r = p.r
    const pads = []
    for (let i = 1; i <= 24; i++) {
      const x = i <= 12 ? 7.6114 : -7.6086
      const y = i <= 12 ? -14.478 + 2.54 * (i - 1) : 13.462 - 2.54 * (i - 13)
      pads.push(`(pad ${i} thru_hole roundrect (at ${x} ${y.toFixed(3)} ${r}) (size 2 2) (drill 1.49) (layers *.Cu B.Mask) (roundrect_rratio 0.5) ${p['pad' + i]})`)
    }
    const text = labels.map(([t, x, y]) =>
      `(fp_text user "${t}" (at ${x} ${y} ${r}) (layer F.SilkS) (effects (font (size 0.75 0.67) (thickness 0.125))))`)
    const fp = `
    (module ogre:NiceNano_MillMax (layer F.Cu) (tedit 5DD4F656)
      AT
      (fp_text reference "${p.ref}" (at -0.1 -0.05 ${r - 90}) (layer F.SilkS) ${p.ref_hide} (effects (font (size 1 1) (thickness 0.15))))
      (fp_text value "nice!nano" (at 0.02 15.79 ${r}) (layer F.SilkS) (effects (font (size 1 1) (thickness 0.15))))
      ${text.join('\n      ')}

      (fp_line (start -8.75 -15.6) (end -8.75 -14.75) (layer F.SilkS) (width 0.15))
      (fp_line (start -8.75 -15.6) (end -7.9 -15.6) (layer F.SilkS) (width 0.15))
      (fp_line (start -8.75 13.7) (end -8.75 14.6) (layer F.SilkS) (width 0.15))
      (fp_line (start -8.75 14.6) (end -7.9 14.6) (layer F.SilkS) (width 0.15))
      (fp_line (start 8.75 -15.6) (end 7.95 -15.6) (layer F.SilkS) (width 0.15))
      (fp_line (start 8.75 -15.6) (end 8.75 -14.75) (layer F.SilkS) (width 0.15))
      (fp_line (start 8.75 13.75) (end 8.75 14.6) (layer F.SilkS) (width 0.15))
      (fp_line (start 8.75 14.6) (end 7.89 14.6) (layer F.SilkS) (width 0.15))

      (fp_line (start -3.75 -21.2) (end 3.75 -21.2) (layer F.SilkS) (width 0.15))
      (fp_line (start 3.75 -21.2) (end 3.75 -19.9) (layer F.SilkS) (width 0.15))
      (fp_line (start 3.75 -19.9) (end -3.75 -19.9) (layer F.SilkS) (width 0.15))
      (fp_line (start -3.75 -19.9) (end -3.75 -21.2) (layer F.SilkS) (width 0.15))
      (fp_line (start -0.5 -20.85) (end 0.5 -20.85) (layer F.SilkS) (width 0.15))
      (fp_line (start -0.35 -20.7) (end 0.35 -20.7) (layer F.SilkS) (width 0.15))
      (fp_line (start -0.25 -20.55) (end 0.25 -20.55) (layer F.SilkS) (width 0.15))
      (fp_line (start -0.15 -20.4) (end 0.15 -20.4) (layer F.SilkS) (width 0.15))
      (fp_line (start 0 -20.2) (end -0.5 -20.85) (layer F.SilkS) (width 0.15))
      (fp_line (start 0.5 -20.85) (end 0 -20.2) (layer F.SilkS) (width 0.15))

      (fp_line (start -8.9 -18.3) (end 8.9 -18.3) (layer F.Fab) (width 0.15))
      (fp_line (start 8.9 -18.3) (end 8.9 14.75) (layer F.Fab) (width 0.15))
      (fp_line (start 8.9 14.75) (end -8.9 14.75) (layer F.Fab) (width 0.15))
      (fp_line (start -8.9 14.75) (end -8.9 -18.3) (layer F.Fab) (width 0.15))
      (fp_line (start -3.75 -19.6) (end 3.75 -19.6) (layer F.Fab) (width 0.15))
      (fp_line (start 3.75 -19.6) (end 3.75 -18.3) (layer F.Fab) (width 0.15))
      (fp_line (start -3.75 -19.6) (end -3.75 -18.3) (layer F.Fab) (width 0.15))

      ${pads.join('\n      ')}
    )
    `
    return (p.side === 'back' ? flip(fp) : fp).replace('AT', p.at)
  }
}
