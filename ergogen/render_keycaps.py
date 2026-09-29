"""Render an ergogen build as keycaps, using each key's `legend` from the config,
and its number: L or R for its half, then its place in points order on that half,
which is its switch MXn and diode Dn on that half's PCB.
Usage: python3 render_keycaps.py output/points/points.yaml keycaps.svg "Title"
(ergogen must be run with -d so points.yaml is written.)"""
import sys, yaml
U=19.05
pts=yaml.safe_load(open(sys.argv[1])); out_svg=sys.argv[2]; title=sys.argv[3] if len(sys.argv)>3 else ''
def lines(lg):
    parts=lg.split(' ')
    return parts if len(parts)==2 and all(len(x)==1 for x in parts) else [lg]   # "! 1" -> shifted over base
ACCENT={'Esc','Enter'}
def is_mod(lg):   # word legends and arrows use modifier colors; letters and punctuation use alpha colors
    return not all(len(x)==1 and x.isascii() for x in lines(lg))
leg={n:p['meta'].get('legend','') for n,p in pts.items()}
xs=[p['x'] for p in pts.values()]; ys=[p['y'] for p in pts.values()]
pad=32; minx,maxx,miny,maxy=min(xs)-pad,max(xs)+pad,min(ys)-pad,max(ys)+pad
W,H=maxx-minx,maxy-miny
esc=lambda t:t.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
o=[f'<svg xmlns="http://www.w3.org/2000/svg" width="1800" viewBox="0 0 {W:.1f} {H+14:.1f}" font-family="Helvetica, Arial, sans-serif"><rect width="{W:.1f}" height="{H+14:.1f}" fill="#2b2d31"/>']
count={False:0,True:0}
for n,p in pts.items():
    side=bool(p['meta'].get('mirrored')); count[side]+=1; num=('R' if side else 'L')+str(count[side])
    w=p['meta']['width']+1; h=p['meta']['height']+1; lg=leg[n]
    rr=p['r']
    if h>w+1:  # tall key = a normal wide keycap turned 90°: draw it wide and rotate the whole cap
        w,h=h,w
        rr=min((rr+90, rr-90), key=lambda t: abs(((t+180)%360)-180))
    base,top,ink=('#7d8189','#8f939b','#f2f2f2') if is_mod(lg) else ('#e8e2d0','#f6f1e2','#2f2f2f')
    if lg in ACCENT: base,top,ink=('#b8433a','#cc5146','#fff')
    cx,cy=p['x']-minx,maxy-p['y']
    o.append(f'<g transform="translate({cx:.2f},{cy:.2f}) rotate({-rr})"><rect x="{-w/2+.5:.2f}" y="{-h/2+.5:.2f}" width="{w-1:.2f}" height="{h-1:.2f}" rx="1.6" fill="{base}" stroke="#1b1c1f" stroke-width=".3"/><rect x="{-w/2+2.6:.2f}" y="{-h/2+1.6:.2f}" width="{w-5.2:.2f}" height="{h-5.8:.2f}" rx="1.4" fill="{top}"/>')
    ls=[l for l in lines(lg) if l]
    fs=3.6 if len(ls)==1 and len(ls[0])<=2 else (2.6 if len(ls[0])>5 else 2.9)
    for i,l in enumerate(ls[:2]):
        o.append(f'<text x="{-w/2+4:.2f}" y="{-h/2+6.2+i*5.6:.2f}" font-size="{fs}" fill="{ink}">{esc(l)}</text>')
    sz=f'{w/U:.2f}'.rstrip('0').rstrip('.')+'U'
    o.append(f'<text x="{-w/2+3.4:.2f}" y="{h/2-2.2:.2f}" font-size="2.2" fill="{ink}" opacity=".6">{num}</text>')
    if w>U+1 or h>U+1: o.append(f'<text x="{w/2-3.4:.2f}" y="{h/2-2.2:.2f}" font-size="2.2" text-anchor="end" fill="{ink}" opacity=".6">{sz}</text>')
    o.append('</g>')
o.append(f'<text x="8" y="{H+8:.1f}" font-size="4" fill="#c9cbd1">{esc(title)} · {len(pts)} keys</text></svg>')
open(out_svg,'w').write(''.join(o))
