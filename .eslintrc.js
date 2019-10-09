const base = require('@umijs/fabric/dist/eslint');

module.exports = {
  ...base,
  rules: {
    ...base.rules,
    'default-case': 0,
    'react/no-find-dom-node': 0,
    'react/no-did-update-set-state': 0,
    'react/no-unused-state': 1,
    'jsx-a11y/label-has-for': 0,
    'jsx-a11y/label-has-associated-control': 0,
  },
};
