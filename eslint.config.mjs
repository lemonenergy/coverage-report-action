import eslint from '@eslint/js'
import sort from 'eslint-plugin-sort'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  sort.configs['flat/recommended'],
  {
    ignores: ['**/node_modules/**', '**/dist/**']
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn'
    }
  }
)
