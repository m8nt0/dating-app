module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  rules: {
    // Allow unused variables when they are prefixed with _
    '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
    // Allow empty functions
    '@typescript-eslint/no-empty-function': 'off',
    // Allow explicit any
    '@typescript-eslint/no-explicit-any': 'off',
  },
}; 