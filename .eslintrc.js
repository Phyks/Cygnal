// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  // https://github.com/standard/standard/blob/master/docs/RULES-en.md
  extends: [
    'airbnb-base',
    'plugin:vue/essential',
  ],
  // check if imports actually resolve
  'settings': {
    'import/resolver': {
      'webpack': {
        'config': 'build/webpack.base.conf.js'
      }
    }
  },
  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // Use 4 spaces indent
    'indent': ['error', 4],
    'import/prefer-default-export': 'off',
    'no-console': 'off',
    'no-underscore-dangle': 'off',
    // Ignore assignment to state
    'no-param-reassign': [
        "error",
        {
            "props": true,
            "ignorePropertyModificationsFor": ["state"]
        }
    ],
    'no-bitwise': 'off',
    'no-unused-expressions': ["error", { "allowShortCircuit": true }],
    'function-paren-newline': 'off',
  }
}
