import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    glsl({
      include: [
        '**/*.glsl',
        '**/*.wgsl',
        '**/*.vert',
        '**/*.frag',
        '**/*.vs',
        '**/*.fs',
      ],
      compress: false,
      watch: true,
    }),
  ],

  build: {
    lib: {
      entry: path.resolve(__dirname, 'index.js'),
      name: 'famous',
      formats: ['es', 'umd'],
      fileName: (format) => {
        if (format === 'es') return 'famous.js';
        if (format === 'umd') return 'famous.umd.js';
        return `famous.${format}.js`;
      },
    },
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        exports: 'named',
        // Provide global variables to use in the UMD build
        globals: {},
      },
    },
  },

  // Vitest configuration
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.spec.js', '**/*.test.js', '**/test/**'],
    },
    include: ['**/*.spec.js', '**/*.test.js'],
    exclude: ['node_modules', 'dist'],
  },

  resolve: {
    extensions: ['.js', '.json'],
  },
});
