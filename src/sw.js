import { VERSION as CACHE_NAME } from '@/constants';

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

global.self.addEventListener('install', (event) => {
    DEBUG && console.log('SW: installing…');
    event.waitUntil(
        global.caches.open(CACHE_NAME)
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
        DEBUG && console.log(`SW: ignore non-GET request: ${request.method}`);
        return;
    }

    // Do not touch requests from a different origin
    const requestURL = new URL(request.url);
    if (ALLOW_CACHING_FROM.indexOf(requestURL.origin) === -1) {
        DEBUG && console.log(`SW: ignore different origin ${requestURL.origin}`);
        return;
    }

    // Never touch requests going from / to the API
    if (requestURL.pathname.startsWith('/api')) {
        // Note that if API is on a different location, it will be ignored by
        // the previous rule.
        DEBUG && console.log(`SW: ignore API call ${requestURL.pathname}`);
        return;
    }

    // For the other requests, try to match it in the cache, otherwise do a
    // network call
    const resource = global.caches.open(CACHE_NAME).then(
        cache => cache.match(request).then(
            (response) => {
                if (response) {
                    DEBUG && console.log(`SW: serving ${request.url} from cache`);
                    return response;
                }

                DEBUG && console.log(`SW: no match in cache for ${request.url}, using network`);
                return fetch(request);
            },
        ),
    );
    event.respondWith(resource);
});
