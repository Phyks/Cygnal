// With trailing slash
export const BASE_URL = process.env.API_BASE_URL || '/';
const AUTHORIZATION_HEADERS = new Headers({});
if (process.env.API_TOKEN) {
    AUTHORIZATION_HEADERS.set('Authorization', `Bearer ${process.env.API_TOKEN}`);
}

export function saveReport(type, lat, lng) {
    return fetch(`${BASE_URL}api/v1/reports`, {
        method: 'POST',
        body: JSON.stringify({
            type,
            lat,
            lng,
        }),
        headers: AUTHORIZATION_HEADERS,
    })
        .then(response => response.json())
        .then(response => response.data)
        .catch((exc) => {
            console.error(`Unable to post report: ${exc}.`);
            throw exc;
        });
}

export function getActiveReports() {
    return fetch(`${BASE_URL}api/v1/reports?filter[expiration_datetime][gt?]=${(new Date()).toISOString()}`)
        .then(response => response.json())
        .then(response => response.data)
        .catch((exc) => {
            console.error(`Unable to fetch reports: ${exc}.`);
            throw exc;
        });
}

export function getStats() {
    return fetch(`${BASE_URL}api/v1/stats`)
        .then(response => response.json())
        .then(response => response.data)
        .catch((exc) => {
            console.error(`Unable to fetch stats: ${exc}.`);
            throw exc;
        });
}

export function downvote(id) {
    return fetch(`${BASE_URL}api/v1/reports/${id}/downvote`, {
        method: 'POST',
        headers: AUTHORIZATION_HEADERS,
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
        headers: AUTHORIZATION_HEADERS,
    })
        .then(response => response.json())
        .then(response => response.data)
        .catch((exc) => {
            console.error(`Unable to upvote report: ${exc}.`);
            throw exc;
        });
}
