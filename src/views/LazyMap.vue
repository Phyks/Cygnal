<template>
    <Map></Map>
</template>

<script>
import Loading from '@/views/Loading.vue';

export default {
    components: {
        Map: () => ({
            component: import('@/views/Map.vue' /* webpackChunkName: "MapView" */),
            loading: Loading,
        }),
    },
};
</script>
