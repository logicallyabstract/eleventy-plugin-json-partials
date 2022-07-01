module.exports = {
  extends: ['./node_modules/gts'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'import/prefer-default-export': 'off',
    'spaced-comment': 'off',
  },
  overrides: [
    {
      files: ['*.test.ts'],
      rules: {
        // do not require test/fixture imports to be in main deps
        'import/no-extraneous-dependencies': 'off',
        // https://github.com/mysticatea/eslint-plugin-node/issues/47
        'node/no-unpublished-import': 'off',
      },
    },
  ],
};
