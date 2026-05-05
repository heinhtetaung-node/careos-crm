const path = require('path');

module.exports = {
  root: true,
  extends: ['custom'],
  parser: '@typescript-eslint/parser',
  settings: {
    'import/internal-regex': 'config/*',
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    './src/vendor/*.js',
    './src/pages/dashboards/Analytics/*.js',
    './src/pages/dashboards/Default/*.js',
    './src/pages/docs/*.js',
    './src/routes/*.js',
    '**/theme/localization/resources/*.ts',
    '.eslintrc.js',
    '**/*.test.tsx',
  ],
  rules: {
    'turbo/no-undeclared-env-vars': 'off',
    'no-param-reassign': [
      'error',
      {
        props: true,
        ignorePropertyModificationsFor: ['draft', 'state'],
      },
    ],
    'react/forbid-dom-props': [
      'error',
      {
        forbid: ['dangerouslySetInnerHTML'],
      },
    ],
  },
};
