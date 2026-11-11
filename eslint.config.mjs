import openmrs from '@openmrs/eslint-config';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  { ignores: ['dist/**', 'coverage/**'] },
  ...openmrs,
  {
    plugins: { 'unused-imports': unusedImports },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-extra-boolean-cast': 'error',
      'no-prototype-builtins': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-useless-escape': 'error',
    },
  },
  {
    // Playwright fixtures take a callback named `use` and call it, which
    // eslint-plugin-react-hooks reads as React's `use` hook. The previous
    // config turned this off for e2e too.
    files: ['e2e/**'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      // Changing these waits is a behaviour change, not a lint fix.
      'playwright/no-networkidle': 'off',
    },
  },
  // Type-aware rules, scoped to the files tsconfig.json covers. The old config
  // asked for type information repo-wide, which made every e2e file a parse
  // error, so e2e was never actually linted.
  ...tseslint.config({
    files: ['src/**/*.{ts,tsx}', 'tools/**/*.ts', 'vitest.config.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-exports': 'error',
      // Left off by the previous config.
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  }),
];
