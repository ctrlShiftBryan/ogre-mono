# Placement proposal for the left half: reassigns the module's matrix pins and
# places every support part greedily next to what it connects to, in free space.
#   python3 place.py ../../output/pcbs/left.kicad_pcb left-placed.kicad_pcb
import math, re, sys, itertools
import numpy as np
import pcbnew

src, dst = sys.argv[1], sys.argv[2]
b = pcbnew.LoadBoard(src)
MM = pcbnew.ToMM
fp = {f.GetReference(): f for f in b.GetFootprints()}
R = 0.25  # grid, mm

def pad(ref, num):
    return next(p for p in fp[ref].Pads() if p.GetNumber() == str(num))
def pos(p):
    q = p.GetPosition(); return np.array([MM(q.x), MM(q.y)])

# ---------------------------------------------------------------- module pins
m = fp['MCU1']
mc = np.array([MM(m.GetPosition().x), MM(m.GetPosition().y)])
mbb = m.GetCourtyard(pcbnew.B_CrtYd).BBox()
mx0, my0, mx1, my1 = MM(mbb.GetLeft()), MM(mbb.GetTop()), MM(mbb.GetRight()), MM(mbb.GetBottom())
OUTER = [1, 2, 3, 4, 6, 7, 8, 9, 10, 15, 17, 35]   # outer-row GPIO pads, no NFC
MATRIX = [f'col{i}' for i in range(7)] + [f'row{i}' for i in range(5)]

def exit_point(p):   # 1 mm out from the module side the pad sits on
    x, y = pos(p)
    if x < mx0 + 1.5: return np.array([mx0 - 1.0, y])
    if y > mc[1]: return np.array([x, my1 + 1.0])
    return np.array([x, my0 - 1.0])

def crosses(a, c):   # segment a-c through the module's courtyard (sampled)
    for t in np.linspace(0.02, 0.98, 60):
        x, y = a + (c - a) * t
        if mx0 < x < mx1 and my0 < y < my1: return True
    return False

TL, BL = np.array([mx0 - 1.0, my0 - 1.0]), np.array([mx0 - 1.0, my1 + 1.0])   # around the outboard end only
def detour(p, t):
    e = exit_point(p); nodes = [e, TL, BL, t]; n = len(nodes)
    dist = [math.inf] * n; dist[0] = 0; done = set()
    while len(done) < n:
        i = min((k for k in range(n) if k not in done), key=lambda k: dist[k]); done.add(i)
        for j in range(n):
            if j not in done and not crosses(nodes[i], nodes[j]):
                dist[j] = min(dist[j], dist[i] + np.linalg.norm(nodes[i] - nodes[j]))
    return dist[3] + np.linalg.norm(pos(p) - e)

targets = {n: [pos(p) for f in b.GetFootprints() if f.GetReference() != 'MCU1' for p in f.Pads() if p.GetNetname() == n] for n in MATRIX}
cost = np.array([[min(detour(pad('MCU1', k), t) for t in targets[n]) for k in OUTER] for n in MATRIX])
# min-cost assignment by DP over subsets of pads
N = len(MATRIX); best = {0: (0.0, [])}
for i in range(N):
    nxt = {}
    for mask, (c, picks) in best.items():
        for j in range(N):
            if not mask & (1 << j):
                key = mask | (1 << j); val = c + cost[i][j]
                if key not in nxt or val < nxt[key][0]: nxt[key] = (val, picks + [j])
    best = nxt
total, picks = best[(1 << N) - 1]
assign = {MATRIX[i]: OUTER[j] for i, j in enumerate(picks)}
print('matrix pins:', ' '.join(f'{n}->{k}' for n, k in assign.items()), f'(detour total {total:.0f} mm)')
for p in m.Pads():
    if p.GetNetname() in MATRIX: p.SetNetCode(0)
for n, k in assign.items(): pad('MCU1', k).SetNet(b.FindNet(n))

# ---------------------------------------------------------------- free space
e = b.GetBoardEdgesBoundingBox()
X0, Y0 = MM(e.GetLeft()), MM(e.GetTop())
W, H = int(MM(e.GetWidth()) / R) + 2, int(MM(e.GetHeight()) / R) + 2
from PIL import Image, ImageDraw
img = Image.new('L', (W, H), 0); d = ImageDraw.Draw(img)
cell = lambda x, y: ((x - X0) / R, (y - Y0) / R)
outline = pcbnew.SHAPE_POLY_SET(); b.GetBoardPolygonOutlines(outline, False)
outline.Deflate(pcbnew.FromMM(0.5), pcbnew.CORNER_STRATEGY_ROUND_ALL_CORNERS, pcbnew.FromMM(0.01))
def poly(chain, fill):
    d.polygon([cell(MM(chain.CPoint(i).x), MM(chain.CPoint(i).y)) for i in range(chain.PointCount())], fill=fill)
for o in range(outline.OutlineCount()):
    poly(outline.Outline(o), 255)
    for h in range(outline.HoleCount(o)): poly(outline.Hole(o, h), 0)
def block_rect(x0, y0, x1, y1):
    d.rectangle([cell(x0, y0), cell(x1, y1)], fill=0)
FIXED = re.compile(r'^(MX|S|D)\d+$|^(MCU1|SW2|LED1|LED2)$')
for f in b.GetFootprints():
    r = f.GetReference()
    if not FIXED.match(r) or r == 'D34': continue
    margin = 1.0 if r == 'MCU1' else 0.3
    for layer in (pcbnew.B_CrtYd, pcbnew.F_CrtYd) if r.startswith('LED') else (pcbnew.B_CrtYd,):
        c = f.GetCourtyard(layer)
        if c.OutlineCount():
            bb = c.BBox(); block_rect(MM(bb.GetLeft()) - margin, MM(bb.GetTop()) - margin, MM(bb.GetRight()) + margin, MM(bb.GetBottom()) + margin)
    for p in f.Pads():
        pb = p.GetBoundingBox()
        block_rect(MM(pb.GetLeft()) - 0.3, MM(pb.GetTop()) - 0.3, MM(pb.GetRight()) + 0.3, MM(pb.GetBottom()) + 0.3)
        if p.HasHole():
            (x, y), rr = pos(p), MM(p.GetDrillSizeX()) / 2 + 0.35
            d.ellipse([cell(x - rr, y - rr), cell(x + rr, y + rr)], fill=0)
# the antenna: past the pads at the module's +x end, to the board edge, both layers
ANT = (MM(pad('MCU1', 1).GetPosition().x) + 1.0, my0 - 3, X0 + W * R, my1 + 3)
block_rect(*ANT)
CORRIDORS = [
    (mx0 - 1.0, my1, MM(pad('MCU1', 1).GetPosition().x) + 0.6, my1 + 3.0),          # below the bottom row
    (mx0 - 9.0, MM(pad('MCU1', 17).GetPosition().y) - 0.8, mx0, MM(pad('MCU1', 15).GetPosition().y) + 0.8),   # out of 15/17
    (mx0 + 1.5, my0 - 1.2, mx1 - 3.0, my0),                                         # just above the top row
]
for c in CORRIDORS: block_rect(*c)
free = np.array(img) > 0

def integral():
    occ = (~free).astype(np.int32)
    ii = np.zeros((H + 1, W + 1), np.int32); ii[1:, 1:] = occ.cumsum(0).cumsum(1); return ii

# ---------------------------------------------------------------- parts
# part: [(net, target pad or None for the nearest fixed pad of that net, weight)], rotations, entry
T = lambda ref, num: ('pad', ref, num)
SPEC = [
    ('J2',  [('BAT', None, 1)], 'J2'),
    ('J1',  [('VBUS', T('MCU1', 27), 1), ('D-', T('MCU1', 29), 2), ('D+', T('MCU1', 31), 2)], 'J1'),
    ('IC1', [('VBUS', None, 1), ('VDDH', T('MCU1', 23), 1), ('VBAT', None, 1)], None),
    ('IC2', [('VDDH', None, 1), ('PWR_EN', T('MCU1', 33), 1)], None),
    ('Y1',  [('XL1', T('MCU1', 11), 3), ('XL2', T('MCU1', 13), 3)], None),
    ('C5',  [('XL1', T('Y1', 1), 2)], None),
    ('C6',  [('XL2', T('Y1', 2), 2)], None),
    ('C2',  [('VDD', T('MCU1', 19), 3)], None),
    ('L1',  [('DCCH', T('MCU1', 25), 2), ('VDD', T('MCU1', 19), 1)], None),
    ('C1',  [('VDD', T('MCU1', 19), 2)], None),
    ('C3',  [('VDDH', T('MCU1', 23), 2)], None),
    ('C4',  [('VBUS', T('MCU1', 27), 2)], None),
    ('C7',  [('VBUS', T('IC1', 13), 2)], None),
    ('C8',  [('VDDH', T('IC1', 10), 2)], None),
    ('C9',  [('VBAT', T('IC1', 2), 2)], None),
    ('R3',  [('TS', T('IC1', 1), 2)], None),
    ('R4',  [('ISET', T('IC1', 16), 2)], None),
    ('C10', [('VDDH', T('IC2', 1), 2)], None),
    ('C11', [('VCC', T('IC2', 5), 2)], None),
    ('R5',  [('PWR_EN', T('IC2', 3), 2), ('VDDH', None, 1)], None),
    ('R1',  [('BLED', T('MCU1', 28), 1), ('LED_S', None, 0.5)], None),
    ('R2',  [('VDDH', None, 1), ('LED_C', None, 0.5)], None),
    ('J3',  [('SWDIO', T('MCU1', 37), 1), ('SWDCLK', T('MCU1', 39), 1), ('RESET', T('MCU1', 26), 1), ('VDD', None, 0.5)], None),
    ('SW1', [('RESET', None, 1)], None),
    ('D34', [('thumb_far_upper', T('S34', 2), 2), ('row3', None, 1)], None),
]
HORIZONTAL = set()
UNDER = {'J1': 'MX8', 'J2': 'MX7'}   # under Q (the daughterboard cable, up to above 3) and A (the battery)
OPENS = {'J1': 'right', 'J2': 'left'}   # the plug goes in horizontally, along the band below the key: J1 toward 3, J2 from the outer edge
ENTRY = {'J1': ([6, 7], 5.0), 'J2': ([1, 2], 5.0)}   # plug side (these pads' side), clear depth

placed = set(r for r in fp if FIXED.match(r) and r != 'D34')
def fixed_points(net):
    return [pos(p) for r in placed for p in fp[r].Pads() if p.GetNetname() == net]

side_of = lambda f: f.IsFlipped()
for ref, links, entry in SPEC:
    f = fp[ref]; ii = integral(); best = None
    for rot in (0, 90, 180, 270):
        f.SetOrientationDegrees(rot); f.SetPosition(pcbnew.VECTOR2I(0, 0)); f.BuildCourtyardCaches()
        c = f.GetCourtyard(pcbnew.B_CrtYd if f.IsFlipped() else pcbnew.F_CrtYd)
        bb = c.BBox() if c.OutlineCount() else f.GetBoundingBox(False)
        for p in f.Pads(): bb.Merge(p.GetBoundingBox())
        rx0, ry0, rx1, ry1 = MM(bb.GetLeft()) - 0.5, MM(bb.GetTop()) - 0.5, MM(bb.GetRight()) + 0.5, MM(bb.GetBottom()) + 0.5
        if ref in HORIZONTAL and (rx1 - rx0) < (ry1 - ry0): continue
        if entry:
            pads_, depth = ENTRY[entry]
            v = np.mean([pos(pad(ref, k)) for k in pads_], axis=0)   # from the anchor (at 0,0) toward the plug side
            if abs(v[0]) < abs(v[1]) or (v[0] > 0) != (OPENS[ref] == 'right'):
                continue   # the plug has to go in from that side
            rx0, rx1 = (rx0 - depth, rx1) if v[0] < 0 else (rx0, rx1 + depth)
        # candidate anchors over the whole board
        xs = np.arange(X0 - rx0, X0 + W * R - rx1, R); ys = np.arange(Y0 - ry0, Y0 + H * R - ry1, R)
        GX, GY = np.meshgrid(xs, ys)
        c0 = np.floor((GX + rx0 - X0) / R).astype(int); c1 = np.ceil((GX + rx1 - X0) / R).astype(int)
        r0 = np.floor((GY + ry0 - Y0) / R).astype(int); r1 = np.ceil((GY + ry1 - Y0) / R).astype(int)
        c1, r1 = np.minimum(c1, W), np.minimum(r1, H)
        occ = ii[r1, c1] - ii[r0, c1] - ii[r1, c0] + ii[r0, c0]
        ok = occ == 0
        if not ok.any(): continue
        cost = np.zeros_like(GX)
        for net, tgt, w in links:
            ps = [pos(p) for p in f.Pads() if p.GetNetname() == net]
            if not ps: continue
            pts = [pos(pad(tgt[1], tgt[2]))] if tgt else fixed_points(net)
            if not pts: continue
            best_d = np.full(GX.shape, np.inf)
            for (px_, py_) in ps:
                for (tx, ty) in pts:
                    best_d = np.minimum(best_d, np.hypot(GX + px_ - tx, GY + py_ - ty))
            cost += w * best_d
        if ref in UNDER:   # the whole part (not its plug zone) under that key: its width, from its centre to 12 mm below
            k = fp[UNDER[ref]].GetPosition(); kx, ky = MM(k.x), MM(k.y)
            f.SetPosition(pcbnew.VECTOR2I(0, 0)); body = f.GetCourtyard(pcbnew.B_CrtYd).BBox()
            bx0, by0, bx1, by1 = MM(body.GetLeft()), MM(body.GetTop()), MM(body.GetRight()), MM(body.GetBottom())
            ok &= (GX + bx0 >= kx - 9.5) & (GX + bx1 <= kx + 9.5) & (GY + by0 >= ky) & (GY + by1 <= ky + 12)
        cost[~ok] = np.inf
        k = np.unravel_index(np.argmin(cost), cost.shape)
        if np.isfinite(cost[k]) and (best is None or cost[k] < best[0]):
            best = (cost[k], rot, GX[k], GY[k], (rx0, ry0, rx1, ry1))
    if best is None:
        print(f'{ref}: no room'); continue
    c, rot, x, y, (rx0, ry0, rx1, ry1) = best
    f.SetOrientationDegrees(rot); f.SetPosition(pcbnew.VECTOR2I(pcbnew.FromMM(float(x)), pcbnew.FromMM(float(y))))
    block_rect(x + rx0, y + ry0, x + rx1, y + ry1); free = np.array(img) > 0
    placed.add(ref)
    print(f'{ref:4} at {x:6.2f},{y:6.2f} r{rot:3}  cost {c:5.1f}')

pcbnew.SaveBoard(dst, b)
img.save(dst.replace('.kicad_pcb', '.free.png'))
