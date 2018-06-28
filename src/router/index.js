import Vue from 'vue';
import Router from 'vue-router';
import About from '@/components/About.vue';
import Map from '@/views/Map.vue';
import Onboarding from '@/views/Onboarding.vue';
import Settings from '@/views/Settings.vue';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/about',
            name: 'About',
            component: About,
        },
        {
            path: '/',
            name: 'Map',
            component: Map,
        },
        {
            path: '/onboarding',
            name: 'Onboarding',
            component: Onboarding,
        },
        {
            path: '/settings',
            name: 'Settings',
            component: Settings,
        },
    ],
});
