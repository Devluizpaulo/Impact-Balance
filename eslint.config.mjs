// Flat ESLint config for Next.js 15
import next from 'eslint-config-next';
import tseslint from 'typescript-eslint';

export default [
  // Ignore patterns
  {
    ignores: ['.next/**', 'node_modules/**', 'coverage/**', 'out/**', 'build/**', 'dist/**']
  },
  // Next.js base config (Core Web Vitals)
  ...next,
  // TypeScript rules
  ...tseslint.config({
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  })
];
