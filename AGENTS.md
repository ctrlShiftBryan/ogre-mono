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

The as-built 70-key PCB (`ctrlShiftBryan/ogre-v1`) is the geometric reference.
`npm run verify` holds every kept key against it and lists the intended
differences by name; that list is part of the design record, so extend it when a
change is deliberate. Run `verify` and `check` before committing anything that
moves a key or touches the PCB.

`npm run build` stamps the current date into the PCB title block, so a rebuild on
its own leaves a one-line diff in `ogre-ergo.kicad_pcb`. Leave that date-only
change out of commits.

`ergogen/README.md` covers the commands, the redesign's changes from the as-built
board, the PCB's matrix and break lines, and the live viewer.
