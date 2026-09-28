# Ogre 68

A 68-key ergonomic keyboard, written by hand for
[ergogen](https://ergogen.xyz): key layout, board outline and a KiCad PCB, all
generated from one `ergogen/config.yaml`. It is a single PCB that either builds
as one keyboard or snaps along two break lines into a split with a spare center
piece.

34 keys a half: four staggered rows, a three-key inner column, a lone Esc
outboard of the number row, two arrow keys, and a four-key thumb cluster fanned
30°. Standard keycap sizes throughout — 1U alphas, 1.5U/1.75U/1.25U on the outer
column, 1.25U and 2.25U thumbs. `ergogen/README.md` describes the design;
`ergogen/ogre-ergo.keycaps.svg` renders it.

## Where it stands

- Layout, outline and PCB all generate from the config: 68 keys on a 10x7
  matrix, one diode per key, three Pro Micro footprints (center for the single
  build, left and right for the split).
- The design's own values — column staggers, thumb fan, half separation — are
  named in the config's `units` block, so the board is tuned in one place.
- `npm run snapshot` holds the geometry against a committed baseline, so a key
  that moves without you meaning it fails.
- `npm run check` fails on one known thing: KiCad DRC courtyard overlaps where
  each half's Pro Micro sits under its middle-column keys, which is deliberate.
  That wants a decision — allowlist those four footprint pairs, or move the
  controllers — before it can serve as a gate.
- **Next:** settle that DRC policy, then route in KiCad. Mounting holes wait on
  the case, since the new staggers moved most of the old M2 positions.

## Working on it

```sh
cd ergogen && npm install
npm run serve     # live viewer on http://localhost:5174
```

The viewer watches `config.yaml` and `footprints/`, rebuilds on save and
refreshes itself: keycaps, points, outlines and the PCB, with the snapshot and
check scripts a button away. `ergogen/README.md` covers the other commands, the
PCB's matrix and break lines, and the ZMK changes the two removed keys imply.

## The rest of the repo

| Where | What |
|---|---|
| `ergogen/` | The Ogre 68: config, custom footprints, build and check scripts, live viewer |
| `layout/` | The 2019 Ogre Ergo's KLE design, its renderer, and an index of every KLE gist |
| `docs/ogre-repos.md` | Inventory of every Ogre repo — PCBs, firmware branches, tooling — and the project timeline |
