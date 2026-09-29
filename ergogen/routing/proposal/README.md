# Left-half placement proposal

Not yet the design: `config.yaml` still places the parts as before. This is a
proposal to review in KiCad before it's carried into the config.

- `left-placed.kicad_pcb`: every part placed, unrouted. The module's matrix
  pins are reassigned onto its outer-row pads (col0-col6 on 10 9 7 6 4 3 1,
  row0 17, row1 35, row2 15, row3 8, row4 2), J1 sits under Q and J2 under A
  with their plugs entering sideways, and the support parts cluster at their
  pins around the module.
- `left-trial.kicad_pcb`: the same board autorouted in one throwaway pass
  (every net but GND): 0 unrouted, 93 vias, 1 DRC nit. A check that the
  placement routes, not routing to keep.
- `place.py` made the placement from the build's board (greedy, each part at
  the free spot nearest what it connects to); `trial.py` made the trial route.
