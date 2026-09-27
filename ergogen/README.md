# Ogre Ergo redesign (68 keys) in ergogen

`ogre-ergo.yaml` is a 68-key redesign of the Ogre Ergo, written by hand for
[ergogen](https://ergogen.xyz) as the starting point for a new PCB. Paste it
into ergogen.xyz or build it locally (needs ergogen 4.1+).

It starts from the as-built 70-key board: the switch positions of the PCB in
`ctrlShiftBryan/ogre-v1` (`ogre-v1.kicad_pcb`), which match the KLE design
(`../layout/ogre-ergo.kle.json`) except for the thumbs, which sit about 1 mm
off the KLE.

## Changes from the as-built board (70 → 68 keys)

- **Row-4 outer keys (Shift position)** are 1.25U instead of 2.25U, still
  right-aligned to the pinky column (`matrix_outer_bottom`).
- **Bottom-row outer keys removed.** The 1.25U + 1U keys at the outer end of
  the bottom row are gone on both halves (`matrix_outer_mod`,
  `matrix_pinky_mod`).
- **Far thumb keys** are 1.25U instead of 1.5U, bottom-aligned with the 2.25U
  thumb key, with a new 1U key above each (`thumb_far_upper`), turned 90° to
  match the other thumb caps.
- **Halves 0.75U (14.29 mm) further apart.** The mirror distance went from 3U
  to 3.75U so the new 1U keys keep the original 12.1 mm gap between halves.
  Every right-half key moves out by that amount.
- **Legends** on every key (see below).

## Legends

Each key has a `legend`: what's printed on a standard keycap set, not the
firmware keymap. `mirror.legend` is the legend of the matching key on the
right half, since ergogen builds the right half by mirroring the left.

Two-part legends are written shifted character first, then base, separated by
a space: `'! 1'` is the key with `!` over `1`. Anything else (`Esc`,
`Caps Lock`, `←`) is a single legend.

## Commands

```sh
npm install
npm run build    # write output/ and refresh ogre-ergo.demo.svg (key outlines)
npm run keycaps  # build, then render ogre-ergo.keycaps.svg with legends
npm run verify   # compare to the as-built PCB
```

`npm run keycaps` runs `render_keycaps.py`, which needs Python 3 and PyYAML
(`pip install pyyaml`). It reads the `output/points/points.yaml` that ergogen
writes in debug mode and draws each key as a keycap with its legend: alphas
in cream, modifiers and arrows in grey, Esc and Enter in red.

`npm run verify` checks every key the redesign keeps against the 70-key PCB
(within 0.01 mm, KiCad's rounding), with the right half offset by the
14.29 mm shift. It lists the intended changes as expected differences: the
four removed keys, the two row-4 outer keys, the two resized far thumb keys, the two
new 1U keys, and the right-half shift. Anything else that moves fails.

## Open question before PCB footprints

The 2.25U and 1.25U thumb keys are written as tall keys (`height`); only the
new 1U keys use `adjust.rotate: 90`. Before generating PCB footprints, the
tall keys should probably become wide keys with `adjust.rotate: 90` so the
switch and stabilizer footprints face the right way.
