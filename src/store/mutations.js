import * as types from './mutations-types';

export const initialState = {
    reports: [],
};

export const mutations = {
    [types.STORE_REPORTS](state, { reports }) {
        state.reports = reports;
    },
    [types.PUSH_REPORT](state, { report }) {
        state.reports.push(report);
    },
};
