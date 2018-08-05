<template>
    <v-lmarker :lat-lng="marker.latLng" :icon="icon" @click="onClick"></v-lmarker>
</template>

<script>
import L from 'leaflet';

import { REPORT_TYPES } from '@/constants';

export default {
    props: {
        marker: Object,
    },
    computed: {
        icon() {
            if (this.$store.state.reportDetails.id === this.marker.id) {
                return L.icon(REPORT_TYPES[this.marker.type].markerLarge);
            }
            return L.icon(REPORT_TYPES[this.marker.type].marker);
        },
    },
    data() {
        return {
            showCard: false,
        };
    },
    methods: {
        onClick() {
            this.$store.dispatch('showReportDetails', { id: this.marker.id, userAsked: true });
        },
    },
};
</script>
