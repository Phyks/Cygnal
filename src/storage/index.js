import localforage from 'localforage';

import { APP_NAME } from '@/constants';

// Initialize localforage
localforage.config({
    // Prefer IndexedDB
    driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
    name: APP_NAME,
});

export function loadDataFromStorage(table, keys) {
    // If a single key is requested, get it
    if (!Array.isArray(keys)) {
        return localforage.getItem(`${table}.${keys}`).catch(
            e => console.error(
                `Unable to load data from storage using table ${table} and keys ${keys}: ${e}.`,
            ),
        );
    }
    // Else, return an array of values
    return Promise.all(keys.map(
        key => localforage.getItem(`${table}.${key}`),
    )).then((arrayValues) => {
        const values = {};
        arrayValues.forEach((value, i) => {
            values[keys[i]] = value;
        });
        return values;
    });
}

// Handle migrations across storage schemes
export function handleMigrations() {
    return localforage.getItem('settings.version').then((localForageVersion) => {
        const promises = [];

        // Get (legacy) version from local storage
        let localStorageVersion = null;
        try {
            // Try to load version from local storage if available
            if (localforage.supports(localforage.LOCALSTORAGE)) {
                localStorageVersion = (
                    localStorage.getItem('settings.version') // for versions > 0.3
                    || localStorage.getItem('version') // for versions <= 0.3
                );
                if (localStorageVersion) {
                    localStorageVersion = JSON.parse(localStorageVersion);
                }
            }
        } catch (e) {
            // Pass, ignore error
        }

        // Pre-0.4
        if (!localForageVersion) {
            // First migration, to 0.1
            if (!localStorageVersion) {
                console.log('Migrating local storage to version 0.1...');
                const preventSuspend = localStorage.getItem('preventSuspend');
                if (preventSuspend !== null) {
                    localStorage.setItem('hasPreventSuspendPermission', JSON.stringify(preventSuspend));
                }
                localStorage.removeItem('preventSuspend');
                localStorageVersion = '0.1';
                localStorage.setItem('version', JSON.stringify(localStorageVersion));
            }

            // Migration to 0.4
            // Migrate to localforage API and purge localStorage values.
            if (localStorageVersion < '0.4') {
                console.log('Migrating local storage to version 0.4...');
                // Migrate settings
                [
                    'hasGeolocationPermission',
                    'hasPermanentNotificationPermission',
                    'hasPlaySoundPermission',
                    'hasPreventSuspendPermission',
                    'hasVibratePermission',
                    'locale',
                    'shouldAutorotateMap',
                    'skipOnboarding',
                    'tileServer',
                    'version',
                ].forEach((key) => {
                    let value = localStorage.getItem(key);
                    if (value) {
                        // Put value in localforage
                        try {
                            value = JSON.parse(value);
                        } catch (e) {
                            // Pass, ignore error
                        }
                        promises.push(
                            localforage.setItem(`settings.${key}`, value),
                        );
                        // Remove value from localStorage
                        localStorage.removeItem(key);
                    }
                });
                // Migrate unsent reports
                const unsentReports = localStorage.getItem('unsentReports');
                if (unsentReports) {
                    // Put value in localforage
                    promises.push(
                        localforage.setItem('unsentReports.items', unsentReports),
                    );
                    // Remove value from localStorage
                    localStorage.removeItem('unsentReports');
                }
                promises.push(
                    localforage.setItem('settings.version', '0.4'),
                );
            }
        }

        return Promise.all(promises);
    });
}
