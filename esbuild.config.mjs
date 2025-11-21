import * as esbuild from 'esbuild';

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const buildOptions = {
  entryPoints: ['src/extension/main.ts'],
  bundle: true,
  outfile: 'dist/extension.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'ES2020',
  sourcemap: !production,
  minify: production,
  treeShaking: true,
  // Resolve paths correctly
  absWorkingDir: process.cwd(),
  alias: {
    // Map internal imports
  },
  // Node modules resolution
  nodePaths: ['src/extension/node_modules', 'src/node_modules', 'node_modules'],
};

async function build() {
  if (watch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log('Watching for changes...');
  } else {
    await esbuild.build(buildOptions);
    console.log(production ? 'Production build complete' : 'Development build complete');
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
