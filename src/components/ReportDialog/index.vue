<template>
    <v-bottom-sheet class="overlayDialog" v-model="isActive">
        <v-card>
            <v-container fluid>
                <v-layout row wrap>
                    <ReportTile v-for="(item, type) in REPORT_TYPES" :type="type" :imageSrc="item.image" :label="$t(item.label)" :save="saveReport" :key="type"></ReportTile>
                </v-layout>
            </v-container>
        </v-card>
    </v-bottom-sheet>
</template>

<script>
import GCUMIcon from '@/assets/gcum.svg';
import ObstacleIcon from '@/assets/obstacle.svg';
import PotHoleIcon from '@/assets/pothole.svg';

import ReportTile from './ReportTile.vue';

const REPORT_TYPES = {
    gcum: {
        label: 'reportLabels.gcum',
        image: GCUMIcon,
    },
    interrupt: {
        label: 'reportLabels.interrupt',
        image: ObstacleIcon,
    },
    pothole: {
        label: 'reportLabels.pothole',
        image: PotHoleIcon,
    },
};

export default {
    components: {
        ReportTile,
    },
    props: {
        value: Boolean,
        lat: Number,
        lng: Number,
    },
    computed: {
        isActive: {
            get() {
                return this.value;
            },
            set(val) {
                this.$emit('input', val);
            },
        },
    },
    data() {
        return {
            REPORT_TYPES,
        };
    },
    methods: {
        saveReport(type) {
            return this.$store.dispatch('saveReport', {
                type,
                lat: this.lat,
                lng: this.lng,
            })
                .then(() => {
                    this.isActive = !this.isActive;
                });
        },
    },
};
</script>

<style scoped>
.overlayDialog {
    z-index: 1003 !important;
}
</style>
