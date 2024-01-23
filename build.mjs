import esbuild from 'esbuild';
const production = process.argv[2] === '--production';
const watch = process.argv[2] === '--watch';
let desktopContext, browserContext;

// This is the base config that will be used by both web and desktop versions of the extension
const baseConfig = {
  entryPoints: ['./src/index.ts'],
  bundle: true,
  external: ['vscode'],
  sourcemap: !production,
  minify: production,
  target: 'ES2022',
  format: 'cjs',
};

try {
  [desktopContext, browserContext] = await Promise.all([
    // https://esbuild.github.io/getting-started/#bundling-for-node
    esbuild.context({ ...baseConfig, outfile: './dist/index.js', platform: 'node' }),
    // https://esbuild.github.io/getting-started/#bundling-for-the-browser
    esbuild.context({ ...baseConfig, outfile: './dist/browser.js', platform: 'browser' }),
  ]);
} catch (e) {
  console.error(e);
  process.exit(1);
}

if (watch) {
  await desktopContext.watch();
  await browserContext.watch();
} else {
  desktopContext.rebuild();
  browserContext.rebuild();
  desktopContext.dispose();
  browserContext.dispose();
}
