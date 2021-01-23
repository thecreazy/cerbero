import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';
import babel from 'rollup-plugin-babel';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';
import {
  terser
} from "rollup-plugin-terser";

const plugins = [
  typescript({
    typescript: require('typescript'),
    tsconfig: './tsconfig.json',
    useTsconfigDeclarationDir: true,
    clean: true,
  }),
  resolve(),
  babel({
    exclude: 'node_modules/**'
  }),
  webWorkerLoader({
    pattern: /cerbero-worker:(.+)/,
    inline: false,
    targetPlatform: 'browser'
  }),
  commonjs(),
  terser()
]

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
    plugins
  },
  {
    input: 'src/index.ts',
    external: ['ms'],
    output: [{
        file: pkg.main,
        format: 'cjs',
        exports: 'named',
      },
      {
        file: pkg.module,
        format: 'es',
        exports: 'named'
      }
    ],
    plugins
  }
];
