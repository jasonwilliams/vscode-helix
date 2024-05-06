import esbuild from 'esbuild';
import path from 'path';
import url from 'url';
const production = process.argv[2] === '--production';
const watch = process.argv[2] === '--watch';
let desktopContext, browserContext;
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This is the base config that will be used by both web and desktop versions of the extension
const baseConfig = {
  entryPoints: ['./extension.ts'],
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
    esbuild.context({
      ...baseConfig,
      external: ['child_process', 'vscode'],
      alias: {
        os: 'os-browserify/browser',
        path: 'path-browserify',
        process: 'process/browser',
        util: 'util',
        platform: path.resolve(__dirname, 'src', 'platform', 'browser'),
      },
      outfile: './dist/browser.js',
      platform: 'browser',
    }),
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
