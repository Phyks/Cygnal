import moment from 'moment';
import Vue from 'vue';

import { messages, getBrowserLocales } from '@/i18n';
import { storageAvailable } from '@/tools';
import * as types from './mutations-types';

// Load settings from storage
let locale = null;
let preventSuspend = null;
if (storageAvailable('localStorage')) {
    preventSuspend = localStorage.getItem('preventSuspend');
    if (preventSuspend) {
        preventSuspend = JSON.parse(preventSuspend);
    }

    locale = localStorage.getItem('locale');
    if (!messages[locale]) {
        locale = null;
    }
    if (!locale) {
        // Get best matching locale from browser
        const locales = getBrowserLocales();
        for (let i = 0; i < locales.length; i += 1) {
            if (messages[locales[i]]) {
                locale = locales[i];
                break; // Break at first matching locale
            }
        }
    }
    // Set moment locale
    moment.locale(locale);
}

export const initialState = {
    isLoading: false,
    reportDetailsID: null,
    reports: [],
    settings: {
        locale: locale || 'en',
        preventSuspend: preventSuspend || true,
    },
};

export const mutations = {
    [types.IS_LOADING](state) {
        state.isLoading = true;
    },
    [types.IS_DONE_LOADING](state) {
        state.isLoading = false;
    },
    [types.SET_SETTING](state, { setting, value }) {
        if (storageAvailable('localStorage')) {
            localStorage.setItem(setting, value);
        }
        state.settings[setting] = value;
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
