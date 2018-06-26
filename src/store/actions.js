import * as api from '@/api';
import { PUSH_REPORT, STORE_REPORTS } from './mutations-types';

export function fetchReports({ commit }) {
    return api.getReports().then(
        reports => commit(STORE_REPORTS, { reports }),
    );
}

export function saveReport({ commit }, { type, lat, lng }) {
    return api.saveReport(type, lat, lng)
        .then(report => commit(PUSH_REPORT, { report }));
}
