import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.min.js', 'scripts/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'block-scoped-var': 'warn',
      curly: ['warn', 'all'],
      eqeqeq: ['error', 'allow-null'],
      'no-loop-func': 'warn',
      'no-self-compare': 'error',
      'no-unused-vars': ['error', { vars: 'all', args: 'none', ignoreRestSiblings: true }],
      'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
      'brace-style': ['warn', 'stroustrup', { allowSingleLine: true }],
      camelcase: ['warn', { properties: 'never' }],
      'eol-last': ['warn', 'always'],
      'no-trailing-spaces': 'warn',
      'no-mixed-spaces-and-tabs': 'error',
      semi: ['warn', 'always'],
      strict: ['warn', 'global'],
    },
  },
  {
    files: ['**/*.spec.js', '**/*.test.js', '**/test/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.mocha,
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      'no-unused-expressions': 'off',
      'no-console': 'off',
    },
  },
  prettierConfig,
];
