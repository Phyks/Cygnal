import Vue from 'vue';

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
        const reportIndex = state.reports.findIndex(item => item.id === report.id);
        if (reportIndex === -1) {
            state.reports.push(report);
        } else {
            Vue.set(state.reports, reportIndex, report);
        }
    },
};
