require('es6-promise').polyfill();
require('isomorphic-fetch');

// With trailing slash
export const BASE_URL = process.env.API_BASE_URL || '/';

export function saveReport(type, lat, lng) {
    return fetch(`${BASE_URL}api/v1/reports`, {
        method: 'POST',
        body: JSON.stringify({
            type,
            lat,
            lng,
        }),
    })
        .then(response => response.json())
        .then(response => response.data)
        .catch((exc) => {
            console.error(`Unable to post report: ${exc}.`);
            throw exc;
        });
}

export function getReports() {
    return fetch(`${BASE_URL}api/v1/reports`)
        .then(response => response.json())
        .then(response => response.data)
        .catch((exc) => {
            console.error(`Unable to fetch reports: ${exc}.`);
            throw exc;
        });
}

export function downvote(id) {
    return fetch(`${BASE_URL}api/v1/reports/${id}/downvote`, {
        method: 'POST',
    })
        .then(response => response.json())
        .then(response => response.data)
        .catch((exc) => {
            console.error(`Unable to downvote report: ${exc}.`);
            throw exc;
        });
}

export function upvote(id) {
    return fetch(`${BASE_URL}api/v1/reports/${id}/upvote`, {
        method: 'POST',
    })
        .then(response => response.json())
        .then(response => response.data)
        .catch((exc) => {
            console.error(`Unable to upvote report: ${exc}.`);
            throw exc;
        });
}
