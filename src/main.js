import '@/polyfills';

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';

import '@/css/vendor/roboto-fontface.css';
import '@/css/vendor/material-icons.css';
import 'leaflet/dist/leaflet.css'; // eslint-disable-line import/first
import 'vuetify/src/stylus/app.styl';

import App from '@/App.vue';
import i18n from '@/i18n';
import router from '@/router';
import store from '@/store';
import '@/vuetify';

// Ensure locale is correctly set from the store value
store.dispatch('setLocale', { locale: store.state.settings.locale });

Vue.config.productionTip = false;

new Vue({ // eslint-disable-line no-new
    el: '#app',
    router,
    i18n,
    store,
    components: { App },
    render(h) {
        return h('App');
    },
});
