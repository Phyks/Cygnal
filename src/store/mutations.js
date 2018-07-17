import moment from 'moment';
import Vue from 'vue';

import { messages, getBrowserLocales } from '@/i18n';
import { storageAvailable } from '@/tools';
import { TILE_SERVERS, DEFAULT_TILE_SERVER } from '@/constants';
import * as types from './mutations-types';

function loadSettingFromStorage(name) {
    try {
        const value = localStorage.getItem(name);
        if (value) {
            return JSON.parse(value);
        }
        return null;
    } catch (e) {
        console.error(`Unable to load setting ${name}: ${e}.`);
        return null;
    }
}

// Load settings from storage
let locale = null;
let preventSuspend = null;
let skipOnboarding = null;
let tileServer = null;
if (storageAvailable('localStorage')) {
    preventSuspend = loadSettingFromStorage('preventSuspend');
    skipOnboarding = loadSettingFromStorage('skipOnboarding');

    tileServer = loadSettingFromStorage('tileServer');
    if (!TILE_SERVERS[tileServer]) {
        tileServer = null;
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
    reportDetails: {
        id: null,
        userAsked: null,
    },
    reports: [],
    settings: {
        locale: locale || 'en',
        preventSuspend: preventSuspend || true,
        skipOnboarding: skipOnboarding || false,
        tileServer: tileServer || DEFAULT_TILE_SERVER,
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
            localStorage.setItem(setting, JSON.stringify(value));
        }
        state.settings[setting] = value;
    },
    [types.SHOW_REPORT_DETAILS](state, { id, userAsked }) {
        Vue.set(state.reportDetails, 'id', id);
        Vue.set(state.reportDetails, 'userAsked', userAsked);
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
