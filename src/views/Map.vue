<template>
    <v-container fluid fill-height class="no-padding">
        <v-layout row wrap fill-height>
            <ReportCard></ReportCard>
            <v-flex xs12 fill-height v-if="latLng">
                <Map :positionLatLng="latLng" :reportLatLng="reportLatLng" :polyline="positionHistory" :heading="heading" :accuracy="accuracy" :markers="reportsMarkers" :onPress="showReportDialog"></Map>
                <v-btn
                    absolute
                    dark
                    fab
                    large
                    bottom
                    right
                    color="orange"
                    class="overlayButton"
                    @click.native.stop="() => showReportDialog()"
                    role="button"
                    :aria-label="$t('buttons.reportProblem')"
                    >
                    <v-icon>report_problem</v-icon>
                </v-btn>
                <ReportDialog v-model="dialog" :lat="reportLat" :lng="reportLng"></ReportDialog>
            </v-flex>
            <v-flex xs12 fill-height v-else class="pa-3">
                <template v-if="error">
                    <p class="text-xs-center">{{ error }}</p>
                    <p class="text-xs-center">
                        <v-btn role="button" color="blue" dark @click="initializePositionWatching">Retry</v-btn>
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
import ReportCard from '@/components/ReportCard.vue';
import ReportDialog from '@/components/ReportDialog/index.vue';
import * as constants from '@/constants';
import { distance, mockLocation } from '@/tools';

export default {
    components: {
        Map,
        ReportCard,
        ReportDialog,
    },
    created() {
        if (!this.$store.state.settings.skipOnboarding) {
            this.$router.replace({ name: 'Onboarding' });
        }
    },
    beforeDestroy() {
        this.disableNoSleep();
        this.disablePositionWatching();
        window.removeEventListener('keydown', this.hideReportDialogOnEsc);
        this.$store.dispatch('hideReportDetails');
    },
    computed: {
        reportsMarkers() {
            return this.$store.getters.notDismissedReports.map(report => ({
                id: report.id,
                type: report.attributes.type,
                latLng: [report.attributes.lat, report.attributes.lng],
            }));
        },
        reportLatLng() {
            if (this.dialog && this.reportLat && this.reportLng) {
                return [this.reportLat, this.reportLng];
            }
            return null;
        },
    },
    data() {
        return {
            accuracy: null,
            centering: false,
            dialog: false,
            error: null,
            heading: null,
            latLng: null,
            noSleep: null,
            positionHistory: [],
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
            if (this.latLng) {
                const distanceFromPreviousPoint = distance(
                    [this.latLng[0], this.latLng[1]],
                    [position.coords.latitude, position.coords.longitude],
                );
                if (distanceFromPreviousPoint > constants.UPDATE_REPORTS_DISTANCE_THRESHOLD) {
                    this.$store.dispatch('fetchReports');
                }
            }
            this.latLng = [position.coords.latitude, position.coords.longitude];
            this.positionHistory.push(this.latLng);
            this.heading = null;
            if (position.coords.heading !== null && !isNaN(position.coords.heading)) {
                this.heading = position.coords.heading;
            }
            this.accuracy = position.coords.accuracy ? position.coords.accuracy : null;
        },
        disableNoSleep() {
            if (this.noSleep) {
                this.noSleep.disable();
            }
        },
        setNoSleep() {
            let preventSuspend = localStorage.getItem('preventSuspend');
            if (preventSuspend) {
                preventSuspend = JSON.parse(preventSuspend);
            } else {
                preventSuspend = true;
            }

            if (preventSuspend) {
                this.noSleep = new NoSleep();
                this.noSleep.enable();
            }
        },
        showReportDialog(latlng) {
            if (latlng) {
                this.reportLat = latlng.lat;
                this.reportLng = latlng.lng;
            } else {
                this.reportLat = this.latLng[0];
                this.reportLng = this.latLng[1];
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
    },
    mounted() {
        this.setNoSleep();
        this.initializePositionWatching();
        this.$store.dispatch('fetchReports');
        window.addEventListener('keydown', this.hideReportDialogOnEsc);
    },
};
</script>

<style scoped>
.no-padding {
    padding: 0;
}
</style>

<style>
.v-overlay, .v-dialog__content {
    z-index: 1002 !important;
}

.overlayButton {
    z-index: 1000 !important;
    position: absolute !important;
    bottom: 24px !important;
    border-radius: 50% !important;
}
</style>
