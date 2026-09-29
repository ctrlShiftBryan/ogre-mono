# Ogre 68

A 68-key ergonomic keyboard, written by hand for
[ergogen](https://ergogen.xyz): key layout, board outline and a KiCad PCB, all
generated from one `ergogen/config.yaml`. It is a wireless split: one PCB per
half, each with a nice!nano.

34 keys a half: four staggered rows, a three-key inner column, a lone Esc
outboard of the number row, two arrow keys, and a four-key thumb cluster fanned
30°. Standard keycap sizes throughout — 1U alphas, 1.5U/1.75U/1.25U on the outer
column, 1.25U and 2.25U thumbs. `ergogen/README.md` describes the design;
`ergogen/ogre-ergo.keycaps.svg` renders it.

## Where it stands

- Layout, outline and PCBs all generate from the config: 68 keys on a 10x7
  matrix, hotswap sockets with one diode per key, and a nice!nano per half.
- The design's own values — column staggers, thumb fan, half separation — are
  named in the config's `units` block, so the board is tuned in one place.
- `npm run snapshot` holds the geometry against a committed baseline, so a key
  that moves without you meaning it fails.
- `npm run check` passes its wiring checks and fails only on KiCad DRC
  silkscreen warnings: the socket outline over its own holes, the nice!nano's
  small pin labels, and labels overlapping under the controller. That wants a
  decision (clean up the silkscreen, or let the check ignore it) before DRC can
  serve as a gate.
- **Next:** the battery connector (JST PH 2-pin) and a power switch per half,
  then routing: a routed board as the copper master, with the build syncing
  placement into it. Mounting holes wait on the case.

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
