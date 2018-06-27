<template>
    <v-lmarker :lat-lng="marker.latLng" :icon="icons[marker.type]"></v-lmarker>
</template>

<script>
import { REPORT_TYPES } from '@/constants';

export default {
    props: {
        marker: Object,
    },
    data() {
        const icons = {};
        Object.keys(REPORT_TYPES).forEach((type) => {
            icons[type] = REPORT_TYPES[type].marker;
        });
        return {
            icons,
        };
    },
};
</script>
