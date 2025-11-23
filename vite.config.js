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
      compress: true, // Enable shader compression in production
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
        passes: 2, // Multiple compression passes for better results
        ecma: 2020, // Use modern ECMAScript features
        module: true,
        toplevel: true,
        unsafe_arrows: true,
        unsafe_methods: true,
      },
      mangle: {
        properties: false, // Don't mangle property names for API stability
      },
      format: {
        comments: false,
        ecma: 2020,
      },
    },
    rollupOptions: {
      output: {
        exports: 'named',
        // Preserve module structure for better tree-shaking
        preserveModules: false,
        // Chunk splitting configuration
        manualChunks: undefined,
        // Provide global variables to use in the UMD build
        globals: {},
      },
      // Tree-shaking optimizations
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    // Target modern browsers for smaller bundle
    target: 'es2020',
    // Report compressed size
    reportCompressedSize: true,
    // Chunk size warning limit (in kB)
    chunkSizeWarningLimit: 500,
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

  // Optimize dependencies
  optimizeDeps: {
    include: ['glslify'],
    exclude: [],
  },

  // Enable esbuild for faster dev builds
  esbuild: {
    target: 'es2020',
    keepNames: true,
  },
});
