<template>
    <v-container fluid fill-height class="no-padding">
        <v-layout row wrap fill-height>
            <v-flex xs12 fill-height v-if="lat && lng">
                <Map :lat="lat" :lng="lng" :heading="heading" :markers="reportsMarkers"></Map>
                <v-btn
                    fixed
                    dark
                    fab
                    bottom
                    right
                    color="orange"
                    class="overlayButton"
                    @click.native.stop="dialog = !dialog"
                    >
                    <v-icon>report_problem</v-icon>
                </v-btn>
                <ReportDialog v-model="dialog" :lat="lat" :lng="lng"></ReportDialog>
            </v-flex>
            <v-flex xs12 fill-height v-else class="pa-3">
                <p>{{ error }}</p>
                <p class="text-xs-center">
                    <v-btn color="blue" dark @click="initializePositionWatching">Retry</v-btn>
                </p>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import NoSleep from 'nosleep.js';

import Map from '@/components/Map.vue';
import ReportDialog from '@/components/ReportDialog/index.vue';
import { distance, mockLocation } from '@/tools';

const MOCK_LOCATION = false;
const MOCK_LOCATION_UPDATE_INTERVAL = 30 * 1000;
const UPDATE_REPORTS_DISTANCE_THRESHOLD = 500;

export default {
    components: {
        Map,
        ReportDialog,
    },
    created() {
        this.initializePositionWatching();
        this.setNoSleep();
        this.$store.dispatch('fetchReports');
    },
    beforeDestroy() {
        this.disableNoSleep();
        this.disablePositionWatching();
    },
    computed: {
        reportsMarkers() {
            return this.$store.state.reports.map(report => ({
                id: report.id,
                latLng: [report.attributes.lat, report.attributes.lng],
            }));
        },
    },
    data() {
        return {
            dialog: false,
            error: this.$t('geolocation.enable'),
            heading: null,
            lat: null,
            lng: null,
            noSleep: null,
            watchID: null,
        };
    },
    methods: {
        initializePositionWatching() {
            this.disablePositionWatching(); // Ensure at most one at the same time

            if (MOCK_LOCATION) {
                this.setPosition(mockLocation());
                this.watchID = setInterval(
                    () => this.setPosition(mockLocation()),
                    MOCK_LOCATION_UPDATE_INTERVAL,
                );
            } else {
                if (!('geolocation' in navigator)) {
                    this.error = this.$t('geolocation.unavailable');
                }

                this.watchID = navigator.geolocation.watchPosition(
                    this.setPosition,
                    this.handlePositionError,
                    {
                        enableHighAccuracy: true,
                        maximumAge: 30000,
                        timeout: 27000,
                    },
                );
            }
        },
        disablePositionWatching() {
            if (this.watchID !== null) {
                if (MOCK_LOCATION) {
                    clearInterval(this.watchID);
                } else {
                    navigator.geolocation.clearWatch(this.watchID);
                }
            }
        },
        handlePositionError(error) {
            this.error = `Error ${error.code}: ${error.message}`;
        },
        setPosition(position) {
            if (this.lat && this.lng) {
                const distanceFromPreviousPoint = distance(
                    [this.lat, this.lng],
                    [position.coords.latitude, position.coords.longitude],
                );
                if (distanceFromPreviousPoint > UPDATE_REPORTS_DISTANCE_THRESHOLD) {
                    this.$store.dispatch('fetchReports');
                }
            }
            this.lat = position.coords.latitude;
            this.lng = position.coords.longitude;
            if (position.coords.heading) {
                this.heading = position.coords.heading;
            } else {
                this.heading = null;
            }
        },
        setNoSleep() {
            this.noSleep = new NoSleep();
            this.noSleep.enable();
        },
        disableNoSleep() {
            if (this.noSleep) {
                this.noSleep.disable();
            }
        },
    },
};
</script>

<style scoped>
.no-padding {
    padding: 0;
}

.overlayButton {
    z-index: 1000 !important;
}
</style>

<style>
.overlay {
    z-index: 1002 !important;
}
</style>
