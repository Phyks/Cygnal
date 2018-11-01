import Vue from 'vue';
import localforage from 'localforage';

import {
    DEFAULT_TILE_CACHING_DURATION,
    DEFAULT_TILE_SERVER,
} from '@/constants';
import * as types from './mutations-types';

// Handle the required migrations
export const initialState = {
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
    unsentReports: [],
    settings: {
        locale: 'en',
        hasGeolocationPermission: true,
        hasPermanentNotificationPermission: true,
        hasPlaySoundPermission: true,
        hasPreventSuspendPermission: true,
        hasVibratePermission: true,
        shouldAutorotateMap: false,
        skipOnboarding: false,
        tileCachingDuration: DEFAULT_TILE_CACHING_DURATION,
        tileServer: DEFAULT_TILE_SERVER,
    },
};

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
    [types.LOAD_UNSENT_REPORTS](state, { unsentReports }) {
        state.unsentReports = unsentReports;
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
        localforage.setItem('unsentReports.items', state.unsentReports);
    },
    [types.REMOVE_UNSENT_REPORT](state, { index }) {
        state.unsentReports.splice(index, 1);
        localforage.setItem('unsentReports.items', state.unsentReports);
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
        localforage.setItem(`settings.${setting}`, value);
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
