module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  rules: {
    'default-case': 0,
    'import/no-extraneous-dependencies': 0,
    'react-hooks/exhaustive-deps': 0,
    'react/no-find-dom-node': 0,
    'react/no-did-update-set-state': 0,
    'react/no-unused-state': 1,
    'react/sort-comp': 0,
    'jsx-a11y/label-has-for': 0,
    'jsx-a11y/label-has-associated-control': 0,
    '@typescript-eslint/consistent-indexed-object-style': 0,
    '@typescript-eslint/no-parameter-properties': 0,
    '@typescript-eslint/ban-types': 0,
    '@typescript-eslint/type-annotation-spacing': 0,
    '@typescript-eslint/no-throw-literal': 0,
  },
};
