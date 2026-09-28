# Ogre 68

A 68-key redesign of the Ogre Ergo, written by hand for
[ergogen](https://ergogen.xyz): key layout, board outline and a KiCad PCB, all
generated from one `ergogen/config.yaml`. Like the as-built board, it is a
single PCB that either builds as one keyboard or snaps along two break lines
into a split with a spare center piece.

It starts from the as-built 70-key Ogre Ergo and changes it deliberately: 1.25U
Shifts in place of 2.25U, no outer bottom-row keys, 1.25U far thumb keys with a
new 1U key above each, restaggered outer and innermost columns, and the halves
1.25U further apart. `ergogen/README.md` lists every change and the reason for
it; `ergogen/ogre-ergo.keycaps.svg` renders the result.

## Where it stands

- Layout, outline and PCB all generate from the config: 68 keys on the as-built
  board's 10x7 matrix, one diode per key, three Pro Micro footprints (center for
  the single build, left and right for the split).
- `npm run verify` is green — every key the redesign keeps still matches the
  as-built PCB within 0.01 mm, and the intended differences are listed by name.
- `npm run check` fails on one known thing: KiCad DRC courtyard overlaps where
  each half's Pro Micro sits under its middle-column keys, which is how the
  as-built board is arranged. That wants a decision — allowlist those four
  footprint pairs, or move the controllers — before it can serve as a gate.
- **Next:** settle that DRC policy, then route in KiCad. Mounting holes wait on
  the case, since the new staggers moved most of the old M2 positions.

## Working on it

```sh
cd ergogen && npm install
npm run serve     # live viewer on http://localhost:5174
```

The viewer watches `config.yaml` and `footprints/`, rebuilds on save and
refreshes itself: keycaps, points, outlines and the PCB, with the verify and
check scripts a button away. `ergogen/README.md` covers the other commands, the
PCB's matrix and break lines, and the ZMK changes the two removed keys imply.

## The rest of the repo

| Where | What |
|---|---|
| `ergogen/` | The Ogre 68: config, custom footprints, build and check scripts, live viewer |
| `layout/` | The as-built 70-key KLE design, its renderer, and an index of every KLE gist |
| `docs/ogre-repos.md` | Inventory of every Ogre repo — PCBs, firmware branches, tooling — and the project timeline |
