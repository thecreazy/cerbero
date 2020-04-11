import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';
import babel from 'rollup-plugin-babel';
import {terser} from "rollup-plugin-terser";

export default [{
  input: 'src/index.ts',
  output: [{
   name: 'cerbero',
   file: pkg.browser,
   format: 'umd'
  }, {
   name: 'cerbero',
   file: './docs/cerbero.umd.js',
   format: 'umd'
  }],
  plugins: [
    typescript({
        typescript: require('typescript'),
       }),
   resolve(),
   babel({
    exclude: 'node_modules/**'
   }),
   commonjs(),
   terser()
  ]
 },
 {
  input: 'src/index.ts',
  external: ['ms'],
  output: [{
    file: pkg.main,
    format: 'cjs',
    exports: 'named'
   },
   {
    file: pkg.module,
    format: 'es',
    exports: 'named'
   }
  ]
 }
];