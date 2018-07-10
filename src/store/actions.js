import moment from 'moment';

import * as api from '@/api';
import i18n from '@/i18n';

import {
    IS_LOADING,
    IS_DONE_LOADING,
    PUSH_REPORT,
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

export function downvote({ commit }, id) {
    return api.downvote(id)
        .then(report => commit(PUSH_REPORT, { report }));
}

export function upvote({ commit }, id) {
    return api.upvote(id)
        .then(report => commit(PUSH_REPORT, { report }));
}

export function saveReport({ commit }, { type, lat, lng }) {
    commit(IS_LOADING);
    return api.saveReport(type, lat, lng)
        .then(report => commit(PUSH_REPORT, { report }))
        .finally(() => commit(IS_DONE_LOADING));
}

export function showReportDetails({ commit }, id) {
    return commit(SHOW_REPORT_DETAILS, { id });
}

export function setLocale({ commit }, locale) {
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
