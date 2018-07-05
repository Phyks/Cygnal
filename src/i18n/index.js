import moment from 'moment';
import Vue from 'vue';
import VueI18n from 'vue-i18n';

import { storageAvailable } from '@/tools';

import en from './en';
import fr from './fr';

Vue.use(VueI18n);

export function getBrowserLocales() {
    let langs = [];

    if (navigator.languages) {
        // Chrome does not currently set navigator.language correctly
        // https://code.google.com/p/chromium/issues/detail?id=101138
        // but it does set the first element of navigator.languages correctly
        langs = navigator.languages;
    } else if (navigator.userLanguage) {
        // IE only
        langs = [navigator.userLanguage];
    } else {
        // as of this writing the latest version of firefox + safari set this correctly
        langs = [navigator.language];
    }

    // Some browsers does not return uppercase for second part
    const locales = langs.map((lang) => {
        const locale = lang.split('-');
        return locale[1] ? `${locale[0]}-${locale[1].toUpperCase()}` : lang;
    });

    return locales;
}

export const messages = {
    en,
    fr,
};

let locale = null;
if (storageAvailable('localStorage')) {
    locale = localStorage.getItem('i18nSetting');
    if (!messages[locale]) {
        locale = null;
    }
} else {
    // Get best matching locale from browser
    const locales = getBrowserLocales();
    for (let i = 0; i < locales.length; i += 1) {
        if (messages[locales[i]]) {
            locale = locales[i];
            break; // Break at first matching locale
        }
    }
}
if (!locale) {
    locale = 'en'; // Safe default
}

if (locale) {
    // Set moment locale
    moment.locale(locale);
}

export default new VueI18n({
    locale,
    messages,
});
