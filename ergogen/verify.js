// Checks ogre-ergo.yaml against the switch positions on the as-built PCB
// (ctrlShiftBryan/ogre-v1, ogre-v1.kicad_pcb). Usage: npm run verify
const fs = require('fs')
const path = require('path')
const ergogen = require('ergogen')

// [ref, size (u), x, y, rotation] in KiCad mm, y down. Vertical thumb
// footprints carry an extra 90° because the footprints are drawn horizontal.
const PCB = [
  ['MX0', 1, 117.45, 47.83, 0], ['MX1', 1, 288.9, 47.83, 0], ['MX2', 1, 98.4, 50.21, 0],
  ['MX3', 1, 136.5, 50.21, 0], ['MX4', 1, 269.85, 50.21, 0], ['MX5', 1, 307.95, 50.21, 0],
  ['MX6', 1, 155.55, 52.59, 0], ['MX7', 1, 174.6, 52.59, 0], ['MX8', 1, 231.75, 52.59, 0],
  ['MX9', 1, 250.8, 52.59, 0], ['MX10', 1, 60.3, 54.97, 0], ['MX11', 1, 79.35, 54.97, 0],
  ['MX12', 1, 327, 54.97, 0], ['MX13', 1, 346.05, 54.97, 0], ['MX62', 1, 41.25, 54.97, 0],
  ['MX63', 1, 365.1, 54.97, 0],
  ['MX14', 1, 117.45, 66.87, 0], ['MX15', 1, 288.9, 66.87, 0], ['MX16', 1, 98.4, 69.26, 0],
  ['MX17', 1, 136.5, 69.26, 0], ['MX18', 1, 269.85, 69.26, 0], ['MX19', 1, 307.95, 69.26, 0],
  ['MX20', 1, 155.55, 71.64, 0], ['MX21', 1, 174.6, 71.64, 0], ['MX22', 1, 231.75, 71.64, 0],
  ['MX23', 1, 250.8, 71.64, 0], ['MX24', 1.5, 55.54, 74.02, 0], ['MX25', 1, 79.35, 74.02, 0],
  ['MX26', 1, 327, 74.02, 0], ['MX27', 1.5, 350.81, 74.02, 0],
  ['MX28', 1, 117.45, 85.93, 0], ['MX29', 1, 288.9, 85.93, 0], ['MX30', 1, 98.4, 88.31, 0],
  ['MX31', 1, 136.5, 88.31, 0], ['MX32', 1, 269.85, 88.31, 0], ['MX33', 1, 307.95, 88.31, 0],
  ['MX34', 1, 155.55, 90.69, 0], ['MX35', 1, 250.8, 90.69, 0], ['MX40', 1, 174.6, 90.69, 0],
  ['MX41', 1, 231.75, 90.69, 0], ['MX36', 1.75, 53.16, 93.07, 0], ['MX37', 1, 79.35, 93.07, 0],
  ['MX38', 1, 327, 93.07, 0], ['MX39', 1.75, 353.19, 93.07, 0],
  ['MX42', 1, 117.45, 104.97, 0], ['MX43', 1, 288.9, 104.97, 0], ['MX44', 1, 98.4, 107.36, 0],
  ['MX45', 1, 136.5, 107.36, 0], ['MX46', 1, 269.85, 107.36, 0], ['MX47', 1, 307.95, 107.36, 0],
  ['MX48', 1, 155.55, 109.74, 0], ['MX49', 1, 250.8, 109.74, 0], ['MX50', 2.25, 48.39, 112.12, 0],
  ['MX51', 1, 79.35, 112.12, 0], ['MX52', 1, 327, 112.12, 0], ['MX53', 2.25, 357.96, 112.12, 0],
  ['MX54', 1, 117.45, 124.02, 0], ['MX55', 1, 288.9, 124.02, 0], ['MX56', 1, 98.4, 126.41, 0],
  ['MX57', 1, 307.95, 126.41, 0], ['MX58', 1.25, 57.92, 131.17, 0], ['MX59', 1, 79.35, 131.17, 0],
  ['MX60', 1, 327, 131.17, 0], ['MX61', 1.25, 348.43, 131.17, 0],
  ['MX66', 1.25, 141.43, 134.5, -30], ['MX69', 1.25, 264.92, 134.5, 30],
  ['MX70', 2.25, 168.8, 136.56, -120], ['MX72', 2.25, 237.55, 136.56, 120],
  ['MX76', 1.5, 181.72, 152.27, -120], ['MX78', 1.5, 224.62, 152.27, 120],
]
const ORIGIN = { pcb: 'MX54', point: 'matrix_middle_mod' } // left C-row-below key
const TOL = 0.02 // mm; KiCad positions are rounded to 0.01

;(async () => {
  const yaml = fs.readFileSync(path.join(__dirname, 'ogre-ergo.yaml'), 'utf8')
  const { points } = await ergogen.process(yaml, { debug: true })
  const keys = Object.entries(points).filter(([, p]) => !p.meta.skip)
  const o = points[ORIGIN.point], po = PCB.find(r => r[0] === ORIGIN.pcb)
  const norm = r => ((r % 180) + 180) % 180 // footprint rotation is 180°-symmetric
  const errors = []
  if (keys.length !== PCB.length) errors.push(`key count ${keys.length}, expected ${PCB.length}`)
  const used = new Set()
  let worst = 0
  for (const [name, p] of keys) {
    const x = po[2] + (p.x - o.x), y = po[3] - (p.y - o.y)
    const [ref, size, px, py, pr] = PCB.reduce((a, b) =>
      Math.hypot(b[2] - x, b[3] - y) < Math.hypot(a[2] - x, a[3] - y) ? b : a)
    const d = Math.hypot(px - x, py - y)
    worst = Math.max(worst, d)
    const u = (Math.max(p.meta.width, p.meta.height) + 1) / 19.05
    if (d > TOL) errors.push(`${name}: ${d.toFixed(3)} mm from ${ref}`)
    if (used.has(ref)) errors.push(`${name}: ${ref} matched twice`)
    if (Math.abs(u - size) > 1e-6) errors.push(`${name}: ${u}u, ${ref} is ${size}u`)
    if (norm(p.r) !== norm(pr) && norm(p.r) !== norm(pr + 90)) errors.push(`${name}: rot ${p.r}, ${ref} is ${pr}`)
    used.add(ref)
  }
  console.log(`${keys.length} keys, worst position error ${worst.toFixed(3)} mm`)
  if (errors.length) { console.error(errors.join('\n')); process.exit(1) }
  console.log('OK: matches the as-built PCB')
})()
