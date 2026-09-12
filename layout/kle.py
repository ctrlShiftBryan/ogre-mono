"""Minimal keyboard-layout-editor.com deserializer (same rules as KLE's serial.js) + SVG render."""
import json, math, sys, re

def parse(data):
    keys, meta = [], {}
    cur = dict(x=0.0, y=0.0, w=1.0, h=1.0, r=0.0, rx=0.0, ry=0.0, c="#cccccc", d=False)
    cl = dict(x=0.0, y=0.0)
    for row in data:
        if isinstance(row, dict):
            meta.update(row); continue
        for item in row:
            if isinstance(item, dict):
                if "r" in item: cur["r"] = float(item["r"])
                if "rx" in item: cur["rx"] = cl["x"] = float(item["rx"]); cur["x"], cur["y"] = cl["x"], cl["y"]
                if "ry" in item: cur["ry"] = cl["y"] = float(item["ry"]); cur["x"], cur["y"] = cl["x"], cl["y"]
                cur["x"] += float(item.get("x", 0)); cur["y"] += float(item.get("y", 0))
                if "w" in item: cur["w"] = float(item["w"])
                if "h" in item: cur["h"] = float(item["h"])
                if "c" in item: cur["c"] = item["c"]
                if "d" in item: cur["d"] = bool(item["d"])
            else:
                k = dict(cur); k["label"] = item
                keys.append(k)
                cur["x"] += cur["w"]; cur["w"] = cur["h"] = 1.0; cur["d"] = False
        cur["y"] += 1; cur["x"] = cur["rx"]
    return meta, keys

def load(path):
    txt = open(path).read()
    txt = txt[txt.index("["):]
    return parse(json.loads(txt))

def center(k):
    """Rotated key centre in key units (KLE rotates clockwise about (rx,ry))."""
    a = math.radians(k["r"]); cx, cy = k["x"] + k["w"]/2, k["y"] + k["h"]/2
    dx, dy = cx - k["rx"], cy - k["ry"]
    return (k["rx"] + dx*math.cos(a) - dy*math.sin(a), k["ry"] + dx*math.sin(a) + dy*math.cos(a))

def svg(keys, title, path, U=50):
    cs = [center(k) for k in keys]
    W = (max(c[0] for c in cs) + 2.5) * U; H = (max(c[1] for c in cs) + 2.5) * U
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W:.0f}" height="{H:.0f}" font-family="sans-serif" font-size="11"><rect width="100%" height="100%" fill="#f4f1ea"/><text x="10" y="18" font-size="14">{title} ({len(keys)} keys)</text>']
    for k in keys:
        x, y, w, h = k["x"]*U + U/2, k["y"]*U + U, k["w"]*U, k["h"]*U
        lab = str(k["label"]).split("\n")[0].replace("&", "&amp;").replace("<", "&lt;")
        tr = f' transform="rotate({k["r"]} {k["rx"]*U + U/2} {k["ry"]*U + U})"' if k["r"] else ""
        s.append(f'<g{tr}><rect x="{x+2}" y="{y+2}" width="{w-4}" height="{h-4}" rx="5" fill="{k["c"]}" stroke="#333"/><text x="{x+6}" y="{y+16}">{lab}</text><text x="{x+w-5}" y="{y+h-6}" font-size="8" fill="#777" text-anchor="end">{k["w"]:g}x{k["h"]:g}{(" r%g" % k["r"]) if k["r"] else ""}</text></g>')
    s.append("</svg>"); open(path, "w").write("\n".join(s))

if __name__ == "__main__":
    for gid, title in [l.split("|") for l in sys.argv[1:]]:
        meta, keys = load(gid + ".kle"); svg(keys, title, gid + ".svg")
        print(gid, title, len(keys), "rot", sum(1 for k in keys if k["r"]), "sizes", sorted({(k["w"], k["h"]) for k in keys}))
