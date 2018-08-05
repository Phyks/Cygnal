import Vue from 'vue';
import VueI18n from 'vue-i18n';

// Moment locales
import 'moment/locale/en-gb';
import 'moment/locale/fr';

// App locales
import en from './en.json';
import fr from './fr.json';
import oc from './oc.json';

// Local moment locales
import './moment/oc';

export const AVAILABLE_LOCALES = [
    {
        iso: 'en',
        name: 'English',
        messages: en,
    },
    {
        iso: 'fr',
        name: 'Français',
        messages: fr,
    },
    {
        iso: 'oc',
        name: 'Occitan',
        messages: oc,
    },
];

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
AVAILABLE_LOCALES.forEach((item) => {
    messages[item.iso] = item.messages;
});

export default new VueI18n({
    messages,
    fallbackLocale: 'en',
});
