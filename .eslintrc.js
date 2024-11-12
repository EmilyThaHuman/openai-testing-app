module.exports = {
  extends: [
    'plugin:react-hooks/recommended',
    'plugin:react-perf/recommended'
  ],
  plugins: ['react-hooks', 'react-perf', 'unused-imports'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-perf/jsx-no-new-object-as-prop': 'error',
    'react-perf/jsx-no-new-array-as-prop': 'error',
    'react-perf/jsx-no-new-function-as-prop': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
  }
}; 