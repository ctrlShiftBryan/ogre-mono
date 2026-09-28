// Guards the Ogre 68 against geometry it did not mean to change: compares the
// build with points.snapshot.json and fails on any difference. A change you
// meant to make is a new baseline, written by `npm run snapshot:update`.
// Usage: npm run snapshot [-- --update]
const fs = require('fs')
const path = require('path')
const { run } = require('./build')

const FILE = path.join(__dirname, 'points.snapshot.json')
const TOL = 0.001 // mm / degrees
const round = n => +n.toFixed(4)

const take = points => Object.fromEntries(Object.keys(points).sort().map(k => {
  const p = points[k]
  return [k, { x: round(p.x), y: round(p.y), r: round(p.r), w: round(p.meta.width), h: round(p.meta.height) }]
}))

;(async () => {
  const now = take((await run()).points)
  const update = process.argv.includes('--update')

  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify(now, null, 1) + '\n')
    console.log(`Wrote the first baseline: ${Object.keys(now).length} keys`)
    return
  }

  const was = JSON.parse(fs.readFileSync(FILE, 'utf8'))
  const drift = []
  for (const key of Object.keys(was)) if (!now[key]) drift.push(`gone:    ${key}`)
  for (const key of Object.keys(now)) {
    if (!was[key]) { drift.push(`new:     ${key}`); continue }
    const diffs = ['x', 'y', 'r', 'w', 'h']
      .filter(f => Math.abs(now[key][f] - was[key][f]) > TOL)
      .map(f => `${f} ${was[key][f]} -> ${now[key][f]}`)
    if (diffs.length) drift.push(`changed: ${key}: ${diffs.join(', ')}`)
  }

  if (!drift.length) { console.log(`No drift: ${Object.keys(now).length} keys match the baseline`); return }

  console.log(drift.join('\n'))
  if (update) {
    fs.writeFileSync(FILE, JSON.stringify(now, null, 1) + '\n')
    console.log(`\nNew baseline written: ${drift.length} changes, ${Object.keys(now).length} keys`)
    return
  }
  console.error(`\n${drift.length} keys differ from the baseline. Meant to change them? ` +
    `Run \`npm run snapshot:update\` and commit the new points.snapshot.json.`)
  process.exit(1)
})()
