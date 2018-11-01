import '@/polyfills';

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';

import '@/css/vendor/roboto-fontface.css';
import '@mdi/font/css/materialdesignicons.css';
import 'ol/ol.css';
import 'vuetify/src/stylus/app.styl';

import App from '@/App.vue';
import i18n from '@/i18n';
import router from '@/router';
import store from '@/store';
import '@/vuetify';

Vue.config.productionTip = false;

// Populate the store with settings from the storage
store.dispatch('populateInitialStateFromStorage').then(() => {
    // Ensure locale is correctly set from the store value
    store.dispatch('setLocale', { locale: store.state.settings.locale });

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
});
