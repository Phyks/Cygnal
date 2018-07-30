import moment from 'moment';

import * as api from '@/api';
import * as constants from '@/constants';
import i18n from '@/i18n';

import {
    INTRO_WAS_SEEN,
    IS_DONE_LOADING,
    IS_LOADING,
    PUSH_REPORT,
    PUSH_UNSENT_REPORT,
    REMOVE_UNSENT_REPORT,
    SET_CURRENT_MAP_CENTER,
    SET_CURRENT_MAP_ZOOM,
    SET_CURRENT_POSITION,
    SET_LOCATION_ERROR,
    SET_LOCATION_WATCHER_ID,
    SET_SETTING,
    SHOW_REPORT_DETAILS,
    STORE_REPORTS,
} from './mutations-types';

export function fetchReports({ commit }) {
    commit(IS_LOADING);
    return api.getActiveReports()
        .then(reports => commit(STORE_REPORTS, { reports }))
        .finally(() => commit(IS_DONE_LOADING));
}

export function downvote({ commit }, { id }) {
    // Hide details
    commit(SHOW_REPORT_DETAILS, { id: null, userAsked: null });
    return api.downvote(id)
        .then(report => commit(PUSH_REPORT, { report }));
}

export function upvote({ commit }, { id }) {
    // Hide details
    commit(SHOW_REPORT_DETAILS, { id: null, userAsked: null });
    return api.upvote(id)
        .then(report => commit(PUSH_REPORT, { report }));
}

export function saveReport({ commit }, { type, lat, lng }) {
    commit(IS_LOADING);
    return api.saveReport(type, lat, lng)
        .then(report => commit(PUSH_REPORT, { report }))
        .finally(() => commit(IS_DONE_LOADING));
}

export function saveUnsentReport({ commit }, { report }) {
    commit(PUSH_UNSENT_REPORT, { report });
}

export function removeUnsentReport({ commit }, { index }) {
    commit(REMOVE_UNSENT_REPORT, { index });
}

export function hideReportDetails({ commit }) {
    return commit(SHOW_REPORT_DETAILS, { id: null, userAsked: null });
}

export function showReportDetails({ commit }, { id, userAsked }) {
    return commit(SHOW_REPORT_DETAILS, { id, userAsked });
}

export function setLocale({ commit }, { locale }) {
    // Set global Vue-i18n locale
    i18n.locale = locale;
    // Set moment locale
    moment.locale(locale);
    // Commit setting into the store
    return commit(SET_SETTING, { setting: 'locale', value: locale });
}

export function setSetting({ commit }, { setting, value }) {
    return commit(SET_SETTING, { setting, value });
}

export function markIntroAsSeen({ commit }) {
    return commit(INTRO_WAS_SEEN);
}

export function setCurrentMapCenter({ commit, state }, { center }) {
    if (state.map.center.some((item, index) => item !== center[index])) {
        commit(SET_CURRENT_MAP_CENTER, { center });
    }
}

export function setCurrentMapZoom({ commit, state }, { zoom }) {
    if (state.map.zoom !== zoom) {
        commit(SET_CURRENT_MAP_ZOOM, { zoom });
    }
}

export function setCurrentPosition(
    { commit, state },
    { accuracy = null, heading = null, latLng = null },
) {
    const locationState = state.location;
    if (
        accuracy !== locationState.accuracy ||
        heading !== locationState.heading ||
        locationState.currentLatLng.some((item, index) => item !== latLng[index])
    ) {
        // Throttle mutations if nothing has changed
        commit(SET_CURRENT_POSITION, { accuracy, heading, latLng });
    }
}

export function setLocationWatcherId({ commit }, { id }) {
    return commit(SET_LOCATION_WATCHER_ID, { id });
}

export function setLocationError({ commit, state }, { error }) {
    // Unregister location watcher
    const watcherID = state.location.watcherID;
    if (watcherID !== null) {
        if (constants.MOCK_LOCATION) {
            clearInterval(watcherID);
        } else {
            navigator.geolocation.clearWatch(watcherID);
        }
    }

    commit(SET_LOCATION_WATCHER_ID, { id: null });
    commit(SET_LOCATION_ERROR, { error });
}
