<template>
    <v-container fluid fill-height class="no-padding">
        <v-layout row wrap fill-height>
            <ReportCard></ReportCard>
            <v-flex xs12 fill-height v-if="mapCenter">
                <Map
                    :accuracy="currentLocation.hdop"
                    :center="mapCenter"
                    :heading="currentLocation.heading"
                    :markers="reportsMarkers"
                    :onMapCenterUpdate="onMapCenterUpdate"
                    :onMapZoomUpdate="onMapZoomUpdate"
                    :onPress="showReportDialog"
                    :polyline="positionHistory"
                    :positionLatLng="currentLatLng"
                    :reportLatLng="reportLatLng"
                    :zoom="mapZoom"
                    ></Map>
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
                    v-if="!hasCenterProvidedByRoute"
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
    store.dispatch('setLocationError', { error: error.code });
}

function setPosition(position) {
    const lastLocation = store.getters.getLastLocation;
    if (lastLocation !== null) {
        // TODO: Should not be lastLocation
        const distanceFromPreviousPoint = distance(
            [lastLocation.latitude, lastLocation.longitude],
            [position.coords.latitude, position.coords.longitude],
        );
        if (distanceFromPreviousPoint > constants.UPDATE_REPORTS_DISTANCE_THRESHOLD) {
            store.dispatch('fetchReports');
        }
    }
    store.dispatch(
        'setCurrentPosition',
        { coords: position.coords, timestamp: position.timestamp },
    );
}

export default {
    beforeDestroy() {
        this.disableNoSleep();
        this.$store.dispatch('hideReportDetails');
    },
    components: {
        LocationError,
        Map,
        ReportCard,
        ReportDialog,
    },
    computed: {
        currentLatLng() {
            // Check that this is a correct position
            if (this.currentLocation === null) {
                return null;
            }
            return [this.currentLocation.latitude, this.currentLocation.longitude];
        },
        currentLocation() {
            return this.$store.getters.getLastLocation;
        },
        error() {
            const errorCode = this.$store.state.location.error;
            if (errorCode) {
                let errorString = `${i18n.t('geolocation.errorFetchingPosition')} `;
                if (errorCode === 1) {
                    errorString += i18n.t('geolocation.permissionDenied');
                } else if (errorCode === 2) {
                    errorString += i18n.t('geolocation.positionUnavailable');
                } else {
                    errorString += i18n.t('geolocation.timeout');
                }
                return errorString;
            }
            return null;
        },
        hasCenterProvidedByRoute() {
            return this.$route.params.lat && this.$route.params.lng;
        },
        mapCenter() {
            if (this.hasCenterProvidedByRoute) {
                return [this.$route.params.lat, this.$route.params.lng];
            }
            return this.currentLatLng;
        },
        mapZoom() {
            return (
                this.$route.params.zoom
                    ? parseInt(this.$route.params.zoom, 10)
                    : constants.DEFAULT_ZOOM
            );
        },
        positionHistory() {
            return this.$store.state.location.gpx.map(item => [item.latitude, item.longitude]);
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
                watchID = mockLocation(setPosition);
            } else {
                if (!('geolocation' in navigator)) {
                    const $t = this.$t.bind(this);
                    this.$store.dispatch('setLocationError', { error: $t('geolocation.unavailable') });
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
        onMapCenterUpdate(center) {
            this.$store.dispatch('setCurrentMapCenter', { center });
        },
        onMapZoomUpdate(zoom) {
            this.$store.dispatch('setCurrentMapZoom', { zoom });
        },
        resetReportLatLng() {
            this.reportLatLng = null;
        },
        setNoSleep() {
            if (this.$store.state.settings.hasPreventSuspendPermission) {
                this.noSleep = new NoSleep();
                this.noSleep.enable();
            }
        },
        showReportDialog(latlng) {
            if (latlng) {
                this.reportLatLng = [latlng[0], latlng[1]];
            } else {
                this.reportLatLng = this.currentLatLng;
            }
            this.isReportDialogVisible = true;
        },
    },
    mounted() {
        if (this.$route.name !== 'SharedMap') {
            // Only enable NoSleep in normal map view (with position tracking).
            this.setNoSleep();
            if (this.$store.state.settings.hasGeolocationPermission) {
                this.initializePositionWatching();
            } else {
                this.$store.state.location.error = 1;
            }

            // Eventually vibrate, to ensure permission is prompted before cycling
            if (this.$store.state.settings.hasVibratePermission
                && navigator.vibrate
                && !this.$store.state.hasVibratedOnce
            ) {
                navigator.vibrate(100);
                this.$store.dispatch('markHasVibratedOnce');
            }
        }
        this.$store.dispatch('fetchReports').catch(() => {});
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
