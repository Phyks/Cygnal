<template>
    <v-lmarker :lat-lng="marker.latLng" :icon="icon" @click="onClick"></v-lmarker>
</template>

<script>
import { REPORT_TYPES } from '@/constants';

export default {
    props: {
        marker: Object,
    },
    computed: {
        icon() {
            if (this.$store.state.reportDetailsID === this.marker.id) {
                return REPORT_TYPES[this.marker.type].markerLarge;
            }
            return REPORT_TYPES[this.marker.type].marker;
        },
    },
    data() {
        return {
            showCard: false,
        };
    },
    methods: {
        onClick() {
            this.$store.dispatch('showReportDetails', this.marker.id);
        },
    },
};
</script>
