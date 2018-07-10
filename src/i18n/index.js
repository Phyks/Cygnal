import Vue from 'vue';
import VueI18n from 'vue-i18n';

import en from './en';
import fr from './fr';

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

Vue.use(VueI18n);

export const messages = {
    en,
    fr,
};

export default new VueI18n({
    messages,
});
