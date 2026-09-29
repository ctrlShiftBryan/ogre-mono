# Throwaway autoroute of every net but GND on a placed board, with an antenna keepout.
#   python3 trial.py <board.kicad_pcb> [passes]    (routes the board in place)
import os, sys, re, pcbnew
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../..'))
import route
board_path = sys.argv[1]
b = pcbnew.LoadBoard(board_path)
m = b.FindFootprintByReference('MCU1')
p1 = next(p for p in m.Pads() if p.GetNumber() == '1'); bb = m.GetCourtyard(pcbnew.B_CrtYd).BBox()
x0, y0, y1 = p1.GetPosition().x + pcbnew.FromMM(1.0), bb.GetTop() - pcbnew.FromMM(3), bb.GetBottom() + pcbnew.FromMM(3)
x1 = b.GetBoardEdgesBoundingBox().GetRight() + pcbnew.FromMM(1)
z = pcbnew.ZONE(b); z.SetIsRuleArea(True); z.SetDoNotAllowTracks(True); z.SetDoNotAllowVias(True); z.SetDoNotAllowZoneFills(True)
z.SetLayerSet(pcbnew.LSET.AllCuMask()) if hasattr(pcbnew.LSET, 'AllCuMask') else None
ol = z.Outline(); ol.NewOutline()
for x, y in ((x0, y0), (x1, y0), (x1, y1), (x0, y1)): ol.Append(x, y)
b.Add(z); pcbnew.SaveBoard(board_path, b)
route.BOARD = board_path
route.SECTIONS['all'] = {'parts': r'.*', 'nets': r'^(?!GND$).+'}
route.route('all', int(sys.argv[2]) if len(sys.argv) > 2 else 30)
