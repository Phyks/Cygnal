<template>
    <v-container fluid fill-height class="no-padding">
        <v-layout row wrap fill-height>
            <v-flex xs12 fill-height v-if="lat && lng">
                <Map :lat="lat" :lng="lng" :heading="heading" :accuracy="accuracy" :markers="reportsMarkers" :onLongPress="showReportDialog"></Map>
                <v-btn
                    fixed
                    dark
                    fab
                    bottom
                    right
                    color="orange"
                    class="overlayButton"
                    @click.native.stop="() => showReportDialog()"
                    >
                    <v-icon>report_problem</v-icon>
                </v-btn>
                <ReportDialog v-model="dialog" :lat="reportLat" :lng="reportLng"></ReportDialog>
            </v-flex>
            <v-flex xs12 fill-height v-else class="pa-3">
                <template v-if="error">
                    <p class="text-xs-center">{{ error }}</p>
                    <p class="text-xs-center">
                        <v-btn color="blue" dark @click="initializePositionWatching">Retry</v-btn>
                    </p>
                </template>
                <template v-else>
                    <p class="text-xs-center">{{ $t('geolocation.fetching') }}</p>
                </template>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import NoSleep from 'nosleep.js';

import Map from '@/components/Map.vue';
import ReportDialog from '@/components/ReportDialog/index.vue';
import * as constants from '@/constants';
import { distance, mockLocation } from '@/tools';

export default {
    components: {
        Map,
        ReportDialog,
    },
    created() {
        this.initializePositionWatching();
        this.listenForFirstInteraction();
        this.$store.dispatch('fetchReports');
        window.addEventListener('keydown', this.hideReportDialogOnEsc);
    },
    beforeDestroy() {
        this.disableNoSleep();
        this.disablePositionWatching();
        window.removeEventListener('keydown', this.hideReportDialogOnEsc);
    },
    computed: {
        reportsMarkers() {
            return this.$store.state.reports.map(report => ({
                id: report.id,
                type: report.attributes.type,
                latLng: [report.attributes.lat, report.attributes.lng],
            }));
        },
    },
    data() {
        return {
            accuracy: null,
            dialog: false,
            error: null,
            heading: null,
            lat: null,
            lng: null,
            noSleep: null,
            reportLat: null,
            reportLng: null,
            watchID: null,
        };
    },
    methods: {
        initializePositionWatching() {
            this.error = null; // Reset any error
            this.disablePositionWatching(); // Ensure at most one at the same time

            if (constants.MOCK_LOCATION) {
                this.setPosition(mockLocation());
                this.watchID = setInterval(
                    () => this.setPosition(mockLocation()),
                    constants.MOCK_LOCATION_UPDATE_INTERVAL,
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
                if (constants.MOCK_LOCATION) {
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
                if (distanceFromPreviousPoint > constants.UPDATE_REPORTS_DISTANCE_THRESHOLD) {
                    this.$store.dispatch('fetchReports');
                }
            }
            this.lat = position.coords.latitude;
            this.lng = position.coords.longitude;
            this.heading = position.coords.heading ? position.coords.heading : null;
            this.accuracy = position.coords.accuracy ? position.coords.accuracy : null;
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
        showReportDialog(latlng) {
            if (latlng) {
                this.reportLat = latlng.lat;
                this.reportLng = latlng.lng;
            } else {
                this.reportLat = this.lat;
                this.reportLng = this.lng;
            }
            this.dialog = !this.dialog;
        },
        hideReportDialogOnEsc(event) {
            let isEscape = false;
            if ('key' in event) {
                isEscape = (event.key === 'Escape' || event.key === 'Esc');
            } else {
                isEscape = (event.keyCode === 27);
            }
            if (isEscape) {
                this.dialog = false;
            }
        },
        handleFirstUserInteraction() {
            this.setNoSleep();

            window.removeEventListener('mousemove', this.handleFirstUserInteraction, false);
            window.removeEventListener('mousedown', this.handleFirstUserInteraction, false);
            window.removeEventListener('keypress', this.handleFirstUserInteraction, false);
            window.removeEventListener('DOMMouseScroll', this.handleFirstUserInteraction, false);
            window.removeEventListener('mousewheel', this.handleFirstUserInteraction, false);
            window.removeEventListener('touchmove', this.handleFirstUserInteraction, false);
            window.removeEventListener('MSPointerMove', this.handleFirstUserInteraction, false);
        },
        listenForFirstInteraction() {
            window.addEventListener('mousemove', this.handleFirstUserInteraction, false);
            window.addEventListener('mousedown', this.handleFirstUserInteraction, false);
            window.addEventListener('keypress', this.handleFirstUserInteraction, false);
            window.addEventListener('DOMMouseScroll', this.handleFirstUserInteraction, false);
            window.addEventListener('mousewheel', this.handleFirstUserInteraction, false);
            window.addEventListener('touchmove', this.handleFirstUserInteraction, false);
            window.addEventListener('MSPointerMove', this.handleFirstUserInteraction, false);
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
