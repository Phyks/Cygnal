import * as types from './mutations-types';

export const initialState = {
    isLoading: false,
    reportDetailsID: null,
    reports: [],
};

export const mutations = {
    [types.IS_LOADING](state) {
        state.isLoading = true;
    },
    [types.IS_DONE_LOADING](state) {
        state.isLoading = false;
    },
    [types.SHOW_REPORT_DETAILS](state, { id }) {
        state.reportDetailsID = id;
    },
    [types.STORE_REPORTS](state, { reports }) {
        state.reports = reports;
    },
    [types.PUSH_REPORT](state, { report }) {
        state.reports.push(report);
    },
};
