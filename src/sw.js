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
    event.respondWith(
        fetch(event.request).catch((error) => {
            DEBUG && console.log(`SW: Network request failed: ${error}. Trying to serve from cache.`);
            caches.match(event.request).then((response) => {
                if (response) {
                    return response;
                }
                return response; // TODO
            });
        }),
    );
});
