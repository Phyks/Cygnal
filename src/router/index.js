import Vue from 'vue';
import Router from 'vue-router';
import About from '@/components/About.vue';
import Map from '@/views/Map.vue';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            name: 'Map',
            component: Map,
        },
        {
            path: '/about',
            name: 'About',
            component: About,
        },
    ],
});
