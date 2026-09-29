# ogre-mono

The Ogre 68: a 68-key ergonomic keyboard whose layout, outline and KiCad PCB all
generate from `ergogen/config.yaml`. That file is the design; nothing else in the
repo defines the board. `layout/` holds the 2019 Ogre Ergo that came before it,
and `docs/ogre-repos.md` the other Ogre repos — history, not input. Upstream
QMK's coordinates for the old board are a maintainer's guess, so treat geometry
from another repo as suspect.

## Commits

Conventional commits (`feat(ergogen): …`, `docs: …`, `test: …`), one per change,
made as the change is made rather than batched at the end of a session.

Trunk based development: commit directly to `main`. Work in this repo lands on
`main`; branches and pull requests are not part of its workflow. The
socketed-nice!nano board that came before the onboard controller is in
history, before the `surface-mount` merge, if it's ever wanted again.

## ergogen/

`config.yaml` is the source of truth. The `.svg` and `.kicad_pcb` files beside it
are build output that `npm run build` overwrites, so changes belong in the
config, and routing belongs in a copy of the PCB.

`routing/left.kicad_pcb` is that copy: the routed left half, committed and the
master for copper. The build never writes it; KiCad and `route.py` edit it. Its
parts start from the build's placement; routing goes one section at a time
(`python3 route.py <section>` autoroutes one, then the user reviews in KiCad),
each section committed on its own.

The values that shape the board — column staggers, the thumb fan, the half
separation, the controller module's spot — live by name in the config's `units` block.
Change the design there, not by editing numbers inside the zones.

`footprints/jlc/*.kicad_mod` are JLCPCB's own footprints, pulled with
easyeda2kicad and kept verbatim (only the 3D model line removed) so their pads
and orientation match JLC's assembly line. Don't edit their pads; a wrapper
in `footprints/ogre_*.js` names the pins, and `jlc.js` does the rest. When
the wrapper's frame differs from JLC's drawing, turn the whole footprint
(`rotate` in `jlc.place`), never the pads in the file, or the placement file's
rotation goes wrong.

`npm run snapshot` is the geometry gate: it fails on any key that moved, appeared
or went since the baseline in `points.snapshot.json`. When the move was
deliberate, `npm run snapshot:update` and commit the new baseline alongside the
config change. Run `snapshot` and `check` before committing
anything that moves a key or touches the PCB.

### Placing parts in KiCad

The user places parts by hand in KiCad, in `output/pcbs/left.kicad_pcb` or
`right.kicad_pcb`, and the agent carries each move into `config.yaml` so the
build reproduces it:

1. Copy that board to the scratchpad before touching the config: the build and
   `npm run serve`'s watcher both rewrite the boards in `output/pcbs/`.
2. Diff its footprints against a build written to the scratchpad, and encode
   each move as an offset from its key. A diode takes its key's
   `diode: [x, y, r]` in the zones (`mirror.diode` on the right half): mm in
   the key's frame, y up, and degrees. A controller or power part takes its
   `where` shift from the key it sits under (`mcu_x` / `mcu_y` for the module
   itself, from the extra column's home key), which the right half reuses from
   the mirrored key.
3. Done when a scratch build puts every footprint where the saved board has it.
   Then build, and the user reverts the board in KiCad.

`npm run build` stamps the current date into the PCB title block, so a rebuild on
its own leaves a one-line diff in `ogre-ergo.kicad_pcb`. Leave that date-only
change out of commits.

`ergogen/README.md` covers the commands, the design, the PCB's matrix and break
lines, and the live viewer.
