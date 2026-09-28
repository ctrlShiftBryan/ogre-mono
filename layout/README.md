# Layouts

`ogre-ergo.kle.json` is the as-built 70-key Ogre Ergo — the board the Ogre 68
started from, and the one `ergogen/compare.js` reports against. `ogre-ergo.svg`
is its render, `kle.py` the renderer, `kle-gists.md` the index of every KLE gist
on the account.

## The original KLE designs (gists)

The Ogre was designed in keyboard-layout-editor.com, which saves layouts as
GitHub gists. The account holds about 150 keyboard gists from 2019-04 to
2025-09; `kle-gists.md` indexes all of them with key counts. The ones
that matter, verified against the QMK readme photos and the KiCad footprints:

Only the as-built board is copied locally; the rest live in their gists.

| Gist | Date | What it is | Copy in `layout/` |
|---|---|---|---|
| [ogre - proto 2 - right](https://gist.github.com/ctrlShiftBryan/c3e7732efbd659caf811a79142388f24) | 2019-06-12 | **The 70-key Ogre Ergo as built.** Mirrored thumb clusters of 1.25u (rotated 30°) + 1×2.25u + 1×1.5u; 1.5/1.75/2.25u row ends. Matches the split photo in the QMK readme. | `ogre-ergo.kle.json` |
| [ogre-starter](https://gist.github.com/ctrlShiftBryan/92e689435b2e871f4e3be34ff3fdfdd7) | 2020-01-25 | Same board dressed with 1u/1.5u/2u caps (two days before the QMK PR). | — |
| [Ogre-ergO tkl](https://gist.github.com/ctrlShiftBryan/371187f112595510258a5386cc92757c) | 2019-07-01 | The 68-key first PCB in the `ogre` repo (2.75u/2u thumb keys; footprint counts match). QMK branch `ogre-v2`. | — |
| [OGRE 2025](https://gist.github.com/ctrlShiftBryan/924e0f9423bcae3f99e5aeea24a7db68) | 2025-09-01 | New 62-key design, uniform 1u with 1×1.5u thumbs. | — |

Each `.kle.json` has a matching `.svg` render. `layout/kle.py` is a small
deserializer that follows KLE's own rules (the npm `kle-serial` build mishandles
`rx`/`ry` cluster resets) and renders the SVGs.

**The QMK geometry is not the design.** Bryan's PR-era `info.json` files were
empty; the `keyboards/ogre/ergo_*` coordinates in upstream QMK were added by a
maintainer in June 2020 (#9549) with no rotation and guessed thumb heights. Read
them as a matrix, never as a layout: the ZMK `ogre_ergo.dtsi` transform in
zmk-config2 lists the same 70 keys in the same order (RC(row,col) is the
transpose of QMK's [row,col]), and `ergogen/README.md` maps the redesign onto
it.
