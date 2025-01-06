import { resolve } from 'path';

import type { BuildOptions } from 'esbuild';
import { type Options, defineConfig } from 'tsup';

import { dependencies } from './package.json';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'es2021',
  platform: 'node',
  minify: true,
  clean: true,
  bundle: true,
  splitting: false,
  external: Object.keys(dependencies),
  treeshake: true,
  outDir: 'dist',
  noExternal: [],
  esbuildOptions: (options: BuildOptions) => {
    options.alias = {
      '@': resolve(__dirname, './src'),
    };
    options.resolveExtensions = ['.ts', '.js', '.d.ts'];
  },
} satisfies Options);
