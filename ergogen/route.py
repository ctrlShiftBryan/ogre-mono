# Autoroutes one section of the routed board (routing/left.kicad_pcb) with
# Freerouting, leaving every trace already on the board where it is.
#   python3 route.py <section> [passes]
# A section names the parts it routes between and the nets it routes. Every
# other pad is left unconnected for the run, the board's traces are locked
# (the DSN marks them protected, so Freerouting keeps them), and the board goes
# to Freerouting as Specctra DSN, routed headless. The session's traces replace
# the board's, the pads get their nets back, and KiCad's DRC reports what the
# section left unrouted and any errors. Review in KiCad (File > Revert to reload).
# Needs KiCad's Python module (pcbnew) and Freerouting's jar (FREEROUTING, or
# ~/.local/share/freerouting/freerouting-*.jar).
import glob
import json
import os
import re
import subprocess
import sys
import tempfile

import pcbnew

HERE = os.path.dirname(os.path.abspath(__file__))
BOARD = os.path.join(HERE, 'routing/left.kicad_pcb')

KEYS = r'^(MX|S|D)\d+$'   # the switches, their sockets and diodes
SECTIONS = {
    # col socket to socket, each socket to its diode, row diode to diode
    'matrix': {'parts': KEYS, 'nets': r'^(col\d+|row\d+|matrix_\w+|thumb_\w+)$'},
}

# DRC findings that are the design, not the routing: the switches' pin holes sit
# inside their sockets' courtyards, and the footprints aren't in a KiCad library
EXPECTED = {'npth_inside_courtyard', 'lib_footprint_issues'}


def freerouting():
    jar = os.environ.get('FREEROUTING') or next(iter(sorted(glob.glob(
        os.path.expanduser('~/.local/share/freerouting/freerouting-*.jar')), reverse=True)), None)
    if not jar:
        sys.exit('Freerouting not found: set FREEROUTING to its jar')
    return jar


def tracks(board):
    """The board's tracks and vias, by index: iterating them fails in KiCad 10's bindings."""
    items = board.Tracks()
    return [items[i].Cast() for i in range(len(items))]


def block(text, start):
    """End of the parenthesized block opening at text[start]."""
    depth = 0
    for i in range(start, len(text)):
        depth += {'(': 1, ')': -1}.get(text[i], 0)
        if depth == 0:
            return i + 1


def um(v):
    return f'{pcbnew.ToMM(v) * 1000:.1f}'


def points(chain):   # DSN's y runs up
    return ' '.join(f'{um(chain.CPoint(i).x)} {um(-chain.CPoint(i).y)}' for i in range(chain.PointCount()))


def fix_dsn(board, dsn):
    """Two things KiCad's DSN gets past Freerouting wrong, put right:
    - the outline's arcs go over as coarse chords, so traces crowd the edge
      where it curves: the outline goes over from KiCad's fine polygon instead,
      pulled in 0.1 mm for rounding, and the pocket cut out of it as a keepout
      grown by the edge clearance less the trace clearance Freerouting keeps
      from a keepout
    - a hole's keepout sits in its footprint, and Freerouting misplaces it on a
      footprint turned off a right angle (the fanned thumbs): each hole's
      keepout goes over at its absolute spot instead, drill + hole clearance"""
    text = open(dsn).read()
    structure = text.index('(structure')
    for opening in ('(boundary', '(keepout "" (polygon'):
        while (at := text.find(opening, structure, text.index('(placement'))) != -1:
            text = text[:at] + text[block(text, at):]
    text = re.sub(r'\n\s*\(keepout "" \(circle [FB]\.Cu [^()]*\)\)', '', text)

    settings, rounding = board.GetDesignSettings(), pcbnew.FromMM(0.1)
    trace_clearance = pcbnew.FromMM(int(re.search(r'\(clearance (\d+)\)', text[structure:]).group(1)) / 1000)
    outline, pockets = pcbnew.SHAPE_POLY_SET(), pcbnew.SHAPE_POLY_SET()
    board.GetBoardPolygonOutlines(outline, False)
    for h in range(outline.HoleCount(0)):
        pockets.AddOutline(outline.Hole(0, h))
    corners, error = pcbnew.CORNER_STRATEGY_ROUND_ALL_CORNERS, pcbnew.FromMM(0.005)
    outline.Deflate(rounding, corners, error)
    pockets.Inflate(settings.m_CopperEdgeClearance - trace_clearance + rounding, corners, error)
    added = [f'(boundary (path pcb 0 {points(outline.Outline(0))}))']
    added += [f'(keepout "" (polygon signal 0 {points(pockets.Outline(p))}))' for p in range(pockets.OutlineCount())]
    clearance = settings.m_HoleClearance
    for fp in board.GetFootprints():
        for pad in fp.Pads():
            if pad.GetAttribute() == pcbnew.PAD_ATTRIB_NPTH:
                d, at = pad.GetDrillSizeX() + 2 * clearance, pad.GetPosition()
                added += [f'(keepout "" (circle {layer} {um(d)} {um(at.x)} {um(-at.y)}))'
                          for layer in ('F.Cu', 'B.Cu')]
    via = text.index('(via ', structure)
    text = text[:via] + '\n    '.join(added) + '\n    ' + text[via:]
    open(dsn, 'w').write(text)


def route(name, passes):
    section = SECTIONS[name]
    tmp = tempfile.mkdtemp(prefix=f'route-{name}-')
    dsn, ses = os.path.join(tmp, 'board.dsn'), os.path.join(tmp, 'board.ses')

    # cut the board down to the section (removing footprints breaks KiCad 10's
    # bindings, so other pads are left unconnected instead) and lock its traces
    board = pcbnew.LoadBoard(BOARD)
    parts, nets = re.compile(section['parts']), re.compile(section['nets'])
    cut = []
    for fp in board.GetFootprints():
        for pad in fp.Pads():
            if not (parts.match(fp.GetReference()) and nets.match(pad.GetNetname())):
                cut.append((pad, pad.GetNetCode()))
                pad.SetNetCode(0)
    for track in tracks(board):
        track.SetLocked(True)
    if not pcbnew.ExportSpecctraDSN(board, dsn):
        sys.exit('DSN export failed')
    fix_dsn(board, dsn)

    subprocess.run(['java', '-jar', freerouting(), '-de', dsn, '-do', ses, '-mp', str(passes),
                    '--gui.enabled=false', '--api_server.enabled=false',
                    '--usage_and_diagnostic_data.disable_analytics=true'], check=True)
    if not os.path.exists(ses):
        sys.exit('Freerouting wrote no session')

    # the session's traces replace the board's (the locked ones come back with
    # it); Freerouting necks a trace down now and then, so widen those back
    if not pcbnew.ImportSpecctraSES(board, ses):
        sys.exit('session import failed')
    for pad, code in cut:
        pad.SetNetCode(code)
    width = board.GetDesignSettings().m_TrackMinWidth
    for track in tracks(board):
        track.SetLocked(False)
        if track.Type() == pcbnew.PCB_TRACE_T and track.GetWidth() < width:
            track.SetWidth(width)
    pcbnew.SaveBoard(BOARD, board)
    report(name, section, tmp)


def report(name, section, tmp):
    drc = os.path.join(tmp, 'drc.json')
    subprocess.run(['kicad-cli', 'pcb', 'drc', '--format', 'json', '--severity-all', '-o', drc, BOARD],
                   capture_output=True, check=True)
    result = json.load(open(drc))
    parts, nets = re.compile(section['parts']), re.compile(section['nets'])

    def in_section(item):   # a pad of one of the section's parts, or a trace on its nets
        d = item['description']
        ref, net = re.search(r' of (\S+)', d), re.search(r'\[([^\]]*)\]', d)
        return (parts.match(ref.group(1)) if ref else True) and net and nets.match(net.group(1))

    unrouted = [v for v in result.get('unconnected_items', []) if all(in_section(i) for i in v['items'])]
    errors = [v for v in result.get('violations', [])
              if v['severity'] == 'error' and v['type'] not in EXPECTED]
    print(f'{name}: {len(unrouted)} unrouted connections, {len(errors)} DRC errors')
    for v in unrouted:
        print('  unrouted: ' + ' -> '.join(i['description'] for i in v['items']))
    for v in errors:
        print(f"  {v['type']}: {'; '.join(i['description'] for i in v['items'])}")


if __name__ == '__main__':
    if len(sys.argv) < 2 or sys.argv[1] not in SECTIONS:
        sys.exit(f'usage: route.py <{"|".join(SECTIONS)}> [passes]')
    route(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 20)
