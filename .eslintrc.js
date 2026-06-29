module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    browser: true,
    es2017: true,
    worker: true,
  },
  rules: {
    'indent': ['error', 2],
    'no-console': 'warn',
    'prefer-const': ['error', { destructuring: 'any' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/ban-ts-comment': ['warn', { minimumDescriptionLength: 3 }],
    '@typescript-eslint/no-var-requires': 'error',
  },
  ignorePatterns: ['dist/', 'node_modules/', 'docs/'],
};
