import * as api from '@/api';
import { IS_LOADING, IS_DONE_LOADING, PUSH_REPORT, SHOW_REPORT_DETAILS, STORE_REPORTS } from './mutations-types';

export function fetchReports({ commit }) {
    commit(IS_LOADING);
    return api.getReports()
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
