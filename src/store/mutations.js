import * as types from './mutations-types';

export const initialState = {
    isLoading: false,
    reports: [],
};

export const mutations = {
    [types.IS_LOADING](state) {
        state.isLoading = true;
    },
    [types.IS_DONE_LOADING](state) {
        state.isLoading = false;
    },
    [types.STORE_REPORTS](state, { reports }) {
        state.reports = reports;
    },
    [types.PUSH_REPORT](state, { report }) {
        state.reports.push(report);
    },
};
