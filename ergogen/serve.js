// Live viewer for the local design: watches config.yaml and footprints/,
// rebuilds on save and serves the layout, keycaps, outlines and PCB.
// The files in this folder stay the source of truth; nothing is uploaded.
// Usage: npm run serve   -> http://localhost:5174   (PORT=... to change)
const fs = require('fs')
const path = require('path')
const http = require('http')
const { execFile, execFileSync } = require('child_process')
const { run, write, OUT } = require('./build')

const here = __dirname
const PORT = +(process.env.PORT || 5174)
const PCB = path.join(OUT, 'pcbs/ogre.kicad_pcb')
const LAYERS = {
  all: 'Edge.Cuts,F.Cu,B.Cu,F.SilkS,B.SilkS',
  front: 'Edge.Cuts,F.Cu,F.SilkS',
  back: 'Edge.Cuts,B.Cu,B.SilkS',
  outline: 'Edge.Cuts,F.SilkS'
}
const kicad = ['kicad-cli', '/Applications/KiCad/KiCad.app/Contents/MacOS/kicad-cli']
  .find(c => { try { execFileSync(c, ['version'], { stdio: 'ignore' }); return true } catch { return false } })

let state = { ok: false, building: true, error: null, at: null, ms: 0, keys: 0 }
let clients = []
const cache = new Map()
const broadcast = () => {
  const line = `data: ${JSON.stringify(state)}\n\n`
  clients = clients.filter(res => { try { res.write(line); return true } catch { return false } })
}

const build = async () => {
  state = { ...state, building: true }; broadcast()
  const t = Date.now()
  try {
    const results = await run()
    write(results, OUT)
    cache.clear()
    state = { ok: true, building: false, error: null, at: new Date().toLocaleTimeString(), ms: Date.now() - t, keys: Object.keys(results.points).length }
  } catch (e) {
    state = { ...state, ok: false, building: false, error: String(e && e.message || e), at: new Date().toLocaleTimeString() }
  }
  console.log(state.ok ? `build ok — ${state.keys} keys, ${state.ms} ms` : `build FAILED — ${state.error.split('\n')[0]}`)
  broadcast()
}

// derived views, rebuilt on demand and dropped on every build
const derive = (key, fn) => {
  if (!cache.has(key)) cache.set(key, fn())
  return cache.get(key)
}
const keycaps = () => derive('keycaps', () => {
  const out = path.join(OUT, 'keycaps.svg')
  execFileSync('python3', [path.join(here, 'render_keycaps.py'), path.join(OUT, 'points/points.yaml'), out, 'Ogre Ergo'])
  return fs.readFileSync(out)
})
const pcbSvg = which => derive(`pcb:${which}`, () => {
  if (!kicad) throw new Error('kicad-cli not found — PCB preview needs KiCad installed')
  const out = path.join(OUT, `pcb-${which}.svg`)
  execFileSync(kicad, ['pcb', 'export', 'svg', '--mode-single', '--exclude-drawing-sheet',
    '--page-size-mode', '2', '--fit-page-to-board', '-l', LAYERS[which] || LAYERS.all, '-o', out, PCB], { stdio: 'ignore' })
  return fs.readFileSync(out)
})

// ergogen draws black on transparent, which disappears on a dark page:
// the root <g> carries one stroke="#000" and one inline stroke:#000
const INK = '#cfd4de'
const tint = buf => Buffer.from(String(buf).replace(/stroke="#000"/g, `stroke="${INK}"`).replace(/stroke:#000/g, `stroke:${INK}`))

const script = name => new Promise(resolve => {
  execFile('node', [path.join(here, name)], { cwd: here, maxBuffer: 16e6 }, (err, stdout, stderr) =>
    resolve(`${stdout}${stderr}${err && !stdout && !stderr ? String(err) : ''}`.trim() || '(no output)'))
})

const send = (res, code, type, body) => { res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' }); res.end(body) }
const svg = (res, fn) => {
  try { send(res, 200, 'image/svg+xml', fn()) }
  catch (e) { send(res, 200, 'image/svg+xml', `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="120"><text x="10" y="40" font-family="monospace" font-size="14" fill="#e06c75">${String(e.message || e).replace(/[<&]/g, '')}</text></svg>`) }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x')
  const p = url.pathname
  if (p === '/') return send(res, 200, 'text/html; charset=utf-8', PAGE)
  if (p === '/state') return send(res, 200, 'application/json', JSON.stringify(state))
  if (p === '/events') {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' })
    res.write(`data: ${JSON.stringify(state)}\n\n`)
    clients.push(res)
    req.on('close', () => { clients = clients.filter(c => c !== res) })
    return
  }
  if (p === '/rebuild') { await build(); return send(res, 200, 'application/json', JSON.stringify(state)) }
  if (p === '/verify' || p === '/check') return send(res, 200, 'text/plain; charset=utf-8', await script(p === '/verify' ? 'verify.js' : 'check-pcb.js'))
  if (p === '/outlines') {
    const dir = path.join(OUT, 'outlines')
    const names = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.svg')).map(f => f.slice(0, -4)) : []
    return send(res, 200, 'application/json', JSON.stringify(names))
  }
  if (p === '/svg/keycaps') return svg(res, keycaps)
  if (p === '/svg/points') return svg(res, () => tint(fs.readFileSync(path.join(OUT, 'points/demo.svg'))))
  if (p.startsWith('/svg/outline/')) return svg(res, () => tint(fs.readFileSync(path.join(OUT, 'outlines', `${path.basename(p)}.svg`))))
  if (p.startsWith('/svg/pcb/')) return svg(res, () => pcbSvg(path.basename(p)))
  if (p === '/file/pcb') return send(res, 200, 'text/plain; charset=utf-8', fs.readFileSync(PCB))
  send(res, 404, 'text/plain', 'not found')
})

// watch config.yaml and footprints/ (directory watches survive editors that write via rename)
let timer = null
const touched = () => { clearTimeout(timer); timer = setTimeout(build, 150) }
fs.watch(here, (_, f) => { if (f === 'config.yaml') touched() })
fs.watch(path.join(here, 'footprints'), (_, f) => { if (f && f.endsWith('.js')) touched() })

build().then(() => server.listen(PORT, () => console.log(`watching config.yaml + footprints/ — http://localhost:${PORT}`)))

const PAGE = `<!doctype html>
<html><head><meta charset="utf-8"><title>Ogre 68 — live</title><style>
:root { color-scheme: dark; --bg:#17181c; --panel:#1f2127; --line:#2e313a; --ink:#e6e8ee; --dim:#9aa0ac; --ok:#7ec699; --bad:#e06c75; --acc:#6ea8fe }
* { box-sizing: border-box }
body { margin:0; background:var(--bg); color:var(--ink); font:13px/1.5 ui-sans-serif, system-ui, sans-serif }
header { display:flex; align-items:center; gap:8px 10px; padding:6px 12px; background:var(--panel); border-bottom:1px solid var(--line); flex-wrap:wrap }
h1 { font-size:13px; margin:0; font-weight:600; letter-spacing:.02em; white-space:nowrap }
.tabs, .group { display:flex; align-items:center; gap:4px }
.group { margin-left:auto }
button, select { background:#272a31; color:var(--ink); border:1px solid var(--line); border-radius:6px; padding:3px 8px; font:inherit; font-size:12px; cursor:pointer; white-space:nowrap }
button:hover, select:hover { border-color:#3c414d }
button.on { background:var(--acc); border-color:var(--acc); color:#10121a; font-weight:600 }
#status { font-variant-numeric:tabular-nums; color:var(--dim) }
#dot { display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--dim); margin-right:6px; vertical-align:middle }
main { position:relative; height:calc(100vh - 43px); overflow:auto; background:#101116; display:flex }
#stage { margin:auto; padding:18px }
#stage img { display:block; background:#fff0; image-rendering:auto; -webkit-user-drag:none; user-select:none }
main { cursor:grab }
#err { display:none; white-space:pre-wrap; font-family:ui-monospace, monospace; color:var(--bad); background:#241a1c; border-bottom:1px solid var(--line); padding:10px 14px }
#out { display:none; position:fixed; left:0; right:0; bottom:0; max-height:45vh; overflow:auto; white-space:pre-wrap;
  font-family:ui-monospace, monospace; font-size:12px; background:#15161b; border-top:1px solid var(--line); padding:10px 14px }
#out .close { position:sticky; top:0; float:right }
</style></head><body>
<header>
  <h1>Ogre 68 <span style="color:var(--dim);font-weight:400">· live from ergogen/</span></h1>
  <div class="tabs" id="tabs"></div>
  <select id="opt"></select>
  <div class="group">
    <button id="zout">−</button><button id="zfit">fit</button><button id="zin">+</button>
    <button id="verify">verify</button><button id="check">check</button><button id="rebuild">rebuild</button>
    <span id="status"><span id="dot"></span><span id="msg">starting…</span></span>
  </div>
</header>
<div id="err"></div>
<main><div id="stage"><img id="img" alt=""></div></main>
<div id="out"><button class="close" onclick="document.getElementById('out').style.display='none'">close</button><span id="outtext"></span></div>
<script>
var TABS = [['keycaps','Keycaps'],['points','Points'],['outline','Outline'],['pcb','PCB']];
var view = 'keycaps', outline = 'board', layers = 'all', zoom = 1, bust = Date.now();
var img = document.getElementById('img'), opt = document.getElementById('opt');
var main = document.querySelector('main');
var tabs = document.getElementById('tabs');
TABS.forEach(function (t) {
  var b = document.createElement('button');
  b.textContent = t[1]; b.dataset.v = t[0];
  b.onclick = function () { view = t[0]; render(); };
  tabs.appendChild(b);
});
function options() {
  if (view === 'pcb') return Promise.resolve([['all','all layers'],['front','front'],['back','back'],['outline','edge + silk']]);
  if (view === 'outline') return fetch('/outlines').then(function (r) { return r.json(); })
    .then(function (ns) { return ns.map(function (n) { return [n, n]; }); });
  return Promise.resolve([]);
}
function render() {
  Array.prototype.forEach.call(tabs.children, function (b) { b.className = b.dataset.v === view ? 'on' : ''; });
  options().then(function (list) {
    opt.style.display = list.length ? '' : 'none';
    if (list.length) {
      var cur = view === 'pcb' ? layers : outline;
      opt.innerHTML = list.map(function (o) {
        return '<option value="' + o[0] + '"' + (o[0] === cur ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('');
    }
    var src = view === 'pcb' ? '/svg/pcb/' + layers
      : view === 'outline' ? '/svg/outline/' + outline
      : '/svg/' + view;
    img.src = src + '?b=' + bust;
  });
}
opt.onchange = function () { if (view === 'pcb') layers = opt.value; else outline = opt.value; render(); };
img.onload = function () { if (zoom === 1) fit(); else apply(); };
function apply() { img.style.width = Math.round(img.naturalWidth * zoom) + 'px'; }
function fit() {
  zoom = Math.min((main.clientWidth - 40) / img.naturalWidth, (main.clientHeight - 40) / img.naturalHeight);
  apply();
}
// zoom about a point (default: the middle of the pane), keeping it under the cursor
function zoomAt(factor, clientX, clientY) {
  var r = img.getBoundingClientRect(), m = main.getBoundingClientRect();
  if (clientX === undefined) { clientX = m.left + m.width / 2; clientY = m.top + m.height / 2; }
  var ix = clientX - r.left, iy = clientY - r.top;
  zoom *= factor; apply();
  main.scrollLeft += ix * (factor - 1);
  main.scrollTop += iy * (factor - 1);
}
document.getElementById('zin').onclick = function () { zoomAt(1.3); };
document.getElementById('zout').onclick = function () { zoomAt(1 / 1.3); };
document.getElementById('zfit').onclick = fit;

// drag to pan, wheel to zoom, double click to fit
var drag = null;
main.addEventListener('pointerdown', function (e) {
  drag = { x: e.clientX, y: e.clientY, l: main.scrollLeft, t: main.scrollTop };
  main.setPointerCapture(e.pointerId); main.style.cursor = 'grabbing'; e.preventDefault();
});
main.addEventListener('pointermove', function (e) {
  if (!drag) return;
  main.scrollLeft = drag.l - (e.clientX - drag.x);
  main.scrollTop = drag.t - (e.clientY - drag.y);
});
['pointerup', 'pointercancel'].forEach(function (t) {
  main.addEventListener(t, function () { drag = null; main.style.cursor = ''; });
});
main.addEventListener('wheel', function (e) {
  e.preventDefault();
  zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX, e.clientY);
}, { passive: false });
main.addEventListener('dblclick', fit);
document.getElementById('rebuild').onclick = function () { fetch('/rebuild'); };
['verify','check'].forEach(function (name) {
  document.getElementById(name).onclick = function () {
    show('running ' + name + '…');
    fetch('/' + name).then(function (r) { return r.text(); }).then(show);
  };
});
function show(text) {
  document.getElementById('out').style.display = 'block';
  document.getElementById('outtext').textContent = text;
}
var lastAt = null;
new EventSource('/events').onmessage = function (e) {
  var s = JSON.parse(e.data);
  document.getElementById('dot').style.background = s.building ? 'var(--acc)' : s.ok ? 'var(--ok)' : 'var(--bad)';
  document.getElementById('msg').textContent = s.building ? 'building…'
    : s.ok ? s.keys + ' keys · ' + s.ms + ' ms · ' + s.at : 'build failed · ' + s.at;
  var err = document.getElementById('err');
  err.style.display = s.error ? 'block' : 'none';
  err.textContent = s.error || '';
  if (s.ok && !s.building && s.at !== lastAt) { lastAt = s.at; bust = Date.now(); render(); }
};
render();
</script></body></html>`
