import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist/**', 'dist-server/**', 'dist-electron/**', 'release/**', '.dist/**', 'node_modules/**', 'test-results/**', 'playwright-report/**'] },
  js.configs.recommended,
  { files: ['scripts/*.{js,mjs}'], languageOptions: { globals: {
    process: 'readonly', console: 'readonly', fetch: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly',
  } } },
  ...tseslint.configs.recommended,
  { files: ['**/*.{ts,tsx}'], plugins: { 'react-hooks': hooks }, rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
  } },
  { files: ['electron/*.cjs', 'scripts/*.cjs'], languageOptions: { globals: {
    require: 'readonly', process: 'readonly', console: 'readonly', URL: 'readonly', fetch: 'readonly', AbortSignal: 'readonly',
    setTimeout: 'readonly', clearTimeout: 'readonly',
  } }, rules: { '@typescript-eslint/no-require-imports': 'off' } },
);
