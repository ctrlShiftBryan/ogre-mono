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
| `footprints/` | The switch, its socket and diode, the nRF52840 module, charger, LDO, passives, crystal, connectors, switches, LEDs and SWD pads on the board (`ogre_*.js`); the 2019 PCB-mount switch, diode, Pro Micro and TRRS jack, the nice!nano and the through-hole JST PH connector, available but not placed |
| `footprints/jlc/` | Footprints pulled verbatim from JLCPCB's parts library with easyeda2kicad, one per assembled part, each carrying its LCSC number; `jlc.js` turns them into ergogen footprints |
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
PCB with its own nets. Wireless only, with the controller on the board itself:
an nRF52840 module and the nice!nano v2's power section, all surface mount on
the back, for JLCPCB assembly. The matrix comes from the 2019 Ogre Ergo, where
it was fabricated and worked; the switch footprint from the 2024 rework
(`ogre.2024.pretty`); everything JLC places uses JLC's own footprint
(`footprints/jlc/`), so the pads and orientation match their line.

- **Key numbers.** Each half numbers its keys 1–34 in points order: up each
  column from the outer edge inward, then the thumbs. Key *n* on a half is that
  board's switch MX*n*, socket S*n* and diode D*n*. The keycap render
  (`ogre-ergo.keycaps.svg`, and the viewer's Keycaps tab) prints each key's
  number as L*n* or R*n*, and `npm run check` fails if a part is numbered out
  of step with its key.
- **One 10×7 matrix, one hotswap socket and one diode per key**, COL2ROW. The
  switch (`ogre_hotswap`) is holes, cap outline and legend; its copper is the
  socket (`ogre_socket`, a Kailh-compatible MX socket, JLC's clone) and the
  1N4148W diode in SOD-123F (`ogre_socket_diode`), each a part of its own on
  the back so it can be moved clear of traces. The socket places itself over
  the switch's pins; a key's `diode: [x, y, r]` in the zones places its diode
  (mm from the key, in its frame, y up; `mirror.diode` for the right half),
  and without one it sits at the switch's right edge, where the 2024 footprint
  had it built in. The 2.25U thumb keys add stabilizer holes (a key's `stab`),
  and a key's `turn` would turn its switch and socket together (no key uses it
  now). Rows 0–4 are the left half, rows 5–9 the right; columns 0–6 on each,
  numbered from the outer edge inward. The thumb Home/End keys take row4/col1
  and row9/col1; row4/col0 and row9/col0 stay unused.
- **The controller** (MCU1): an Ebyte E73-2G4M08S1C, an nRF52840 module with
  its antenna, matching and crystals inside, lying sideways on the back below
  the extra column's home key (PgDn / `" '`), where that column has no bottom
  key, with its ceramic antenna end just inside the half's inner edge. Keep
  copper off that end on both layers; the diodes of the two keys beside it are
  moved out of its way in the zones. Its pin map is in `footprints/ogre_e73.js`: the seven
  columns on P1.11 P1.10 P0.03 P0.28 P1.13 P0.02 P0.29, the half's five rows on
  P0.31 P0.30 P0.26 P0.06 P0.05, and the nice!nano's roles kept on the
  nice!nano's pins, so ZMK's `nice_nano_v2` configuration carries over with
  the matrix pins renamed: P0.13 cuts the LDO (`PWR_EN`), P0.15 drives the
  status LED (`BLED`), P0.18 is reset, battery voltage is read from VDDH.
- **Power, as on the nice!nano v2.** The battery (BAT) goes through the slide
  switch (VBAT) into a TI BQ24075 charger and power path (IC1): USB on IN,
  the battery on BAT, and OUT (VDDH) feeds the module in high-voltage mode,
  from USB when it's plugged in and the battery otherwise. 500 mA from USB
  (EN1 high, EN2 low), charging whenever USB is there (CE low, SYSOFF low),
  charge current set by the 10k on ISET (about 100 mA; a smaller resistor
  raises it), the thermistor faked with 10k on TS. The module's own regulator
  puts 3.3 V out on DCCH, which L1 (10 µH) carries to VDD. A Torex XC6220 LDO
  (IC2) makes VCC from VDDH for anything the board powers besides the module
  (LED strips, one day); its CE is pulled up to VDDH through 10 MΩ and driven
  by P0.13 (`PWR_EN`), so firmware can cut it. A 32.768 kHz crystal (Y1, FC-135)
  with 12 pF caps is the low-frequency clock. Nets and values are checked by
  `npm run check`.
- **USB** comes over a one-to-one 4-pin cable from a Unified Daughterboard S1
  ([unified-daughterboard.github.io](https://unified-daughterboard.github.io/))
  mounted in the case, which carries the USB-C port, its fuse and ESD
  protection. The board's end is a Molex Pico-EZmate (J2, 78171-0004) with the
  daughterboard's pinout, 1 VBUS 2 D− 3 D+ 4 GND, below S (L on the right),
  opening toward the index column.
- **Battery connector** (J2): a JST PH 2-pin side-entry surface-mount connector
  (S2B-PH-SM4-TB) below Q (P on the right), the plug entering from the outer
  edge's side, + on BAT and − on GND. JST sets no polarity. Pad 1 is +, the Adafruit and
  SparkFun convention (the battery plug's mating face toward you, polarizing
  bump up: red on the right), which the community wireless Corne also uses;
  the silkscreen marks it. About half of generic LiPos come wired the other
  way: check a new battery against that picture (or a multimeter) and swap its
  crimps, or set the connector's `plus` to 2.
- **Power switch** (SW2): a Shouhan MSK-12C02 side-actuated SPDT slide switch
  (pin-compatible with the Alps SSSS811101 the community wireless Corne uses),
  on the half's inner edge below `~ \`` (PgUp on the right), lever out past
  it. BAT comes in on the common pin 2, VBAT goes out on pin 1
  when on (the silkscreen marks that end ON), and pin 3 is left open, as on
  the Corne.
- **Reset** (SW1): a 5.1 mm surface-mount tactile switch (TS-1187A) below R
  (U on the right), wired across its diagonal pads so it works whichever way
  its pin pairs run.
- **SWD** (J3): six bare pads and three locating holes for a Tag-Connect
  TC2030-NL cable, under T / Y. The module arrives blank; this is how the UF2
  bootloader gets on once (any SWD probe; a Raspberry Pi Pico running
  debugprobe will do).
- **LEDs**: two 3 mm through-hole LEDs on the front, soldered by hand, on a tab
  below Esc (Del on the right) so they shine up through a hole in the case
  just below that key, one above the other: LED2 the charge LED (VDDH through
  1k, sinking into the charger's CHG, orange) and, below it, LED1 the status
  LED (P0.15 through 1k, blue). Each stands with its two pads in a line down
  the tab, the flat side (cathode) at the footprint's origin and the anode
  above it, so a bent-over LED shines sideways.
- **Where the rest sits.** Nothing juts out of the outline for the controller:
  the parts hide on the back in the 10 mm strips between one key's socket and
  the next key's switch pins. The module's inductor, capacitors and the crystal
  are in the strip between G and B, next to the module's pad end; the charger
  and LDO with their passives in the strip between `} ]` and PgDn; the SWD
  pads under T, between that switch's side pins; the USB connector below S,
  the battery connector below Q, reset below R, and the power switch on the
  inner edge below `~ \``, as placed in KiCad. Each is placed from a nearby key in
  the config (`mcu_x` / `mcu_y` for the module) and the right half reuses the
  same placement from the mirrored key. The config's numbers are a working
  first layout, not a final one: move parts in KiCad and carry them back (see
  `AGENTS.md`).
- **Outline:** keycap edges with 1 mm corners, thumbs included. The thumb
  cluster joins the matrix by filling only the gaps between neighboring keys
  (`thumb_web`), and one pocket per half is cut out over Cmd, as on the 2019
  board. Each half's inner edge runs straight up just inside its inner column,
  and the LED tab (`led_tab_w`, `led_tab_h`) hangs below Esc / Del. The `left`
  and `right` outlines are the halves; `board` is both together, for viewing.
- **No underglow LEDs**, no alternate-size switch footprints, and no mounting
  holes yet (see below).

### Ordering from JLCPCB

Every part JLC places carries its LCSC number as a footprint property
(`LCSC Part`), read from the footprint file in `footprints/jlc/` or set per
part in the config (the passives). The three hand-soldered footprints, the
switch outline, the LEDs and the SWD pads, carry none, and `npm run check`
holds that line. The bill of materials and placement files come out of the
routed board with KiCad's Fabrication Toolkit plugin (or Bouni's
kicad-jlcpcb-tools), which reads that property; the sockets and diodes sit on
the back with everything else, so assembly is single-sided. The module needs
JLC's Standard assembly tier and X-ray inspection. Stock on the module is the
one thing that can hold an order up: buy it into the JLC parts library early.

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
switch, one socket and one diode wired column → socket → diode → row, no two
keys share a matrix position, the module's pads carry the nets listed above,
the charger, LDO, crystal, passives, connectors, switches and LEDs are wired
as described, and every assembled part carries its LCSC number. If
`kicad-cli` is installed it also runs KiCad's DRC (overlapping parts, hole and
edge clearances) and fails on any violation other than the unrouted
connections and the switch pins that pass through their sockets' courtyards.

## Firmware notes

Compared with the ZMK `ogre_ergo` shield in `ctrlShiftBryan/zmk-config2`
(`boards/shields/ogre_ergo/`), the matrix is the same: the same diode direction
and the same `col-offset = <5>` for the right half. In ZMK terms, `RC(r, c)`
is PCB column `r`, PCB row `c`. What changes is the controller: with the
nRF52840 on the board, ZMK wants a board definition of its own rather than a
shield on `nice_nano_v2`. Start from ZMK's `nice_nano_v2` board files (the same
charger, regulator cut-off on P0.13, battery read from VDDH, status LED on
P0.15, external 32 kHz crystal) and put the matrix on the pins in
`footprints/ogre_e73.js`.

- **Removed:** `RC(0,4)` and `RC(0,9)`. Drop them from the matrix transform
  and their bindings (`&mt LCTRL GRAVE` and `&kp RCTRL` today).
- **Reused for the new thumb keys:** `RC(1,4)` is now the left Home key and
  `RC(1,9)` the right End key. They used to be the bottom-row keys bound to
  `&kp LALT` and `&kp LBKT`. Move them into the thumb group of the transform
  and give them new bindings.
- **Everything else** keeps its matrix position, including the resized and
  moved keys. The transform goes from 70 to 68 entries.

The halves match QMK's `ogre/ergo_split` pins.

## Not done yet

- **Mounting holes.** None yet. They sit at key corners, so they follow from
  the case, and the case is a new design too.
- **Routing**, in KiCad.
