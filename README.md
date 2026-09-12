# Ogre keyboard repos

Inventory of every GitHub repo under `ctrlShiftBryan` that belongs to the Ogre
keyboard project (the Ogre Ergo and its siblings), plus the tooling and
firmware repos that orbit it. Surveyed 2026-09-12 from the GitHub API and fresh
clones of each repo.

**What the Ogre is.** The Ogre Ergo is an ErgoDox-inspired, "keycap friendly"
70-key ergonomic board designed in KiCad by Bryan Arendt (ctrlshiftba) in
2019. It uses Pro Micro controllers, MX/Alps hybrid hotswap footprints, and
14 WS2812B underglow LEDs. It ships in QMK upstream as `ogre/ergo_split` and
`ogre/ergo_single` (same PCB, merged Jan 2020, PRs #8011 and #8012). The
Jabberwocky is a second Ogre-branded PCB from late 2019. In 2024–2025 the Ergo
was reworked around a nice!nano v2 and ZMK.

## Core repos (the Ogre itself)

| Repo | Vis. | Active | What it is |
|---|---|---|---|
| [ogre](https://github.com/ctrlShiftBryan/ogre) | public | 2019-06 → 2019-07 | **First Ogre PCB.** KiCad 5 project (`ogre/ogre.kicad_pcb`, `.sch`), plate SVGs, gerbers in `plots/` and `the.gerber/`. Submodules: Keebio-Parts, keebio-components, ai03 MX_Alps_Hybrid, random-keyboard-parts. 21 commits, from "initial empty project" to "done". |
| [ogre-v1](https://github.com/ctrlShiftBryan/ogre-v1) | private | 2019-10-26 | **Empty KiCad scaffold**, 4 commits in one day (empty project, submodules, fp/sym tables). Superseded the same day by ogre-jabberwocky, which starts from these exact commits. |
| [ogre-jabberwocky](https://github.com/ctrlShiftBryan/ogre-jabberwocky) | private | 2019-10 → 2020-05 | **Jabberwocky PCB.** Full KiCad project (`ogre-v1.kicad_pcb`), routed and marked "final" Nov–Dec 2019. Also holds the Illustrator source for the edge/case cuts (`edge-v2.ai`, `jabberwocky.ai`, `illustrator-cuts/`), DXF exports, silkscreen BMP art (ogre logos, "twas", legends), laser cut file, and gerbers in `plots/`. 42 commits. |
| [ogre.pretty](https://github.com/ctrlShiftBryan/ogre.pretty) | public | 2019-11 → 2021-07 | **KiCad footprint library** (124 `.kicad_mod`). Everything custom for the Ogre: hotswap MX footprints 1u–2.75u incl. reversed-stabilizer and "Salvage" variants, Ogre Ergo edge/outline/plate/cuts by date (12-14, 12-18, 12-19, 12-29, 2020-01-04), silkscreen legends and logos, Jabberwocky legends/holes/edge, Pro Micro Mill-Max, nRF52840 (holyiot 18010, E73), SSD1306 OLED, EC11 encoder, WS2812B. `illustrator/mx-cutout.ai`. |
| [ogre.2024.pretty](https://github.com/ctrlShiftBryan/ogre.2024.pretty) | private | 2024-11 → 2025-05 | **KiCad 8 footprint library for the 2024 rework** (`Library.pretty/`, 8 footprints): CherryMX hotswap (1u, 1.5u, hybrid, with diode), D3 SMD v2 diode, ProMicro v3, JST PH 3-pin battery connector, Kailh Choc V2. |
| [ogre-case](https://github.com/ctrlShiftBryan/ogre-case) | private | 2026-09-11 | **Illustrator case design** for the Ogre Ergo, archived from a USB stick (the only copy). `ogre-ergo-case.ai.xz` (original dated 2022-10-07, 14 MB, xz'd to 5.5 MB) plus `preview.png` outline. README has restore steps and SHA-256. |
| [gatsby-ogre](https://github.com/ctrlShiftBryan/gatsby-ogre) | private | 2020-11-18 → 19 | **Unfinished product site / build guide.** Gatsby + Tailwind + TSX. Pages: index ("ogre ergo"), Ergo, GroupBuy, BuildGuide with 16 step components (Inventory, Diodes, Mill-Max, Pro-Micro, LED, TRRS, Reset Toggle, MX Switches, Remove film, Shield, Mid, Bottom, Top, QMK Flash, Done). Skeleton only, no copy. |
| [crkbd-ogre](https://github.com/ctrlShiftBryan/crkbd-ogre) | public | 2024-11-15 | **Fork of foostan/crkbd** (Corne) via Nick Meyer's `corne-ice` / `cho-corne-ice` wireless variants. One Bryan commit, "start changes", rewrites `corne-ice/pcb/corne-ice.kicad_pcb` (+48k lines) plus a BOM csv. Looks like the starting point for the nice!nano-based Ogre 2024 rework. Submodules: foostan/kbd, bstiq/nice-nano-kicad, cyril279/keyboards. |

## Firmware

| Repo / branch | Vis. | Active | What it is |
|---|---|---|---|
| [qmk_firmware](https://github.com/ctrlShiftBryan/qmk_firmware) (fork) | public | 2019 → today | Upstream QMK carries `keyboards/ogre/ergo_split` and `ergo_single` from Bryan's PRs. The fork's `master` is frozen at 2020-01-27 (18k commits behind). Ogre history lives on branches, listed below. Local clone: `~/code2/qmk_firmware` (checked out on `bryan/altair-keymap`, which is current upstream + personal Altair work). |
| ↳ `ogre-v2` | | 2019-06 → 10 | Earliest QMK keyboard for the Ogre (`keyboards/ogre`, single-board). "ogre v2 works" 2019-07-16. |
| ↳ `ogre72` | | 2019-10 | Adds `keyboards/ogre72`, a 72-key variant with 7u spacebar. Template readme, never upstreamed. |
| ↳ `ogre`, `ogre-split`, `old-master` | | 2019-11 → 2020-01 | Split-keyboard rewrite of `keyboards/ogre` ("create new", underglow, mod-taps). `ogre-split` is the last WIP before the upstream PR. |
| ↳ `ogre-ergo`, `ogre-ergo-single` | | 2020-01 | The exact branches behind upstream PRs #8011 (split) and #8012 (single). |
| ↳ `ogre-changes` | | 2020-03 → 2021-02 | Post-merge personal changes to both ergo keymaps (media keys, layer 2 keys, no split-hand pin, "update non-split"). Most recent Ogre QMK work. |
| ↳ `ctrlshiftba`, `ba-baur` | | 2020-01 → 05 | Personal keymaps for ergo_split. `ba-baur` is "ba bauer v2 keymap" with one-shot layers. |
| ↳ `ogre-jabberwocky`, `ba-jabber-keymap` | | 2019-11 → 12 | `keyboards/ogre/jabberwocky` QMK port and Bryan's keymap. Never upstreamed. |
| [zmk](https://github.com/ctrlShiftBryan/zmk) (fork), branch `ogre-ergo` | public | 2021-03 → 2022-02 | First ZMK port: `app/boards/shields/ogre_ergo/` (dtsi, left/right overlays, keymap, Kconfig, README). 12 commits ahead of a 2021 main. |
| [zmk-config2](https://github.com/ctrlShiftBryan/zmk-config2) | public | 2024-11 → 2025-10 | **Current ZMK user config.** Started for a Corne (nice!nano v2, nice!view, ZMK Studio) in Nov 2024; on 2025-05-26 adds the `ogre_ergo` shield (copied from the zmk fork) and on 2025-05-29 migrates the Corne keymap onto it with hold-tap behaviours and sym/num/nav/settings layers. `build.yaml` builds corne_left/right and ogre_ergo_left/right for nice_nano_v2. Also holds `keymap.afdesign` / `keymap-abbre-img.afdesign` (Affinity keymap diagrams). |
| [zmk-config](https://github.com/ctrlShiftBryan/zmk-config) | private | 2021-03 | Two-commit ZMK user config for a **Kyria** on nice!nano. Not Ogre; contemporaneous with the zmk fork's ogre-ergo branch. |
| [lily58-wireless-zmk-config](https://github.com/ctrlShiftBryan/lily58-wireless-zmk-config) | private | 2023-07 → 2025-10 | ZMK config for a Lily58 (nice!nano v2, ZMK v0.3, Studio). Not Ogre, but the keymap shares the same layer scheme. Has a CLAUDE.md. |
| [keyboard-hex](https://github.com/ctrlShiftBryan/keyboard-hex) | public | 2019-02 | Empty (README only, "my hex files"). |

## Layout / PCB tooling

| Repo | Vis. | Active | What it is |
|---|---|---|---|
| [visual-keyboard-studio](https://github.com/ctrlShiftBryan/visual-keyboard-studio) | public | 2019-05 | Vue + TypeScript app ("keebstudio"): parses a keyboard-layout-editor row/key model, renders keycaps, colour picker per key. 17 commits, deployed to an S3 bucket (see `notes.md`). Predates the Ogre PCB by a month. |
| [kicad-footprint-aligner](https://github.com/ctrlShiftBryan/kicad-footprint-aligner) | public | 2019-07-04 | Vue app, 3 commits, "calculates adjustment" for centring footprints. Written mid-Ogre-PCB routing. |
| [kicad-keyboard-editor](https://github.com/ctrlShiftBryan/kicad-keyboard-editor) | public | 2021-04-13 | VS Code extension scaffold with a `common/parser.ts` for `.kicad_pcb` files (stub file: Voyager60 PCB). 2 commits, hello-world stage. |
| [kle-serial](https://github.com/ctrlShiftBryan/kle-serial) (fork of ijprest) | public | 2019-09 | Unmodified fork of the keyboard-layout-editor.com serialisation library. |
| Forks: [crkbd](https://github.com/ctrlShiftBryan/crkbd), [Voyager60](https://github.com/ctrlShiftBryan/Voyager60), [plain60-c](https://github.com/ctrlShiftBryan/plain60-c), [gh60](https://github.com/ctrlShiftBryan/gh60), [CherryMX](https://github.com/ctrlShiftBryan/CherryMX) | public | 2019–2024 | Reference PCBs and keycap models pulled in while designing. No Bryan commits. |

Not keyboard-related despite the name: `keyboard-maestro` (a macOS Keyboard
Maestro macro export), `Overlook` (KVM client, "full keyboard grab").

## Timeline

| When | Milestone | Where |
|---|---|---|
| 2019-05 | visual-keyboard-studio: KLE-style renderer | visual-keyboard-studio |
| 2019-06/07 | First Ogre PCB designed and routed in KiCad; QMK `ogre-v2` works | ogre, qmk `ogre-v2` |
| 2019-10 | ogre72 variant; ogre-v1 scaffold → Jabberwocky | qmk `ogre72`, ogre-v1, ogre-jabberwocky |
| 2019-11/12 | Jabberwocky routed and finalised; footprint lib started; split QMK rewrite | ogre-jabberwocky, ogre.pretty, qmk `ogre-split` |
| 2020-01 | Ogre Ergo split + single merged into upstream QMK (#8011, #8012) | qmk `ogre-ergo*` |
| 2020-03 → 2021-02 | Personal keymap iterations | qmk `ogre-changes`, `ba-baur`, `ctrlshiftba` |
| 2020-11 | Build-guide website skeleton | gatsby-ogre |
| 2021-03 → 2022-02 | First ZMK shield for Ogre Ergo | zmk fork `ogre-ergo` |
| 2021-07 | Last footprint-library update (hotswap, salvage footprints) | ogre.pretty |
| 2022-10 | Illustrator case design (file date) | ogre-case |
| 2024-11 | New footprint lib; Corne-ice fork as base for wireless rework; ZMK config for Corne | ogre.2024.pretty, crkbd-ogre, zmk-config2 |
| 2025-05 | Ogre Ergo shield added to zmk-config2, keymap migrated from Corne | zmk-config2 |
| 2025-10 | Last keymap tweak ("update brackets") | zmk-config2 |
| 2026-09-11 | Case .ai archived from USB drive | ogre-case |

## Layout files in this folder

`layout/` holds the Ogre Ergo physical layout exported 1:1 from the QMK
`keyboard.json` (split and single share identical geometry, 70 keys, no rotation):

- `ogre-ergo.kle.json`: keyboard-layout-editor.com JSON. Import it via
  *Raw data* → paste, or *Upload JSON*. Legends are layer 0 of the QMK default
  keymap; mod-tap keys show the hold modifier as a second legend.
- `ogre-ergo-layout.svg` / `.png`: rendered preview with the QMK matrix
  position (row,col) in each key's corner.

Regenerate with `layout/qmk2kle.py` (it reads
`~/code2/qmk_firmware/keyboards/ogre/ergo_split/keyboard.json` and the default
`keymap.c`). The ZMK `ogre_ergo.dtsi` matrix transform in zmk-config2 lists the
same 70 keys in the same order (its RC(row,col) is the transpose of QMK's
[row,col], since ZMK declares 7 rows × 10 cols and QMK 10 rows × 7 cols), so the
KLE file also lines up with the ZMK keymap position for position.
