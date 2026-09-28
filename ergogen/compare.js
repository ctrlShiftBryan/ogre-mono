// Reports how the Ogre 68 differs from the as-built 70-key PCB
// (ctrlShiftBryan/ogre-v1, ogre-v1.kicad_pcb): which keys still sit where that
// board put them, which moved or changed size, which went, which are new.
// The as-built board was the starting point, not the specification, so this
// prints an account and never fails. `npm run snapshot` is the gate that
// catches geometry the design didn't mean to change. Usage: npm run compare
const { run } = require('./build')

const U = 19.05

// ref: [size (u), x, y, rotation] in KiCad mm, y down. Vertical thumb
// footprints carry an extra 90° because the footprints are drawn horizontal.
const PCB = {
  MX0: [1, 117.45, 47.83, 0], MX1: [1, 288.9, 47.83, 0], MX2: [1, 98.4, 50.21, 0],
  MX3: [1, 136.5, 50.21, 0], MX4: [1, 269.85, 50.21, 0], MX5: [1, 307.95, 50.21, 0],
  MX6: [1, 155.55, 52.59, 0], MX7: [1, 174.6, 52.59, 0], MX8: [1, 231.75, 52.59, 0],
  MX9: [1, 250.8, 52.59, 0], MX10: [1, 60.3, 54.97, 0], MX11: [1, 79.35, 54.97, 0],
  MX12: [1, 327, 54.97, 0], MX13: [1, 346.05, 54.97, 0], MX62: [1, 41.25, 54.97, 0],
  MX63: [1, 365.1, 54.97, 0],
  MX14: [1, 117.45, 66.87, 0], MX15: [1, 288.9, 66.87, 0], MX16: [1, 98.4, 69.26, 0],
  MX17: [1, 136.5, 69.26, 0], MX18: [1, 269.85, 69.26, 0], MX19: [1, 307.95, 69.26, 0],
  MX20: [1, 155.55, 71.64, 0], MX21: [1, 174.6, 71.64, 0], MX22: [1, 231.75, 71.64, 0],
  MX23: [1, 250.8, 71.64, 0], MX24: [1.5, 55.54, 74.02, 0], MX25: [1, 79.35, 74.02, 0],
  MX26: [1, 327, 74.02, 0], MX27: [1.5, 350.81, 74.02, 0],
  MX28: [1, 117.45, 85.93, 0], MX29: [1, 288.9, 85.93, 0], MX30: [1, 98.4, 88.31, 0],
  MX31: [1, 136.5, 88.31, 0], MX32: [1, 269.85, 88.31, 0], MX33: [1, 307.95, 88.31, 0],
  MX34: [1, 155.55, 90.69, 0], MX35: [1, 250.8, 90.69, 0], MX40: [1, 174.6, 90.69, 0],
  MX41: [1, 231.75, 90.69, 0], MX36: [1.75, 53.16, 93.07, 0], MX37: [1, 79.35, 93.07, 0],
  MX38: [1, 327, 93.07, 0], MX39: [1.75, 353.19, 93.07, 0],
  MX42: [1, 117.45, 104.97, 0], MX43: [1, 288.9, 104.97, 0], MX44: [1, 98.4, 107.36, 0],
  MX45: [1, 136.5, 107.36, 0], MX46: [1, 269.85, 107.36, 0], MX47: [1, 307.95, 107.36, 0],
  MX48: [1, 155.55, 109.74, 0], MX49: [1, 250.8, 109.74, 0], MX50: [2.25, 48.39, 112.12, 0],
  MX51: [1, 79.35, 112.12, 0], MX52: [1, 327, 112.12, 0], MX53: [2.25, 357.96, 112.12, 0],
  MX54: [1, 117.45, 124.02, 0], MX55: [1, 288.9, 124.02, 0], MX56: [1, 98.4, 126.41, 0],
  MX57: [1, 307.95, 126.41, 0], MX58: [1.25, 57.92, 131.17, 0], MX59: [1, 79.35, 131.17, 0],
  MX60: [1, 327, 131.17, 0], MX61: [1.25, 348.43, 131.17, 0],
  MX66: [1.25, 141.43, 134.5, -30], MX69: [1.25, 264.92, 134.5, 30],
  MX70: [2.25, 168.8, 136.56, -120], MX72: [2.25, 237.55, 136.56, 120],
  MX76: [1.5, 181.72, 152.27, -120], MX78: [1.5, 224.62, 152.27, 120],
}

// ergogen key (left half) -> [left PCB ref, right PCB ref]
const KEYS = {
  matrix_far_num: ['MX62', 'MX63'],
  matrix_outer_num: ['MX10', 'MX13'], matrix_outer_top: ['MX24', 'MX27'],
  matrix_outer_home: ['MX36', 'MX39'], matrix_outer_bottom: ['MX50', 'MX53'],
  matrix_outer_mod: ['MX58', 'MX61'],
  matrix_pinky_num: ['MX11', 'MX12'], matrix_pinky_top: ['MX25', 'MX26'],
  matrix_pinky_home: ['MX37', 'MX38'], matrix_pinky_bottom: ['MX51', 'MX52'],
  matrix_pinky_mod: ['MX59', 'MX60'],
  matrix_ring_num: ['MX2', 'MX5'], matrix_ring_top: ['MX16', 'MX19'],
  matrix_ring_home: ['MX30', 'MX33'], matrix_ring_bottom: ['MX44', 'MX47'],
  matrix_ring_mod: ['MX56', 'MX57'],
  matrix_middle_num: ['MX0', 'MX1'], matrix_middle_top: ['MX14', 'MX15'],
  matrix_middle_home: ['MX28', 'MX29'], matrix_middle_bottom: ['MX42', 'MX43'],
  matrix_middle_mod: ['MX54', 'MX55'],
  matrix_index_num: ['MX3', 'MX4'], matrix_index_top: ['MX17', 'MX18'],
  matrix_index_home: ['MX31', 'MX32'], matrix_index_bottom: ['MX45', 'MX46'],
  matrix_inner_num: ['MX6', 'MX9'], matrix_inner_top: ['MX20', 'MX23'],
  matrix_inner_home: ['MX34', 'MX35'], matrix_inner_bottom: ['MX48', 'MX49'],
  matrix_extra_num: ['MX7', 'MX8'], matrix_extra_top: ['MX21', 'MX22'],
  matrix_extra_home: ['MX40', 'MX41'],
  thumb_near_cluster: ['MX66', 'MX69'], thumb_home_cluster: ['MX70', 'MX72'],
  thumb_far_cluster: ['MX76', 'MX78'],
}

// The as-built board's mirror distance; the Ogre 68 sets its own (half_spread),
// so the right half's offset follows from the design rather than a constant.
const AS_BUILT_SPREAD = 3 * U

const ORIGIN = { pcb: 'MX54', point: 'matrix_middle_mod' } // left key below C
const TOL = 0.02 // mm; KiCad positions are rounded to 0.01

;(async () => {
  const { points, units } = await run()
  const shift = units.half_spread - AS_BUILT_SPREAD
  const o = points[ORIGIN.point], po = PCB[ORIGIN.pcb]
  const pcbXY = p => [po[1] + (p.x - o.x), po[2] - (p.y - o.y)]
  const size = p => (Math.max(p.meta.width, p.meta.height) + 1) / U
  const norm = r => ((r % 180) + 180) % 180 // footprint rotation is 180°-symmetric
  const fmt = n => +n.toFixed(2)

  const same = [], moved = [], gone = [], added = []
  const seen = new Set()
  let worst = 0
  for (const [name, refs] of Object.entries(KEYS)) {
    for (const [side, key, ref] of [['left', name, refs[0]], ['right', `mirror_${name}`, refs[1]]]) {
      const p = points[key]
      seen.add(key)
      if (!p) { gone.push(`${key} (was ${ref}, ${PCB[ref][0]}U)`); continue }
      const [pSize, px0, py, pr] = PCB[ref]
      const px = px0 + (side === 'right' ? shift : 0)
      const [x, y] = pcbXY(p)
      const d = Math.hypot(px - x, py - y)
      const resized = Math.abs(size(p) - pSize) > 1e-6
      const turned = norm(p.r) !== norm(pr) && norm(p.r) !== norm(pr + 90)
      if (d <= TOL && !resized && !turned) { same.push(key); worst = Math.max(worst, d); continue }
      const what = [
        d > TOL ? `moved ${fmt(d)} mm` : null,
        resized ? `${pSize}U -> ${fmt(size(p))}U` : null,
        turned ? `turned ${fmt(p.r)}°, was ${fmt(pr)}°` : null
      ].filter(Boolean).join(', ')
      moved.push(`${key}: ${what} (${ref})`)
    }
  }
  for (const key of Object.keys(points)) if (!seen.has(key)) added.push(`${key}: ${fmt(size(points[key]))}U`)

  const n = Object.keys(points).length
  console.log(`Ogre 68: ${n} keys. Against the as-built 70-key board, with the right half ` +
    `${fmt(shift)} mm further out (half_spread ${fmt(units.half_spread / U)}U vs 3U as built):\n`)
  console.log(`  ${same.length} in the same place (worst ${worst.toFixed(3)} mm)`)
  console.log(`  ${moved.length} moved or resized`)
  console.log(`  ${gone.length} gone, ${added.length} new\n`)
  for (const line of moved) console.log(`  moved: ${line}`)
  for (const line of gone) console.log(`  gone:  ${line}`)
  for (const line of added) console.log(`  new:   ${line}`)
})()
