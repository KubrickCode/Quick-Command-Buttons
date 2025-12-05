import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  clean: true,
  entry: { extension: 'src/extension/main.ts' },
  esbuildOptions(esbuildOptions) {
    esbuildOptions.nodePaths = ['src/extension/node_modules', 'node_modules'];
  },
  external: ['vscode'],
  format: ['cjs'],
  minify: !options.watch,
  noExternal: [/^(?!vscode$).*/],
  outDir: 'dist',
  platform: 'node',
  sourcemap: !!options.watch,
  target: 'ES2020',
  treeshake: true,
}));
