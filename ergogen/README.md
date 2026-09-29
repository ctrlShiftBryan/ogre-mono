# The Ogre 68 in ergogen

`config.yaml` is the whole board, written by hand for
[ergogen](https://ergogen.xyz): key layout, board outline and an unrouted
KiCad PCB. It needs ergogen 4.1+ and the custom footprints in `footprints/`.
On ergogen.xyz (or a local clone of `ergogen/ergogen-gui`), load it from GitHub
with the repo URL (it finds `ergogen/config.yaml` and `ergogen/footprints/`
itself); pasting the YAML alone won't work, because the footprints wouldn't
load. That web UI reads the pushed repo, not the working tree, and its local
file picker is a one-shot upload that brings no footprints; for local work
use `npm run serve` below.

| File | What it is |
|---|---|
| `config.yaml` | Layout, outline and PCB |
| `footprints/` | Hotswap switch, its diode, nice!nano, nice!view, battery connector, power and reset switches on the board; the 2019 PCB-mount switch, diode, Pro Micro and TRRS jack, and a JST PH battery connector, available but not placed |
| `serve.js` | Live viewer: watches the config, rebuilds and shows every view |
| `bundle.js` | Packs the config and footprints into an archive the web UI can open |
| `points.snapshot.json` | Baseline geometry for `npm run snapshot` |
| `ogre-ergo.keycaps.svg` | Key preview, the one committed render |

## The design

Everything that shapes the board is named in the config's `units` block. The
zones below it place keys and give them legends; the shape lives in `units`.

- **34 keys a half.** Four rows across six columns (outer, pinky, ring, middle,
  index, inner), a three-key extra column inboard of them, a lone Esc on the far
  column, two arrow keys below ring and middle, and four thumb keys.
- **Column stagger.** Each column steps against the one before it, and the
  steps add up to the profile across the hand: the middle column is highest at
  +0.375U, falling away to the pinky on one side and the inner and extra
  columns on the other. `stagger_far` through `stagger_extra`.
- **Key sizes.** 1U throughout, except the outer column's wide caps —
  1.5U Tab, 1.75U Caps Lock, 1.25U Ctrl — right-aligned to the pinky column.
- **Thumb cluster.** Three columns fanned `thumb_splay` (−30°) off the bottom
  of the middle column: 1.25U Cmd, 2.25U Shift, then 1.25U Alt with a 1U Home
  above it. The wide thumb caps are drawn as wide keys turned 90°, so switch
  and stabilizer footprints face the right way.
- **Halves.** Mirrored about an axis `half_spread` (4.25U) right of the extra
  column, which sets the gap between them.

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

Two boards, always split, one per half: `left` and `right`, each its own KiCad
PCB with its own nets. Wireless only: nice!nano controllers, no TRRS. The matrix
and the controller pad map come from the 2019 Ogre Ergo, where they were
fabricated and worked; the switch and nice!nano footprints come from the 2024
rework (`ogre.2024.pretty`):

- **Key numbers.** Each half numbers its keys 1–34 in points order: up each
  column from the outer edge inward, then the thumbs. Key *n* on a half is that
  board's switch MX*n* and diode D*n*. The keycap render (`ogre-ergo.keycaps.svg`,
  and the viewer's Keycaps tab) prints each key's number as L*n* or R*n*, and
  `npm run check` fails if a switch or diode is numbered out of step with its key.
- **One 12×8 matrix, one hotswap switch and one diode per key** (Kailh MX
  socket and SOD-123 or through-hole diode, both on the back, COL2ROW). The
  2.25U thumb keys add stabilizer holes (a key's `stab`), and a key's `turn`
  would turn its switch (no key uses it now). The 2024 footprint had the diode built
  in; here it's a part of its own (`ogre_socket_diode`) so it can be moved
  clear of traces. A key's `diode: [x, y, r]` in the zones places its diode
  (mm from the key, in its frame, y up; `mirror.diode` for the right half);
  without one it sits at the switch's right edge, where the built-in one was.
  Diodes number in key order, so moving one never renumbers the rest.
  The grid follows the board: one column net per physical column, col0 the
  far Esc column through col7 the extra column, and one row net per physical
  row, num (row0) down to the arrows' mod row (row4), with the thumbs a row of
  their own (row5) on col4–col7 in order of their x (Cmd, Shift, Alt, Home). The
  right half is the same grid on rows 6–11. Each half is its own PCB with its
  own nets, so the numbering across both is a convention, not a wire.
- **One nice!nano per half**, MCU1 on each board, on the back on Mill-Max
  sockets: pad 1 = CS and pads 5 / 6 = MOSI / SCK for the nice!view (D1, D2, D3:
  its defaults); pads 7–12 = its six rows (row0–5 left, row6–11 right); pads
  20→13 = col0–col7; 22 = RESET; 24 (RAW, the nice!nano's B+) = RAW, from the
  power switch. Pad 2 (D0) is the one GPIO left free.
- **nice!view per half** (DISP1): the 5-pin header, MOSI, SCK, VCC, GND, CS from
  pin 1 (the nice!view's own KiCad library), on the front of the controller bay
  just past the nice!nano's far end, the 14 × 36 mm display lying over it, where
  a Corne puts its OLED. Its first four pins are the Corne's 4-pin OLED header
  in the same order, CS added past GND. The holes are the nice!nano's Mill-Max
  size, so the display can sit on sockets. Firmware: ZMK's `nice_view` shield,
  no adapter, since CS is on its default pin.
- **Battery connector per half** (J1): a JST PH 2-pin side-entry through-hole
  connector (S2B-PH-K) on the back, + on BAT and − on GND. JST sets no polarity.
  Pad 1 is +, the Adafruit and SparkFun convention (the battery plug's mating
  face toward you, polarizing bump up: red on the right), which the community
  wireless Corne also uses; the silkscreen marks it. About half of generic
  LiPos come wired the other way: check a new battery against that picture (or
  a multimeter) and swap its crimps, or set the connector's `plus` to 2.
- **Power switch per half** (SW2): a Shouhan MSK-12C02 side-actuated SPDT slide
  switch (pin-compatible with the Alps SSSS811101 the community wireless Corne
  uses), KiCad's stock footprint, on the back at the top edge over `5` / `6`:
  body 0.6 mm in from the edge, lever out past it. BAT comes in on the common
  pin 2, RAW goes out on pin 1 when on (the silkscreen marks that end ON), and
  pin 3 is left open, as on the Corne.
- **Each half:** its nice!nano in a bay of its own beside the inner column, as
  on a Corne, on the back with USB-C flush with the bay's top edge. Its place
  is `mcu_x` / `mcu_y` in the config's `units`, from the inner column's top key,
  as placed in KiCad; the right half mirrors it. A 6 mm reset switch (SW1) sits
  on the back below Tab (`| \` on the right).
- **Outline:** keycap edges with 1 mm corners, thumbs included. The thumb
  cluster joins the matrix by filling only the gaps between neighboring keys
  (`thumb_web`), and one pocket per half is cut out over Cmd, as on the 2019
  board. Each half's inner edge runs straight up just inside its inner column,
  and the controller bay (`mcu_bay`) juts out from it. The `left` and `right`
  outlines are the halves; `board` is both together, for viewing.
- **No underglow LEDs**, no alternate-size switch footprints, and no mounting
  holes yet (see below).

Both boards sit on KiCad's page at their `pcbs.<half>.params.origin` in the
config: after ergogen runs, `build.js` moves each finished PCB there as a whole
and puts KiCad's drill origin at the same spot. Ergogen's own coordinates (the
points, the snapshot, the reference DXFs) stay where they were.

Routing is left for KiCad. The PCBs are build output, not committed files:
`npm run build` writes `output/pcbs/left.kicad_pcb` and `right.kicad_pcb`, each
with a `.kicad_pro` beside it so KiCad opens it as a project. Every build
rewrites the boards in place (never deleting them, so KiCad can keep one open)
and leaves the project files and KiCad's other files alone; anything done to a
board in KiCad is replaced, so route in a copy. The projects have no schematic;
the board and its nets are the whole design.

## Commands

```sh
npm install
npm run build    # write output/ (points, outlines, PCB)
npm run keycaps  # build, then render ogre-ergo.keycaps.svg with legends
npm run snapshot # fail on geometry that changed since the last baseline
npm run check    # check the generated PCB's parts, nets and KiCad DRC
npm run serve    # live viewer on http://localhost:5174
npm run bundle   # pack config + footprints into output/ogre-ergo.ekb for the web UI
npm run reference # output/reference-left.dxf / -right.dxf, to draw a new outline over
npm run kicad    # build, then open a half's KiCad project (npm run kicad right)
```

`npm run kicad` opens `output/pcbs/left.kicad_pro` in KiCad (`npm run kicad
right` for the other half), to look the board over, run DRC or place parts. Placements made there come back by hand into
`config.yaml` (see `AGENTS.md`); everything else on the board is replaced by the
next build. After a rebuild (`npm run serve` rebuilds on every save), **File >
Revert** in the PCB editor loads the new board.

`npm run reference` plots each built half to a DXF for a vector editor: board
edge on `Edge.Cuts`, keycaps on `User.Drawings`, and the courtyards of the
switches and reset switches on `F.Courtyard`
and `B.Courtyard`. Units are mm and the coordinates are ergogen's own, y up, so
a drawing that keeps them lines up with the config, and the two halves line up
with each other. It needs `kicad-cli`.

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
layer picker; **edge + keycaps** lays every keycap over the board outline). Drag to pan, wheel to zoom about the pointer, double click (or
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
hotswap switch and one diode wired column → switch → diode → row, no two keys
share a matrix position, every nice!nano pad carries the net listed above, and
the reset switches are wired to their own half. If `kicad-cli` is
installed it also runs KiCad's DRC (overlapping parts, hole and edge
clearances) and fails on any violation other than the unrouted connections.

## Firmware notes

The matrix no longer matches the ZMK `ogre_ergo` shield in
`ctrlShiftBryan/zmk-config2` (`boards/shields/ogre_ergo/`) or QMK's
`ogre/ergo_split`: the 2019 board's 5×7 grid packed eight physical columns
into seven nets and borrowed matrix spots for the thumbs, and this one is the
board as drawn. A new shield wants:

- **kscan per half:** six rows on D4, D5, D6, D7, D8, D9 (pads 7–12) and eight
  columns on D21, D20, D19, D18, D15, D14, D16, D10 (pads 20→13), COL2ROW, so
  `diode-direction = "col2row"`.
- **Transform:** 6 rows × 16 columns, `col-offset = <8>` for the right half.
  Row 0 is the number row, row 4 the arrows, row 5 the thumbs; column 0 is Esc,
  columns 1–7 outer through extra, and the thumbs sit on columns 4–7 of row 5
  as Cmd, Shift, Alt, Home (mirrored on the right: Fn, Enter, Alt, End). 68
  entries, in the same key order as the keycap render.
- **Bindings** carry over key by key; only their `RC` positions change.

## Not done yet

- **Mounting holes.** None yet. They sit at key corners, so they follow from
  the case, and the case is a new design too.
- **Routing**, in KiCad.
