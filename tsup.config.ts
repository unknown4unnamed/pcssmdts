import path from 'path';

import type { BuildOptions } from 'esbuild';
import { type Options } from 'tsup';

export default {
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'es2021',
  platform: 'node',
  minify: true,
  clean: true,
  bundle: true,
  splitting: false,
  shebang: '#!/usr/bin/env node',
  external: [
    'chalk',
    'fast-glob',
    'fs-extra',
    'postcss',
    'postcss-load-config',
    'typed-css-modules',
    'yargs',
  ],
  treeshake: true,
  outDir: 'dist',
  esbuildOptions: (options: BuildOptions) => {
    options.alias = {
      '@': path.resolve(__dirname, './src'),
    };
    options.resolveExtensions = ['.ts', '.js', '.d.ts'];
  },
} as Options;
