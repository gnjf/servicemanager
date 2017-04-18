import json from 'rollup-plugin-json'
import commonjs from 'rollup-plugin-commonjs'
import globals from 'rollup-plugin-node-globals'
import builtins from 'rollup-plugin-node-builtins'
import resolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/main.js',
  format: 'iife',
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    commonjs({
      include: 'node_modules/**',
      sourceMap: true
    }),
    json(),
    globals(),
    builtins(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    resolve({
      browser: true,
      main: true
    })
  ],
  dest: 'bundle.js',
  sourceMap: true
}
