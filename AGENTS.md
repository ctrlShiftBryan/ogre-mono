# ogre-mono

The Ogre 68: a redesign of the Ogre Ergo that generates its layout, outline and
KiCad PCB from `ergogen/config.yaml`. `layout/` holds the as-built board's KLE
design and the gist index; `docs/ogre-repos.md` inventories the other Ogre repos.
Geometry found in another repo is suspect until checked against those two —
upstream QMK's coordinates in particular are a maintainer's guess.

## Commits

Conventional commits (`feat(ergogen): …`, `docs: …`, `test: …`), one per change,
made as the change is made rather than batched at the end of a session.

Trunk based development: commit directly to `main`. Work in this repo lands on
`main`; branches and pull requests are not part of its workflow.

## ergogen/

`config.yaml` is the source of truth. The `.svg` and `.kicad_pcb` files beside it
are build output that `npm run build` overwrites, so changes belong in the
config, and routing belongs in a copy of the PCB.

The values that shape the board — column staggers, the thumb fan, the half
separation — live by name in the config's `units` block. Change the design
there, not by editing numbers inside the zones.

`npm run snapshot` is the geometry gate: it fails on any key that moved, appeared
or went since the baseline in `points.snapshot.json`. When the move was
deliberate, `npm run snapshot:update` and commit the new baseline alongside the
config change. `npm run compare` reports the design against the as-built 70-key
board, which was this design's starting point rather than its specification —
a record, not a gate. Run `snapshot` and `check` before committing anything that
moves a key or touches the PCB.

`npm run build` stamps the current date into the PCB title block, so a rebuild on
its own leaves a one-line diff in `ogre-ergo.kicad_pcb`. Leave that date-only
change out of commits.

`ergogen/README.md` covers the commands, the redesign's changes from the as-built
board, the PCB's matrix and break lines, and the live viewer.
