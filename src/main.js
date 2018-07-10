// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuetify from 'vuetify';
import Vue2Leaflet from 'vue2-leaflet';
import Vue2LeafletTracksymbol from 'vue2-leaflet-tracksymbol';

import './css/roboto-fontface.css';
import './css/material-icons.css';
import 'leaflet/dist/leaflet.css';  // eslint-disable-line  import/first
import 'vuetify/dist/vuetify.min.css';  // eslint-disable-line  import/first


import App from './App.vue';
import i18n from './i18n';
import router from './router';
import store from './store';

// Ensure locale is correctly set from the store value
store.dispatch('setLocale', store.state.settings.locale);

Vue.use(Vuetify);

Vue.component('v-lmap', Vue2Leaflet.LMap);
Vue.component('v-ltilelayer', Vue2Leaflet.LTileLayer);
Vue.component('v-lmarker', Vue2Leaflet.LMarker);
Vue.component('v-lcirclemarker', Vue2Leaflet.LCircleMarker);
Vue.component('v-lcircle', Vue2Leaflet.LCircle);
Vue.component('v-lpolyline', Vue2Leaflet.LPolyline);
Vue.component('v-lts', Vue2LeafletTracksymbol);

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    i18n,
    store,
    components: { App },
    template: '<App/>',
});
