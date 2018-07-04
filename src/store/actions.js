import * as api from '@/api';
import { IS_LOADING, IS_DONE_LOADING, PUSH_REPORT, STORE_REPORTS } from './mutations-types';

export function fetchReports({ commit }) {
    commit(IS_LOADING);
    return api.getReports()
        .then(reports => commit(STORE_REPORTS, { reports }))
        .finally(() => commit(IS_DONE_LOADING));
}

export function saveReport({ commit }, { type, lat, lng }) {
    commit(IS_LOADING);
    return api.saveReport(type, lat, lng)
        .then(report => commit(PUSH_REPORT, { report }))
        .finally(() => commit(IS_DONE_LOADING));
}
