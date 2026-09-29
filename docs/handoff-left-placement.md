# Handoff: left-half placement, then routing by section

Written 2026-09-29 at the end of a session. The next session carries the
reviewed placement proposal into `ergogen/config.yaml`, then routes the left
half one section at a time. Read `AGENTS.md` and `ergogen/README.md` (the
"Routing is left for KiCad" paragraph onward) first; this doc covers only
what isn't written down there.

## Where things stand

- The matrix is 5x7 per half (`4b5570b`), drawn as a table in
  `ergogen/README.md`.
- `ergogen/routing/left.kicad_pcb` is the routed board, committed and the
  master for copper (`bfaa034`, AGENTS.md). It currently holds **no traces**
  (the first matrix autoroute was ripped, `de26bb1`) and the **old placement**,
  with the support parts parked off the right edge.
- `ergogen/route.py` autoroutes a named section (`python3 route.py <section>`)
  and rips one (`python3 route.py rip [section]`). Only `matrix` is defined so
  far. Its docstrings explain the DSN fixes.
- **The placement proposal to carry into the config** is in
  `ergogen/routing/proposal/` (`10f01cf`; see its `README.md`). The user was
  about to review it in KiCad on another machine. If they moved parts there,
  their committed board is the source to encode, not `left-placed.kicad_pcb`
  as generated. Pull first.

## Decisions made with the user

- Workflow: place every part first, then route by section, most constrained
  first. Order: module support parts (crystal, supply caps, L1), power
  (battery, switch, charger, LDO), USB, reset/SWD/LEDs, matrix to module,
  matrix. Ground pour last. Commit each section on its own; the user reviews
  between sections.
- Freerouting gets no layer bias.
- J1 (USB cable to the daughterboard, which sits just above the 3 key) goes
  under Q. J2 (battery, under the board) goes under A. **Both plugs enter
  sideways**, along the band below the key, or they hit the hotswap socket
  underneath. Their bodies lie horizontally in that band.
- Fixed in place: the power switch SW2 (lever out the inner edge) and the LEDs
  on the tab. Everything else can move.
- The module stays in its spot below PgDn with its antenna at the inner edge;
  only its offset can change.

## The proposal's matrix pin map (not yet in the code)

Every matrix net on an outer-row pad. The inner row (12, 14, 16, ...) can't be
reached without a via under the module.

| net  | pad | GPIO  |   | net  | pad | GPIO  |
|------|-----|-------|---|------|-----|-------|
| col0 | 10  | P0.30 |   | row0 | 17  | P1.09 |
| col1 | 9   | P0.31 |   | row1 | 35  | P0.24 |
| col2 | 7   | P0.02 |   | row2 | 15  | P0.05 |
| col3 | 6   | P1.13 |   | row3 | 8   | P0.29 |
| col4 | 4   | P0.28 |   | row4 | 2   | P1.10 |
| col5 | 3   | P0.03 |   |      |     |       |
| col6 | 1   | P1.11 |   |      |     |       |

P0.15 (LED, pad 28, inner row) keeps its pad for nice!nano compatibility and
needs one via under the module. Pads 12, 14 and 16 (P0.26, P0.06, P0.08) come
free.

## Next steps

1. Pull, and ask whether the user changed the proposal in KiCad.
2. Encode the placement in `config.yaml`: each part as a `where` shift from a
   nearby key, in the key's frame with y up (AGENTS.md, "Placing parts in
   KiCad"). D34's new spot goes in the zones as `thumb.far.rows.upper.diode`.
   The right half reuses the shifts mirrored; check that the right board comes
   out sensible too, since only the left was ever looked at.
3. Update the pin map in `footprints/ogre_e73.js` (`PADS`), `check-pcb.js`
   (`expectedMcu`'s pad lists) and `ergogen/README.md` (controller paragraph
   and firmware notes' kscan pins).
4. Add an antenna keepout (rule area: no tracks, vias or pours, both layers)
   to `ogre_e73.js`. `routing/proposal/trial.py` adds a temporary one from
   1 mm past pad 1 to the board edge, module ±3 mm.
5. `npm run build`, `snapshot`, `check`. Copy the build's left board (and
   `.kicad_pro`) over `routing/left.kicad_pcb`; it has no traces yet, so a plain
   copy is safe. Commit.
6. Add the sections to `route.py`'s `SECTIONS` and route them in the order
   above, one per turn with the user reviewing in KiCad (File > Revert to
   reload).

Open review points the user hasn't answered yet: the supply caps sit 4–6 mm
from the module's power pads (the row channel and B's socket crowd that end);
col6 on pad 1 runs beside the antenna keepout; the LED resistors sit by the
module, so the LED lines cross the whole board.

## Gotchas

- KiCad 10's Python bindings: iterating `board.Tracks()` fails (index it,
  as `route.tracks()` does), and removing footprints from Python corrupts the
  SWIG proxies. Every pcbnew run prints `property.h` asserts: noise.
- Freerouting (2.4.1) misplaces keepouts on footprints turned off a right
  angle and crowds curved edges; `route.py`'s `fix_dsn` corrects both. It
  also necks traces below the 0.2 mm minimum now and then; `route.py` widens
  them back.
- Freerouting on a new machine: `gh release download v2.4.1 --repo
  freerouting/freerouting --pattern 'freerouting-2.4.1.jar'` into
  `~/.local/share/freerouting/` (or set `FREEROUTING`). Java 21 or newer.
- `npm run serve`'s watcher and every build rewrite `output/pcbs/*`; never
  work there.
- DRC's `npth_inside_courtyard` and `lib_footprint_issues` are the design's own
  (`route.py`'s `EXPECTED`).

## Working with this user

- Ask questions **one at a time**, the most blocking first, with a
  recommended default.
- Commit each change as it's made, straight to `main`; push when asked (they
  switch machines, and `origin` may have commits from the other one: rebase).

## Suggested skills

- `writing-for-agents` before editing `AGENTS.md` (the routing workflow line
  may need a sentence once sections exist).
- `diagnosing-bugs` if Freerouting or the KiCad bindings misbehave in a new way.
- `code-review` over the session's commits (`4b5570b..10f01cf`) before
  building further on `route.py`, if wanted.
