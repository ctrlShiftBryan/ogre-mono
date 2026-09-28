# Ogre Ergo redesign (68 keys) in ergogen

`config.yaml` is a 68-key redesign of the Ogre Ergo, written by hand for
[ergogen](https://ergogen.xyz): key layout, board outline and an unrouted
KiCad PCB. It needs ergogen 4.1+ and the custom footprints in `footprints/`.
On ergogen.xyz (or a local clone of `ergogen/ergogen-gui`), load it from GitHub
with the repo URL (it finds `ergogen/config.yaml` and `ergogen/footprints/`
itself); pasting the YAML alone won't work, because the footprints wouldn't
load. That web UI reads the pushed repo, not the working tree, and its local
file picker is a one-shot upload that brings no footprints; for local work
use `npm run serve` below.

It starts from the as-built 70-key board: the switch positions of the PCB in
`ctrlShiftBryan/ogre-v1` (`ogre-v1.kicad_pcb`, branch `sent-to-allpcb`), which
match the KLE design (`../layout/ogre-ergo.kle.json`) except for the thumbs,
which sit about 1 mm off the KLE.

| File | What it is |
|---|---|
| `config.yaml` | Layout, outline and PCB |
| `footprints/` | Switch, diode, Pro Micro, reset switch and TRRS jack, copied from the as-built board's footprints |
| `serve.js` | Live viewer: watches the config, rebuilds and shows every view |
| `bundle.js` | Packs the config and footprints into an archive the web UI can open |
| `points.snapshot.json` | Baseline geometry for `npm run snapshot` |
| `ogre-ergo.keycaps.svg` | Key preview, the one committed render |

## Changes from the as-built board (70 → 68 keys)

- **Row-4 outer keys (Shift position)** are 1.25U instead of 2.25U, still
  right-aligned to the pinky column (`matrix_outer_bottom`).
- **Bottom-row outer keys removed.** The 1.25U + 1U keys at the outer end of
  the bottom row are gone on both halves (`matrix_outer_mod`,
  `matrix_pinky_mod`).
- **Far thumb keys** are 1.25U instead of 1.5U, with a new 1U key above each
  (`thumb_far_upper`).
- **Outer columns 0.25U lower.** The far and outer columns (Esc, `+ =`, Tab,
  Caps Lock, Ctrl) sit 0.25U below the pinky column, the same step as 1 → 2.
- **Innermost column 0.25U lower.** `~ \``, `} ]`, PgDn sit 0.25U below the
  T/G/B column.
- **Thumb cluster staggered.** Cmd/Fn stay put; the Shift/Alt/Home block is
  0.25U up from Cmd (`home` stagger 0.625U → 0.875U), and the Alt/Home column
  another 0.25U up from Shift (`far` stagger −0.5U → −0.25U).
- **Halves 1.25U (23.81 mm) further apart.** The mirror distance went from 3U
  to 4.25U so the staggered thumb keys keep the original 12.1 mm gap between
  halves. Every right-half key moves out by that amount.
- **Thumb keys are wide keys turned 90°** (`width` + `adjust.rotate: 90`)
  rather than tall keys, so switch and stabilizer footprints face the right
  way. Positions and outlines are unchanged.
- **Legends** on every key (see below).

## Legends

Each key has a `legend`: what's printed on a standard keycap set, not the
firmware keymap. `mirror.legend` is the legend of the matching key on the
right half, since ergogen builds the right half by mirroring the left. The PCB
prints each legend on both silkscreens, under its switch (readable from the
back once the switches are in).

Two-part legends are written shifted character first, then base, separated by
a space: `'! 1'` is the key with `!` over `1`. Anything else (`Esc`,
`Caps Lock`, `←`) is a single legend.

## The PCB

One board that builds either as a single keyboard or, snapped along two break
lines, as a split with a spare center piece. That is the as-built Ogre's
design, kept as is:

- **One 10×7 matrix, one diode per key** (through-hole 1N4148, COL2ROW).
  Rows 0–4 are the left half, rows 5–9 the right; columns 0–6 run across both,
  numbered from the outer edge inward on each half. Every key keeps its
  as-built row and column; the new Home/End keys take row4/col1 and
  row9/col1, freed by the removed bottom-row keys. row4/col0 and row9/col0 stay
  unused.
- **Three Pro Micro footprints on the same nets.** Solder MCU3 alone for the
  single board, or MCU1 + MCU2 for the split. Pads are the as-built board's
  (MCU1/2/3 were U1/U2/U0):
  - MCU3 (center): pads 1, 2, 5–12 = row0–row9; pads 20→14 = col0–col6; 22 = RESET0.
  - MCU1 (left): pads 8–12 = row0–row4; 20→14 = col0–col6; 1/2 = SCL1/SDA1; 22 = RESET1.
  - MCU2 (right): pads 8–12 = row5–row9; same columns; 1/2 = SCL2/SDA2; 22 = RESET2.
  - The SCL/SDA names are historical: pads 1/2 are D3/D2, which QMK used for
    split serial.
- **Break lines** beside each half's innermost column: a cut down from the
  top edge (jogging around the TRRS jack), three 1.7 × 8 mm slots and a
  bottom notch, leaving four ~2 mm bridges. Every row and column net, plus VCC
  and GND, has to cross at those bridges. Sizes and spacing are the as-built
  board's, measured from the innermost column.
- **Center piece:** MCU3 with its USB at the top edge, and reset switch SW3.
- **Each half:** its Pro Micro under the middle column (USB at the top edge),
  a 6 mm reset switch on the back between Tab and Q, and a PJ-320A TRRS jack
  in a tab at the top of its inner edge, wired only to its own Pro Micro.
- **Outline:** keycap edges with 1 mm corners, plus convex webs that join the
  thumb cluster to the matrix. Nothing from the halves enters the center zone
  above the thumbs, leaving a 2 mm gap under the center piece.
- **Not carried over:** underglow LEDs (and `RGB`/`RGB2`), alternate-size
  switch footprints, the old Edge.Cuts art, and mounting holes (see below).

Diodes sit 8 mm below their switch, as on the as-built board, except two
spots that don't have room: the Esc/Del diode stands in the gap beside its
key, and the 3/8 key's diode (it sits over a Pro Micro) moves down below the
E/I key's diode.

Routing is left for KiCad. The PCB is build output, not a committed file:
`npm run build` writes it to `output/pcbs/ogre.kicad_pcb` and overwrites it
every time, so route in a copy.

## Commands

```sh
npm install
npm run build    # write output/ (points, outlines, PCB)
npm run keycaps  # build, then render ogre-ergo.keycaps.svg with legends
npm run snapshot # fail on geometry that changed since the last baseline
npm run check    # check the generated PCB's parts, nets and KiCad DRC
npm run serve    # live viewer on http://localhost:5174
npm run bundle   # pack config + footprints into output/ogre-ergo.ekb for the web UI
```

`build.js` runs ergogen with the footprints in `footprints/`. The ergogen CLI
only loads custom footprints from a folder, and this folder also holds
`node_modules`.

`npm run keycaps` runs `render_keycaps.py`, which needs Python 3 and PyYAML
(`pip install pyyaml`). It reads the `output/points/points.yaml` that ergogen
writes in debug mode and draws each key as a keycap with its legend: alphas
in cream, modifiers and arrows in grey, Esc and Enter in red.

`npm run snapshot` is the regression gate. It holds the build against
`points.snapshot.json` — position, rotation and size of all 68 keys — and fails
on any key that moved, appeared or went. A change you meant to make is a new
baseline: `npm run snapshot:update` rewrites the file and prints what it
accepted, and that file goes in the commit with the config change that caused
it.

`npm run serve` starts a viewer that watches `config.yaml` and `footprints/`,
rebuilds on save (about 0.4 s) and refreshes the browser by itself, so the
files in this folder stay the single source of truth. Tabs: **Keycaps** (the
`render_keycaps.py` render), **Points** (ergogen's demo), **Outline** (any
outline in `output/outlines/`) and **PCB** (rendered by `kicad-cli`, with a
layer picker). Drag to pan, wheel to zoom about the pointer, double click (or
**fit**) to fit the pane. The `snapshot` and `check` buttons run those scripts
and print their output. A YAML or footprint error shows in a red bar and the last good
render stays up until the next good build. Nothing leaves the machine.

`npm run bundle` writes `output/ogre-ergo.ekb`, a zip holding `config.yaml`
and `footprints/` as they are in the working tree. The ergogen web UI opens it
under **From Local File**, footprints and all, so the PCB generates there too.
Loading a bare `config.yaml` instead gives the layout and outlines but no PCB,
since the footprints wouldn't come with it. The archive is a snapshot: edits
made in the web editor don't come back to these files, so re-run `npm run
bundle` after changing the config.

`npm run check` reads the generated PCB and fails unless every key has one
switch and one diode wired column → switch → diode → row, no two keys share a
matrix position, every Pro Micro pad carries the net listed above, and the
reset switches and jacks are wired to their own half. If `kicad-cli` is
installed it also runs KiCad's DRC (overlapping parts, hole and edge
clearances) and fails on any violation other than the unrouted connections.

## Firmware notes

Compared with the ZMK `ogre_ergo` shield in `ctrlShiftBryan/zmk-config2`
(`boards/shields/ogre_ergo/`), nothing changes in the wiring: the same GPIOs,
the same diode direction and the same `col-offset = <5>` for the right half.
In ZMK terms, `RC(r, c)` is PCB column `r`, PCB row `c`.

- **Removed:** `RC(0,4)` and `RC(0,9)`. Drop them from the matrix transform
  and their bindings (`&mt LCTRL GRAVE` and `&kp RCTRL` today).
- **Reused for the new thumb keys:** `RC(1,4)` is now the left Home key and
  `RC(1,9)` the right End key. They used to be the bottom-row keys bound to
  `&kp LALT` and `&kp LBKT`. Move them into the thumb group of the transform
  and give them new bindings.
- **Everything else** keeps its matrix position, including the resized and
  moved keys. The transform goes from 70 to 68 entries.

The single-board build (MCU3) matches QMK's `ogre/ergo_single` pins, and the
halves match `ogre/ergo_split`.

## Not done yet

- **Mounting holes.** The as-built board had ten M2 holes at key corners.
  They depend on the case, and the new staggers move most of those corners,
  so they're left out until the case is redesigned.
- **Routing**, in KiCad.
