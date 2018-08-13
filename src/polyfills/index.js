import 'babel-polyfill';
import 'whatwg-fetch';

if (!Number.isNaN) {
    // From https://developer.mozilla.org/pl/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN
    Number.isNaN = value => (value !== value); // eslint-disable-line no-self-compare
}
