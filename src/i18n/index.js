import Vue from 'vue';
import VueI18n from 'vue-i18n';

// App locales
import en from './en.json';
import fr from './fr.json';
import oc from './oc.json';

export const AVAILABLE_LOCALES = {
    en: {
        messages: en,
        name: 'English',
    },
    fr: {
        iso: 'fr',
        messages: fr,
        name: 'Français',
    },
    oc: {
        iso: 'oc',
        messages: oc,
        name: 'Occitan',
    },
};

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

export const messages = {};
Object.keys(AVAILABLE_LOCALES).forEach((iso) => {
    messages[iso] = AVAILABLE_LOCALES[iso].messages;
});

export default new VueI18n({
    messages,
    fallbackLocale: 'en',
});
