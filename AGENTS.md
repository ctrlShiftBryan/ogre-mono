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
config change. Run `snapshot` and `check` before committing
anything that moves a key or touches the PCB.

`npm run build` stamps the current date into the PCB title block, so a rebuild on
its own leaves a one-line diff in `ogre-ergo.kicad_pcb`. Leave that date-only
change out of commits.

`ergogen/README.md` covers the commands, the design, the PCB's matrix and break
lines, and the live viewer.
