import localforage from 'localforage';

import {
    TILE_SERVERS,
    VERSION as CACHE_NAME,
} from '@/constants';
import { loadDataFromStorage } from '@/storage';

const DEBUG = (process.env.NODE_ENV !== 'production');

// Define the assets to cache
const { assets } = global.serviceWorkerOption;
let assetsToCache = [...assets, './'];
assetsToCache = assetsToCache.map(
    path => new URL(path, global.location).toString(),
);
assetsToCache = assetsToCache.filter(
    // Remove some assets from cache, such as Webpack hot-reload stuff
    url => !url.endsWith('hot-update.json'),
);

// Define the locations from which we allow caching
const ALLOW_CACHING_FROM = [
    global.location.origin,
];
const TILE_SERVERS_ORIGINS = [];
// Allow alterations of tile servers requests
Object.keys(TILE_SERVERS).forEach((tileServer) => {
    const tileServerURL = TILE_SERVERS[tileServer].url;
    if (tileServerURL.indexOf('{a-c}') !== -1) {
        TILE_SERVERS_ORIGINS.push(
            (new URL(tileServerURL.replace('{a-c}', 'a'))).origin,
        );
        TILE_SERVERS_ORIGINS.push(
            (new URL(tileServerURL.replace('{a-c}', 'b'))).origin,
        );
        TILE_SERVERS_ORIGINS.push(
            (new URL(tileServerURL.replace('{a-c}', 'c'))).origin,
        );
    } else {
        TILE_SERVERS_ORIGINS.push((new URL(tileServerURL)).origin);
    }
});


// Get duration (in s) before (cache) expiration from headers of a fetch
// request.
function getExpiresFromHeaders(headers) {
    // Try to use the Cache-Control header (and max-age)
    if (headers.get('cache-control')) {
        const maxAge = headers.get('cache-control').match(/max-age=(\d+)/);
        return parseInt(maxAge ? maxAge[1] : 0, 10);
    }

    // Otherwise try to get expiration duration from the Expires header
    if (headers.get('expires')) {
        return (
            parseInt(
                (new Date(headers.get('expires'))).getTime() / 1000,
                10,
            )
            - (new Date()).getTime()
        );
    }
    return null;
}

global.self.addEventListener('install', (event) => {
    DEBUG && console.log('SW: installing…');
    event.waitUntil(
        global.caches.open(CACHE_NAME) // Don't cache during dev
            .then((cache) => {
                DEBUG && console.log('SW: cache opened.');
                cache.addAll(assetsToCache).then(
                    () => {
                        if (DEBUG) {
                            console.log(`SW: cached assets ${assetsToCache}.`);
                            console.log('SW: successfully installed!');
                        }
                        return global.self.skipWaiting(); // Immediately update the SW
                    },
                );
            }),
    );
});

global.self.addEventListener('activate', (event) => {
    DEBUG && console.log('SW: activating…');

    event.waitUntil(
        // Delete all caches but the current one
        global.caches.keys().then(
            cacheNames => Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName.indexOf(CACHE_NAME) !== 0) {
                        DEBUG && console.log(`SW: Deleting unused cache ${cacheName}.`);
                        return global.caches.delete(cacheName);
                    }
                    return null;
                }),
            ).then(() => DEBUG && console.log('SW: activated!')),
        ),
    );
});

global.self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Do not touch requests which are not GET
    if (request.method !== 'GET') {
        DEBUG && console.log(`SW: ignore non-GET request: ${request.method}.`);
        return;
    }

    // Only touch requests which we can cache or from tiles servers.
    const requestURL = new URL(request.url);
    if (
        ALLOW_CACHING_FROM.indexOf(requestURL.origin) === -1
        && TILE_SERVERS_ORIGINS.indexOf(requestURL.origin) === -1
    ) {
        DEBUG && console.log(`SW: ignore different origin ${requestURL.origin}.`);
        return;
    }

    // Never touch requests going from / to the API
    if (requestURL.pathname.startsWith('/api')) {
        // Note that if API is on a different location, it will be ignored by
        // the previous rule.
        DEBUG && console.log(`SW: ignore API call ${requestURL.pathname}.`);
        return;
    }

    // Serve tiles from cache or download and cache them
    if (TILE_SERVERS_ORIGINS.indexOf(requestURL.origin) !== -1) {
        event.respondWith(global.caches.open(`${CACHE_NAME}-tiles`).then(
            cache => cache.match(request).then(
                (response) => {
                    // If there is a match from the cache
                    if (response) {
                        DEBUG && console.log(`SW: serving ${request.url} from cache.`);
                        const expirationDate = Date.parse(response.headers.get('sw-cache-expires'));
                        const now = new Date();
                        // Check it is not already expired and return from the
                        // cache
                        if (expirationDate > now) {
                            return response;
                        }
                    }

                    // Otherwise, let's fetch it from the network
                    DEBUG && console.log(`SW: no match in cache for ${request.url}, using network.`);
                    return fetch(request.url).then((liveResponse) => {
                        // Get tile caching duration from settings
                        let tileCachingDurationPromise = (
                            Promise.resolve(0) // no caching by default
                        );
                        if (
                            localforage.driver() === localforage.INDEXEDDB
                        ) {
                            tileCachingDurationPromise = loadDataFromStorage(
                                'settings', 'tileCachingDuration',
                            );
                        }
                        return tileCachingDurationPromise.then((tileCachingDuration) => {
                            // This is caching duration from settings
                            const cachingDuration = (
                                tileCachingDuration || 0
                            );
                            // This is caching duration specified in HTTP headers
                            const cachingDurationFromHeaders = getExpiresFromHeaders(
                                liveResponse.headers,
                            ) || 0;

                            // If any form of caching is possible, do it
                            if (tileCachingDuration > 0 || cachingDurationFromHeaders > 0) {
                                // Compute expires date from caching duration
                                const expires = new Date();
                                expires.setSeconds(
                                    expires.getSeconds()
                                    // Caching duration cannot be less than
                                    // specified by HTTP headers.
                                    + Math.max(cachingDuration, cachingDurationFromHeaders),
                                );
                                // Recreate a Response object from scratch to put
                                // it in the cache, with the extra header for
                                // managing cache expiration.
                                const cachedResponseFields = {
                                    status: liveResponse.status,
                                    statusText: liveResponse.statusText,
                                    headers: { 'SW-Cache-Expires': expires.toUTCString() },
                                };
                                liveResponse.headers.forEach((v, k) => {
                                    cachedResponseFields.headers[k] = v;
                                });
                                // We will consume body of the live response, so
                                // clone it before to be able to return it
                                // afterwards.
                                const returnedResponse = liveResponse.clone();
                                return liveResponse.blob().then((body) => {
                                    DEBUG && console.log(
                                        `SW: caching tiles ${request.url} until ${expires.toUTCString()}.`,
                                    );
                                    // Put the duplicated Response in the cache
                                    cache.put(request, new Response(body, cachedResponseFields));
                                    // Return the live response from the network
                                    return returnedResponse;
                                });
                            }
                            // Otherwise, just return the live result from the network
                            return liveResponse;
                        });
                    });
                },
            ),
        ));
        return;
    }

    // For the other requests, try to match it in the cache, otherwise do a
    // network call
    if (DEBUG) {
        // Never match from cache in development
        return;
    }
    const resource = global.caches.open(CACHE_NAME).then(
        cache => cache.match(request).then(
            (response) => {
                if (response) {
                    DEBUG && console.log(`SW: serving ${request.url} from cache.`);
                    return response;
                }

                DEBUG && console.log(`SW: no match in cache for ${request.url}, using network.`);
                return fetch(request);
            },
        ),
    );
    event.respondWith(resource);
});

global.self.addEventListener('message', (event) => {
    console.log(`SW: received message ${event.data}.`);

    const eventData = JSON.parse(event.data);

    // Clean tiles cache
    if (eventData.action === 'PURGE_EXPIRED_TILES') {
        DEBUG && console.log('SW: purging expired tiles from cache.');
        global.caches.open(`${CACHE_NAME}-tiles`).then(
            cache => cache.keys().then(
                keys => keys.forEach(
                    key => cache.match(key).then((cachedResponse) => {
                        const expirationDate = Date.parse(cachedResponse.headers.get('sw-cache-expires'));
                        const now = new Date();
                        // Check it is not already expired
                        if (expirationDate < now) {
                            DEBUG && console.log(`SW: purging (expired) tile ${key.url} from cache.`);
                            cache.delete(key);
                        }
                    }),
                ),
            ),
        );
    }
});
