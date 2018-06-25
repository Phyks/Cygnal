require('es6-promise').polyfill();
require('isomorphic-fetch');

// With trailing slash
export const BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:8081/'; // TODO

export function saveReport(type, lat, lng) {
    return fetch(`${BASE_URL}api/v1/reports`, {
        method: 'POST',
        body: JSON.stringify({
            type,
            lat,
            lng,
        }),
    });
}

export function getReports() {
    // TODO
}
