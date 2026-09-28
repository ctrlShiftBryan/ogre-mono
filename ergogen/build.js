// Builds config.yaml with the custom footprints in footprints/ and writes
// output/ like the ergogen CLI does (the CLI only picks up footprints when
// given a folder, and this folder also holds node_modules).
// Usage: node build.js            -> output/
//        require('./build').run() -> ergogen results
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const ergogen = require('ergogen')

const here = __dirname

// re-read on every run, so a watcher (serve.js) picks up edited footprints
const inject = () => {
  for (const f of fs.readdirSync(path.join(here, 'footprints'))) {
    if (!f.endsWith('.js')) continue
    const abs = path.join(here, 'footprints', f)
    delete require.cache[require.resolve(abs)]
    ergogen.inject('footprint', f.slice(0, -3), require(abs))
  }
}

const run = () => {
  inject()
  return ergogen.process(fs.readFileSync(path.join(here, 'config.yaml'), 'utf8'), { debug: true, svg: true })
}

const write = (results, out) => {
  fs.rmSync(out, { recursive: true, force: true })
  const put = (rel, data) => {
    const abs = path.join(out, rel)
    fs.mkdirSync(path.dirname(abs), { recursive: true })
    fs.writeFileSync(abs, rel.endsWith('.yaml') ? yaml.dump(data, { indent: 4, noRefs: true }) : data)
  }
  const twodee = (rel, data) => {
    for (const ext of ['yaml', 'svg', 'dxf']) if (data && data[ext]) put(`${rel}.${ext}`, data[ext])
  }
  put('points/points.yaml', results.points)
  put('points/units.yaml', results.units)
  twodee('points/demo', results.demo)
  for (const [name, o] of Object.entries(results.outlines)) twodee(`outlines/${name}`, o)
  for (const [name, pcb] of Object.entries(results.pcbs)) put(`pcbs/${name}.kicad_pcb`, pcb)
}

module.exports = { run, write, OUT: path.join(here, 'output') }

if (require.main === module) {
  run().then(results => {
    write(results, path.join(here, 'output'))
    console.log(`Wrote ${path.join(here, 'output')}`)
  }).catch(err => { console.error(err); process.exit(1) })
}
