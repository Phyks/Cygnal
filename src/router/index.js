import Vue from 'vue';
import Router from 'vue-router';

import store from '@/store';

import About from '@/views/About.vue';
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
            path: '/map=:zoom/:lat/:lng',
            name: 'SharedMap',
            component: Map,
        },
        {
            path: '/map',
            name: 'Map',
            component: Map,
            beforeEnter: (to, from, next) => {
                if (to.name !== 'SharedMap') {
                    // Check that intro was seen except if we are in SharedMap view.
                    // This is required in order to ensure NoSleep works well.
                    if (!store.state.hasGoneThroughIntro) {
                        return next({ name: 'Onboarding', replace: true });
                    }
                }
                return next();
            },
        },
        {
            path: '/',
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
