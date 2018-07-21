<template>
    <v-container fluid fill-height class="no-padding">
        <v-layout row wrap fill-height>
            <ReportCard></ReportCard>
            <v-flex xs12 fill-height v-if="positionLatLng">
                <Map :mapZoom="mapZoom" :positionIsGPS="!hasRouteCenter" :positionLatLng="positionLatLng" :reportLatLng="reportLatLng" :polyline="positionHistory" :heading="heading" :accuracy="accuracy" :markers="reportsMarkers" :onPress="showReportDialog"></Map>
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
                    v-if="!hasRouteCenter"
                    >
                    <v-icon>report_problem</v-icon>
                </v-btn>
                <ReportDialog v-model="dialog" :lat="reportLat" :lng="reportLng"></ReportDialog>
            </v-flex>
            <v-flex xs12 sm6 offset-sm3 md4 offset-md4 fill-height v-else class="pa-3">
                <template v-if="error">
                    <p class="text-xs-center">{{ error }}</p>
                    <p class="text-xs-center">
                        <v-btn role="button" color="blue" dark @click="initializePositionWatching">Retry</v-btn>
                    </p>
                    <p>{{ $t('misc.or') }}</p>
                    <p>
                        <AddressInput :label="$t('locationPicker.pickALocationManually')" :onInput="onManualLocationPicker" v-model="manualLocation"></AddressInput>
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

import AddressInput from '@/components/AddressInput.vue';
import Map from '@/components/Map.vue';
import ReportCard from '@/components/ReportCard.vue';
import ReportDialog from '@/components/ReportDialog/index.vue';

import * as constants from '@/constants';
import { distance, mockLocation } from '@/tools';
import store from '@/store';

export default {
    components: {
        AddressInput,
        Map,
        ReportCard,
        ReportDialog,
    },
    beforeRouteEnter(to, from, next) {
        if (to.name !== 'SharedMap') {
            if (!store.state.hasGoneThroughIntro) {
                return next({ name: 'Onboarding', replace: true });
            }
        }
        return next();
    },
    watch: {
        $route(to) {
            if (to.name === 'SharedMap') {
                this.setPositionFromRoute();
            }
        },
    },
    beforeDestroy() {
        this.disableNoSleep();
        this.disablePositionWatching();
        window.removeEventListener('keydown', this.hideReportDialogOnEsc);
        this.$store.dispatch('hideReportDetails');
    },
    computed: {
        hasRouteCenter() {
            return this.$route.params.lat && this.$route.params.lng;
        },
        mapZoom() {
            return this.$route.params.zoom ? parseInt(this.$route.params.zoom, 10) : null;
        },
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
            positionLatLng: null,
            manualLocation: null,
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
        setPositionFromRoute() {
            this.positionLatLng = [this.$route.params.lat, this.$route.params.lng];
        },
        handlePositionError(error) {
            this.error = `${this.$t('geolocation.errorFetchingPosition')} `;
            if (error.code === 1) {
                this.error += this.$t('geolocation.permissionDenied');
            } else if (error.code === 2) {
                this.error += this.$t('geolocation.positionUnavailable');
            } else {
                this.error += this.$t('geolocation.timeout');
            }
        },
        setPosition(position) {
            if (this.positionLatLng) {
                const distanceFromPreviousPoint = distance(
                    [this.positionLatLng[0], this.positionLatLng[1]],
                    [position.coords.latitude, position.coords.longitude],
                );
                if (distanceFromPreviousPoint > constants.UPDATE_REPORTS_DISTANCE_THRESHOLD) {
                    this.$store.dispatch('fetchReports');
                }
            }
            this.positionLatLng = [position.coords.latitude, position.coords.longitude];
            if (
                !this.$store.state.currentPosition ||
                this.positionLatLng[0] !== this.$store.state.currentPosition[0] ||
                this.positionLatLng[1] !== this.$store.state.currentPosition[1]
            ) {
                this.$store.dispatch('setCurrentPosition', { positionLatLng: this.positionLatLng });
            }
            this.positionHistory.push(this.positionLatLng);
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
            if (this.$store.state.settings.preventSuspend) {
                this.noSleep = new NoSleep();
                this.noSleep.enable();
            }
        },
        showReportDialog(latlng) {
            if (latlng) {
                this.reportLat = latlng.lat;
                this.reportLng = latlng.lng;
            } else {
                this.reportLat = this.positionLatLng[0];
                this.reportLng = this.positionLatLng[1];
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
        onManualLocationPicker(value) {
            this.positionLatLng = [value.latlng.lat, value.latlng.lng];
        },
    },
    mounted() {
        if (this.hasRouteCenter) {
            this.setPositionFromRoute();
        } else {
            this.setNoSleep();
            this.initializePositionWatching();
        }
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
