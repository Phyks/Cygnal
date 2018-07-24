<template>
    <v-container fluid fill-height class="no-padding">
        <v-layout row wrap fill-height>
            <ReportCard></ReportCard>
            <v-flex xs12 fill-height v-if="currentLatLng">
                <Map :mapZoom="mapZoom" :positionIsGPS="!hasRouteCenter" :positionLatLng="currentLatLng" :reportLatLng="reportLatLng" :polyline="positionHistory" :heading="heading" :accuracy="accuracy" :markers="reportsMarkers" :onPress="showReportDialog"></Map>
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
                <ReportDialog v-model="isReportDialogVisible" :latLng="reportLatLng" :onHide="resetReportLatLng"></ReportDialog>
            </v-flex>
            <v-flex xs12 sm6 offset-sm3 md4 offset-md4 fill-height v-else class="pa-3">
                <LocationError :error="error" :retryFunction="initializePositionWatching" v-if="error"></LocationError>
                <p class="text-xs-center" v-else>{{ $t('geolocation.fetching') }}</p>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import NoSleep from 'nosleep.js';

import LocationError from '@/components/LocationError.vue';
import Map from '@/components/Map.vue';
import ReportCard from '@/components/ReportCard.vue';
import ReportDialog from '@/components/ReportDialog/index.vue';

import * as constants from '@/constants';
import { distance, mockLocation } from '@/tools';

import i18n from '@/i18n';
import store from '@/store';

function handlePositionError(error) {
    // TODO: Not translated when changing locale
    let errorString = `${i18n.t('geolocation.errorFetchingPosition')} `;
    if (error.code === 1) {
        errorString += i18n.t('geolocation.permissionDenied');
    } else if (error.code === 2) {
        errorString += i18n.t('geolocation.positionUnavailable');
    } else {
        errorString += i18n.t('geolocation.timeout');
    }
    store.dispatch('setLocationError', { error: errorString });
}

function setPosition(position) {
    const currentLatLng = store.state.location.currentLatLng;
    if (currentLatLng) {
        const distanceFromPreviousPoint = distance(
            [currentLatLng[0], currentLatLng[1]],
            [position.coords.latitude, position.coords.longitude],
        );
        if (distanceFromPreviousPoint > constants.UPDATE_REPORTS_DISTANCE_THRESHOLD) {
            store.dispatch('fetchReports');
        }
    }
    store.dispatch(
        'setCurrentPosition',
        {
            accuracy: position.coords.accuracy ? position.coords.accuracy : null,
            heading: (
                (position.coords.heading !== null && !isNaN(position.coords.heading))
                ? position.coords.heading
                : null
            ),
            latLng: [position.coords.latitude, position.coords.longitude],
        },
    );
}

export default {
    beforeDestroy() {
        this.disableNoSleep();
        this.$store.dispatch('hideReportDetails');
    },
    beforeRouteEnter(to, from, next) {
        if (to.name !== 'SharedMap') {
            if (!store.state.hasGoneThroughIntro) {
                return next({ name: 'Onboarding', replace: true });
            }
        }
        return next();
    },
    components: {
        LocationError,
        Map,
        ReportCard,
        ReportDialog,
    },
    computed: {
        accuracy() {
            return this.$store.state.location.accuracy;
        },
        currentLatLng() {
            const currentLatLng = this.$store.state.location.currentLatLng;
            // Check that this is a correct position
            if (currentLatLng.some(item => item === null)) {
                return null;
            }
            return currentLatLng;
        },
        error() {
            return this.$store.state.location.error;
        },
        hasRouteCenter() {
            return this.$route.params.lat && this.$route.params.lng;
        },
        heading() {
            return this.$store.state.location.heading;
        },
        mapZoom() {
            return this.$route.params.zoom ? parseInt(this.$route.params.zoom, 10) : null;
        },
        positionHistory() {
            return this.$store.state.location.positionHistory;
        },
        reportsMarkers() {
            return this.$store.getters.notDismissedReports.map(report => ({
                id: report.id,
                type: report.attributes.type,
                latLng: [report.attributes.lat, report.attributes.lng],
            }));
        },
    },
    data() {
        return {
            centering: false,
            isReportDialogVisible: false,
            noSleep: null,
            reportLatLng: null,
        };
    },
    methods: {
        disableNoSleep() {
            if (this.noSleep) {
                this.noSleep.disable();
            }
        },
        initializePositionWatching() {
            if (this.$store.state.location.watcherID !== null) {
                // Already watching location, no need to add another watcher
                return;
            }

            this.$store.dispatch('setLocationError', { error: null }); // Reset any error

            // Set up a watcher
            let watchID = null;
            if (constants.MOCK_LOCATION) {
                setPosition(mockLocation());
                watchID = setInterval(
                    () => setPosition(mockLocation()),
                    constants.MOCK_LOCATION_UPDATE_INTERVAL,
                );
            } else {
                if (!('geolocation' in navigator)) {
                    this.$store.dispatch('setLocationError', { error: this.$t('geolocation.unavailable') });
                    return;
                }

                watchID = navigator.geolocation.watchPosition(
                    setPosition,
                    handlePositionError,
                    {
                        enableHighAccuracy: true,
                        maximumAge: 30000,
                    },
                );
            }
            this.$store.dispatch('setLocationWatcherId', { id: watchID });
        },
        resetReportLatLng() {
            this.reportLatLng = null;
        },
        setNoSleep() {
            if (this.$store.state.settings.preventSuspend) {
                this.noSleep = new NoSleep();
                this.noSleep.enable();
            }
        },
        setPositionFromRoute() {
            // TODO
            this.positionLatLng = [this.$route.params.lat, this.$route.params.lng];
        },
        showReportDialog(latlng) {
            if (latlng) {
                this.reportLatLng = [latlng.lat, latlng.lng];
            } else {
                this.reportLatLng = this.currentLatLng;
            }
            this.isReportDialogVisible = true;
        },
    },
    mounted() {
        // TODO
        if (this.hasRouteCenter) {
            this.setPositionFromRoute();
        } else {
            this.setNoSleep();
            this.initializePositionWatching();
        }
        this.$store.dispatch('fetchReports');
    },
    watch: {
        $route(to) {
            if (to.name === 'SharedMap') {
                this.setPositionFromRoute();
            }
        },
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
