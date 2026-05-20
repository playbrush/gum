module.exports = {
  root: true,
  extends: ['airbnb-base', 'plugin:json/recommended', 'plugin:xwalk/recommended', 'prettier'],
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  plugins: ['prettier'],
  rules: {
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
    'prettier/prettier': 'error',
    // 'xwalk/max-cells': ['error', 8], // product-card requires 7 fields
  },
};
