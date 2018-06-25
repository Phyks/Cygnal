// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuetify from 'vuetify';
import Vue2Leaflet from 'vue2-leaflet';
import Vue2LeafletTracksymbol from 'vue2-leaflet-tracksymbol';
import 'material-icons/iconfont/material-icons.css';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import 'leaflet/dist/leaflet.css';
import 'vuetify/dist/vuetify.min.css';

import App from './App.vue';
import router from './router';
import i18n from './i18n';

Vue.use(Vuetify);

Vue.component('v-lmap', Vue2Leaflet.LMap);
Vue.component('v-ltilelayer', Vue2Leaflet.LTileLayer);
Vue.component('v-lmarker', Vue2Leaflet.LMarker);
Vue.component('v-lpolyline', Vue2Leaflet.LPolyline);
Vue.component('v-lts', Vue2LeafletTracksymbol);

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    i18n,
    components: { App },
    template: '<App/>',
});
