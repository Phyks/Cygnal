import Vue from 'vue';

import { messages, getBrowserLocales } from '@/i18n';
import { storageAvailable } from '@/tools';
import {
    DEFAULT_TILE_CACHING_DURATION,
    DEFAULT_TILE_SERVER,
    TILE_SERVERS,
} from '@/constants';
import * as types from './mutations-types';

function loadDataFromStorage(table, keys) {
    try {
        if (storageAvailable('localStorage')) {
            let arrayKeys = keys;
            if (!Array.isArray(keys)) {
                arrayKeys = [keys];
            }
            const values = {};
            arrayKeys.forEach((key) => {
                const value = localStorage.getItem(`${table}.${key}`);
                if (value) {
                    values[key] = JSON.parse(value);
                    return;
                }
                values[key] = null;
            });
            if (!Array.isArray(keys)) {
                return new Promise(resolve => resolve(values[keys]));
            }
            return new Promise(resolve => resolve(values));
        }
    } catch (e) {
        console.error(`Unable to load data from storage using table ${table} and keys ${keys}: ${e}.`);
    }
    return new Promise(resolve => resolve(null));
}

function handleMigrations() {
    return new Promise((resolve) => {
        if (!storageAvailable('localStorage')) {
            // Resolve immediately
            return resolve(null);
        }
        let version = (
            localStorage.getItem('settings.version') // for versions > 0.3
            || localStorage.getItem('version') // for versions <= 0.3
        );
        if (version) {
            version = JSON.parse(version);
        }

        // Migration to 0.1
        if (!version) {
            console.log('Migrating local storage to version 0.1...');
            const preventSuspend = localStorage.getItem('preventSuspend');
            if (preventSuspend !== null) {
                localStorage.setItem('hasPreventSuspendPermission', JSON.stringify(preventSuspend));
            }
            localStorage.removeItem('preventSuspend');
            version = '0.1';
            localStorage.setItem('version', JSON.stringify(version));
        }

        // Migration to 0.4
        if (version < '0.4') {
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
                const value = localStorage.getItem(key);
                if (value) {
                    localStorage.setItem(`settings.${key}`, value);
                    localStorage.removeItem(key);
                }
            });
            // Migrate unsent reports
            const unsentReports = localStorage.getItem('unsentReports');
            if (unsentReports) {
                localStorage.setItem('unsentReports.items', unsentReports);
                localStorage.removeItem('unsentReports');
            }
            version = '0.4';
            localStorage.setItem('settings.version', JSON.stringify(version));
        }

        return resolve(null);
    });
}

// Handle the required migrations
export const initialState = handleMigrations().then(() => {
    // Load unsent reports from storage
    const unsentReportsPromise = loadDataFromStorage('unsentReports', 'items');

    // Load settings from storage
    const settingsPromise = loadDataFromStorage('settings', [
        'hasGeolocationPermission',
        'hasPermanentNotificationPermission',
        'hasPlaySoundPermission',
        'hasPreventSuspendPermission',
        'hasVibratePermission',
        'locale',
        'shouldAutorotateMap',
        'skipOnboarding',
        'tileCachingDuration',
        'tileServer',
    ], null).then((dbSettings) => {
        const settings = dbSettings || {};

        if (!(settings.locale in messages)) {
            settings.locale = null;
        }
        if (!settings.locale) {
            // Get best matching locale from browser
            const locales = getBrowserLocales();
            for (let i = 0; i < locales.length; i += 1) {
                if (messages[locales[i]]) {
                    settings.locale = locales[i];
                    break; // Break at first matching locale
                }
            }
        }
        if (
            settings.tileCachingDuration !== null
            && !Number.isInteger(settings.tileCachingDuration)
        ) {
            settings.tileCachingDuration = null;
        }
        if (
            settings.tileServer
            && !TILE_SERVERS[settings.tileServer]
            && !settings.tileServer.startsWith('custom:')
        ) {
            settings.tileServer = null;
        }

        return {
            locale: settings.locale || 'en',
            hasGeolocationPermission: (
                settings.hasGeolocationPermission !== null
                    ? settings.hasGeolocationPermission
                    : true
            ),
            hasPermanentNotificationPermission: (
                settings.hasPermanentNotificationPermission !== null
                    ? settings.hasPermanentNotificationPermission
                    : true
            ),
            hasPlaySoundPermission: (
                settings.hasPlaySoundPermission !== null
                    ? settings.hasPlaySoundPermission
                    : true
            ),
            hasPreventSuspendPermission: (
                settings.hasPreventSuspendPermission !== null
                    ? settings.hasPreventSuspendPermission
                    : true
            ),
            hasVibratePermission: (
                settings.hasVibratePermission !== null
                    ? settings.hasVibratePermission
                    : true
            ),
            shouldAutorotateMap: (
                settings.shouldAutorotateMap !== null
                    ? settings.shouldAutorotateMap
                    : false
            ),
            skipOnboarding: settings.skipOnboarding || false,
            tileCachingDuration: (
                settings.tileCachingDuration !== null
                    ? settings.tileCachingDuration
                    : DEFAULT_TILE_CACHING_DURATION
            ),
            tileServer: settings.tileServer || DEFAULT_TILE_SERVER,
        };
    });

    return Promise.all(
        [settingsPromise, unsentReportsPromise],
    ).then((values) => {
        const settings = values[0];
        const unsentReports = values[1];

        return {
            hasGoneThroughIntro: false,
            hasVibratedOnce: false,
            isLoading: false,
            location: {
                error: null,
                gpx: [],
                watcherID: null,
            },
            lastReportFetchingLocation: [null, null],
            map: {
                center: [null, null],
                zoom: null,
            },
            reportDetails: {
                id: null,
                previousId: null,
                userAsked: null,
            },
            reports: [],
            unsentReports: unsentReports || [],
            settings,
        };
    });
});

export const mutations = {
    [types.DELETE_REPORT](state, { report }) {
        const reportIndex = state.reports.findIndex(item => item.id === report.id);
        if (reportIndex !== -1) {
            Vue.delete(state.reports, reportIndex);
        }
    },
    [types.HAS_VIBRATED_ONCE](state) {
        state.hasVibratedOnce = true;
    },
    [types.INTRO_WAS_SEEN](state) {
        state.hasGoneThroughIntro = true;
    },
    [types.INTRO_WAS_UNSEEN](state) {
        state.hasGoneThroughIntro = false;
    },
    [types.IS_DONE_LOADING](state) {
        state.isLoading = false;
    },
    [types.IS_LOADING](state) {
        state.isLoading = true;
    },
    [types.PUSH_REPORT](state, { report }) {
        const reportIndex = state.reports.findIndex(item => item.id === report.id);
        if (reportIndex === -1) {
            state.reports.push(report);
        } else {
            Vue.set(state.reports, reportIndex, report);
        }
    },
    [types.PUSH_UNSENT_REPORT](state, { report }) {
        state.unsentReports.push(report);
        if (storageAvailable('localStorage')) {
            localStorage.setItem('unsentReports.items', JSON.stringify(state.unsentReports));
        }
    },
    [types.REMOVE_UNSENT_REPORT](state, { index }) {
        state.unsentReports.splice(index, 1);
        if (storageAvailable('localStorage')) {
            localStorage.setItem('unsentReports.items', JSON.stringify(state.unsentReports));
        }
    },
    [types.SET_CURRENT_MAP_CENTER](state, { center }) {
        Vue.set(state.map, 'center', center);
    },
    [types.SET_CURRENT_MAP_ZOOM](state, { zoom }) {
        Vue.set(state.map, 'zoom', zoom);
    },
    [types.SET_CURRENT_POSITION](state, { currentLocation }) {
        state.location.gpx.push(currentLocation);
    },
    [types.SET_LAST_REPORT_FETCHING_LOCATION](state, { locationLatLng }) {
        state.lastReportFetchingLocation = locationLatLng;
    },
    [types.SET_LOCATION_ERROR](state, { error }) {
        Vue.set(state.location, 'error', error);
    },
    [types.SET_LOCATION_WATCHER_ID](state, { id }) {
        Vue.set(state.location, 'watcherID', id);
    },
    [types.SET_SETTING](state, { setting, value }) {
        if (storageAvailable('localStorage')) {
            localStorage.setItem(`settings.${setting}`, JSON.stringify(value));
        }
        state.settings[setting] = value;
    },
    [types.SHOW_REPORT_DETAILS](state, { id, userAsked }) {
        if (id === null) {
            // If closing the details, keep track of what the id was to prevent
            // reopening the details immediately.
            Vue.set(state.reportDetails, 'previousId', state.reportDetails.id);
        }
        Vue.set(state.reportDetails, 'id', id);
        Vue.set(state.reportDetails, 'userAsked', userAsked);
    },
    [types.STORE_REPORTS](state, { reports }) {
        state.reports = reports;
    },
};
