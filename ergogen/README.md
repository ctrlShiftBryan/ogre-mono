# Ogre Ergo in ergogen

`ogre-ergo.yaml` is the 70-key Ogre Ergo written by hand for
[ergogen](https://ergogen.xyz). Paste it into ergogen.xyz or build it locally (needs ergogen 4.1+).

It reproduces the switch positions of the as-built PCB
(`ctrlShiftBryan/ogre-v1`, `ogre-v1.kicad_pcb`) to within 0.01 mm, which is
KiCad's rounding. The main grid is also identical to the KLE design
(`../layout/ogre-ergo.kle.json`). The thumb keys follow the PCB, which sits
about 1 mm off the KLE, whose two thumb clusters aren't quite mirror images.

The PCB has alternate footprints (other row-end widths, 2u/2.75u thumbs).
This config uses the set in the KLE: 1.5/1.75/2.25/1.25u row ends and a
1.25u + 2.25u + 1.5u thumb cluster.

```sh
npm install
npm run verify   # compare every key to the PCB positions
npm run build    # write output/ (points, demo.svg)
```

`ogre-ergo.demo.svg` is the build's key preview.
