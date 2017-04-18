import strip from 'rollup-plugin-strip'
import replace from 'rollup-plugin-replace'
import uglify from 'rollup-plugin-uglify'

import config from './rollup.config.js'

config.dest = './bundle.min.js'
config.plugins[5] = replace({
  'process.env.NODE_ENV': JSON.stringify('production')
})
config.plugins.push(strip({
  debugger: true,
  functions: ['assert.*', 'debug', 'alert'],
  sourceMap: true
}))
config.plugins.push(uglify())

export default config
