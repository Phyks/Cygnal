if (!Number.isNaN) {
    // From https://developer.mozilla.org/pl/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN
    Number.isNaN = value => (value !== value); // eslint-disable-line no-self-compare
}

require('es6-promise').polyfill();
require('isomorphic-fetch');
