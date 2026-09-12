#!/usr/bin/env python3
"""Convert QMK keyboard.json LAYOUT + default keymap layer 0 into KLE JSON and an SVG preview."""
import json, re, sys
from pathlib import Path

QMK = Path.home() / "code2/qmk_firmware/keyboards/ogre"
split = json.load(open(QMK / "ergo_split/keyboard.json"))["layouts"]["LAYOUT"]["layout"]
single = json.load(open(QMK / "ergo_single/keyboard.json"))["layouts"]["LAYOUT"]["layout"]
geo = lambda L: [(k["x"], k["y"], k.get("w", 1), k.get("h", 1)) for k in L]
print("split/single geometry identical:", geo(split) == geo(single), "keys:", len(split))

# --- legends from default keymap layer 0 ---
src = (QMK / "ergo_split/keymaps/default/keymap.c").read_text()
defs = dict(re.findall(r"#define\s+(\w+)\s+(.+)", src))
layer0 = re.search(r"\[0\]\s*=\s*LAYOUT\((.*?)\)\s*,\s*\n\s*\[1\]", src, re.S).group(1)
codes = [c.strip() for c in layer0.replace("\n", " ").split(",") if c.strip()]
assert len(codes) == len(split), (len(codes), len(split))

LBL = {"KC_ESC":"Esc","KC_EQL":"=","KC_GRV":"`","KC_PGUP":"PgUp","KC_MINS":"-","KC_DEL":"Del",
"KC_TAB":"Tab","KC_RBRC":"]","KC_LBRC":"[","KC_BSLS":"\\","KC_PGDN":"PgDn","KC_QUOT":"'","KC_SCLN":";",
"KC_LSFT":"Shift","KC_RSFT":"Shift","KC_COMM":",","KC_DOT":".","KC_SLSH":"/","KC_LALT":"Alt","KC_RALT":"Alt",
"KC_LEFT":"←","KC_RGHT":"→","KC_DOWN":"↓","KC_UP":"↑","KC_SPC":"Space","KC_BSPC":"Bksp","KC_ENT":"Enter"}
def label(code):
    if code in defs:  # mod-tap / layer-tap macros: show tap key, hold on second line
        m = re.match(r"(MT|LT)\((\w+),\s*(\w+)\)", defs[code])
        kind, a, b = m.groups()
        hold = {"MOD_LCTL":"Ctrl","MOD_LGUI":"GUI","MOD_RGUI":"GUI","MOD_RCTL":"Ctrl"}.get(a, f"L{a}")
        return f"{label(b)}\n\n\n\n\n\n{hold}"   # KLE: top-left label, front-legend? keep simple: bottom-left
    if code in LBL: return LBL[code]
    if re.fullmatch(r"KC_[A-Z0-9]", code): return code[3:]
    return code

# --- emit KLE rows (group by y, keys sorted by x) ---
keys = sorted(zip(split, codes), key=lambda kc: (kc[0]["y"], kc[0]["x"]))
kle = [{"name": "Ogre Ergo", "author": "ctrlshiftba", "notes": "Generated from qmk_firmware/keyboards/ogre/ergo_split/keyboard.json (70 keys). Split and single share this geometry."}]
cur_y = 0.0
row, cur_x, row_y = None, 0.0, None
for k, code in keys:
    x, y, w, h = k["x"], k["y"], k.get("w", 1), k.get("h", 1)
    if row is None or y != row_y:
        if row is not None:
            kle.append(row); cur_y = row_y + 1
        row, cur_x, row_y = [], 0.0, y
        props = {}
        if y - cur_y: props["y"] = round(y - cur_y, 4)
    else:
        props = {}
    if x - cur_x: props["x"] = round(x - cur_x, 4)
    if w != 1: props["w"] = w
    if h != 1: props["h"] = h
    if props: row.append(props)
    row.append(label(code))
    cur_x = x + w
kle.append(row)

out = Path.home() / "code2/ogre-mono/layout"
json.dump(kle, open(out / "ogre-ergo.kle.json", "w"), indent=1, ensure_ascii=False)

# --- SVG preview ---
U = 54
W = max(k["x"] + k.get("w", 1) for k in split) * U + 20
H = max(k["y"] + k.get("h", 1) for k in split) * U + 20
s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="sans-serif" font-size="12">',
     f'<rect width="{W}" height="{H}" fill="#f4f1ea"/>']
for k, code in zip(split, codes):
    x, y, w, h = k["x"]*U+10, k["y"]*U+10, k.get("w",1)*U, k.get("h",1)*U
    l = label(code).split("\n")
    s.append(f'<rect x="{x+2}" y="{y+2}" width="{w-4}" height="{h-4}" rx="6" fill="#fff" stroke="#333"/>')
    s.append(f'<text x="{x+8}" y="{y+18}">{l[0].replace("&","&amp;").replace("<","&lt;")}</text>')
    if len(l) > 1: s.append(f'<text x="{x+8}" y="{y+h-8}" font-size="9" fill="#777">{l[-1]}</text>')
    s.append(f'<text x="{x+w-6}" y="{y+h-8}" font-size="8" fill="#aaa" text-anchor="end">{k["matrix"][0]},{k["matrix"][1]}</text>')
s.append("</svg>")
(out / "ogre-ergo-layout.svg").write_text("\n".join(s))
print("wrote", out / "ogre-ergo.kle.json", "rows:", len(kle)-1)
