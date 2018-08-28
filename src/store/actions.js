import * as api from '@/api';
import * as constants from '@/constants';
import i18n from '@/i18n';

import {
    HAS_VIBRATED_ONCE,
    INTRO_WAS_SEEN,
    INTRO_WAS_UNSEEN,
    IS_DONE_LOADING,
    IS_LOADING,
    PUSH_REPORT,
    PUSH_UNSENT_REPORT,
    REMOVE_UNSENT_REPORT,
    SET_CURRENT_MAP_CENTER,
    SET_CURRENT_MAP_ZOOM,
    SET_CURRENT_POSITION,
    SET_LAST_REPORT_FETCHING_LOCATION,
    SET_LOCATION_ERROR,
    SET_LOCATION_WATCHER_ID,
    SET_SETTING,
    SHOW_REPORT_DETAILS,
    STORE_REPORTS,
} from './mutations-types';

export function fetchReports({ commit }) {
    commit(IS_LOADING);
    return api.getActiveReports()
        .then((reports) => {
            commit(STORE_REPORTS, { reports });
            commit(IS_DONE_LOADING);
        })
        .catch((exc) => {
            commit(IS_DONE_LOADING);
            throw exc;
        });
}

export function setLastReportFetchingLocation({ commit }, { locationLatLng }) {
    return commit(SET_LAST_REPORT_FETCHING_LOCATION, { locationLatLng });
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
        .then((report) => {
            commit(PUSH_REPORT, { report });
            commit(IS_DONE_LOADING);
        })
        .catch((exc) => {
            commit(IS_DONE_LOADING);
            throw exc;
        });
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
    // Commit setting into the store
    return commit(SET_SETTING, { setting: 'locale', value: locale });
}

export function setSetting({ commit }, { setting, value }) {
    return commit(SET_SETTING, { setting, value });
}

export function markHasVibratedOnce({ commit }) {
    return commit(HAS_VIBRATED_ONCE);
}

export function markIntroAsSeen({ commit }) {
    return commit(INTRO_WAS_SEEN);
}

export function unmarkIntroAsSeen({ commit }) {
    return commit(INTRO_WAS_UNSEEN);
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
    { commit },
    { coords, timestamp },
) {
    const currentLocation = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        hdop: coords.accuracy ? coords.accuracy : null,
        elevation: coords.elevation ? coords.elevation : null,
        vdop: coords.altitudeAccuracy ? coords.altitudeAccuracy : null,
        heading: (
            (coords.heading !== null && !Number.isNaN(coords.heading))
                ? coords.heading
                : null
        ),
        speed: coords.speed ? coords.speed : null,
        timestamp,
    };

    commit(SET_CURRENT_POSITION, { currentLocation });
}

export function setLocationWatcherId({ commit }, { id }) {
    return commit(SET_LOCATION_WATCHER_ID, { id });
}

export function setLocationError({ commit, state }, { error }) {
    // Unregister location watcher
    const { watcherID } = state.location;
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
