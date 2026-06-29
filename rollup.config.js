import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import ts from 'typescript';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const _require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkg = _require('./package.json');

/**
 * Custom plugin that intercepts `cerbero-worker:<path>` imports,
 * builds the worker TypeScript bundle via a nested rollup call,
 * and inlines it as a Blob URL so it works in all output formats.
 */
function cerberoWorkerPlugin() {
  const PREFIX = 'cerbero-worker:';
  const VIRTUAL_PREFIX = '\0cerbero-worker:';

  return {
    name: 'cerbero-worker',

    resolveId(id, importer) {
      if (!id.startsWith(PREFIX)) return null;
      const workerRelPath = id.slice(PREFIX.length);
      const base = importer ? path.dirname(fileURLToPath(importer.startsWith('/')  ? `file://${importer}` : importer)) : __dirname;
      const resolved = path.resolve(base, workerRelPath);
      return VIRTUAL_PREFIX + resolved;
    },

    async load(id) {
      if (!id.startsWith(VIRTUAL_PREFIX)) return null;
      const workerEntry = id.slice(VIRTUAL_PREFIX.length);

      // Inline rollup to bundle the worker separately
      const { rollup: buildWorker } = await import('rollup');
      const bundle = await buildWorker({
        input: workerEntry,
        plugins: [
          resolve(),
          typescript({
            typescript: ts,
            tsconfig: './tsconfig.json',
            check: false,
            tsconfigOverride: {
              compilerOptions: { declaration: false, declarationDir: null },
            },
            cacheRoot: path.join(__dirname, '.rpt2_cache_worker'),
          }),
          commonjs(),
        ],
      });

      const { output } = await bundle.generate({ format: 'iife' });
      await bundle.close();

      const workerCode = output[0].code;
      return `
const _blob = new Blob([${JSON.stringify(workerCode)}], { type: 'application/javascript' });
const _url = URL.createObjectURL(_blob);
export default class InlineWorker extends Worker {
  constructor() { super(_url); }
}
      `.trim();
    },
  };
}

const plugins = [
  cerberoWorkerPlugin(),
  typescript({
    typescript: ts,
    tsconfig: './tsconfig.json',
    useTsconfigDeclarationDir: true,
    clean: true,
  }),
  resolve(),
  babel({
    exclude: 'node_modules/**',
    babelHelpers: 'bundled',
  }),
  commonjs(),
  terser(),
];

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        name: 'cerbero',
        file: pkg.browser,
        format: 'umd',
      },
      {
        name: 'cerbero',
        file: './docs/cerbero.umd.js',
        format: 'umd',
      },
    ],
    plugins,
  },
  {
    input: 'src/index.ts',
    external: ['ms'],
    output: [
      {
        file: pkg.module,
        format: 'es',
        exports: 'named',
      },
    ],
    plugins,
  },
  {
    input: 'src/index.ts',
    external: ['ms'],
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        exports: 'named',
      },
    ],
    plugins,
  },
];
