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
                    :speed="currentSpeed"
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

import AppLogo from '@/assets/logo.svg';

function handlePositionError(error) {
    store.dispatch('setLocationError', { error: error.code });
}

function setPosition(position) {
    store.dispatch(
        'setCurrentPosition',
        { coords: position.coords, timestamp: position.timestamp },
    );
}

export default {
    beforeDestroy() {
        this.disableNoSleep();
        this.removeNotification();
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
            if (
                !this.currentLocation
                || !this.currentLocation.latitude
                || !this.currentLocation.longitude
            ) {
                return null;
            }
            return [this.currentLocation.latitude, this.currentLocation.longitude];
        },
        currentLocation() {
            return this.$store.getters.getLastLocation || {};
        },
        currentSpeed() {
            if (this.hasCenterProvidedByRoute || !this.currentLocation) {
                return null;
            }
            return Math.round(this.currentLocation.speed || 0, 0);
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
                return [
                    parseFloat(this.$route.params.lat),
                    parseFloat(this.$route.params.lng),
                ];
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
            return this.$store.state.reports.map(report => ({
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
            notification: null,
            notificationInitializationWatcher: null,
            reportLatLng: null,
        };
    },
    methods: {
        createNotification() {
            const $t = this.$t.bind(this);
            this.notification = new Notification(
                'Cycl\'Assist',
                { body: $t('notification.body'), icon: AppLogo, tag: 'CyclassistMap' },
            );
            this.notification.addEventListener('click', () => {
                this.showReportDialog();
                // Recreate permanent notification in case the OS closed it on click.
                this.createNotification();
            });
            this.notification.addEventListener('close', this.createNotification);

            // Remove the watcher if still there, no further need to watch properties.
            if (this.notificationInitializationWatcher) {
                this.notificationInitializationWatcher();
                this.notificationInitializationWatcher = null;
            }
        },
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
            // Update reports by default
            let distanceFromPreviousPoint = constants.UPDATE_REPORTS_DISTANCE_THRESHOLD + 1;

            // If last fetching location is known, only update reports if not too close
            const lastFetchingLocation = this.$store.state.lastReportFetchingLocation;
            if (
                lastFetchingLocation
                && lastFetchingLocation[0] !== null
                && lastFetchingLocation[1] !== null
            ) {
                distanceFromPreviousPoint = distance(
                    [lastFetchingLocation[0], lastFetchingLocation[1]],
                    [center[0], center[1]],
                );
            }

            // If necessary, refetch reports
            if (distanceFromPreviousPoint > constants.UPDATE_REPORTS_DISTANCE_THRESHOLD) {
                store.dispatch('setLastReportFetchingLocation', {
                    locationLatLng: center,
                });
                store.dispatch('fetchReports').catch(() => {});
            }

            this.$store.dispatch('setCurrentMapCenter', { center });
        },
        onMapZoomUpdate(zoom) {
            this.$store.dispatch('setCurrentMapZoom', { zoom });
        },
        removeNotification() {
            if (this.notification) {
                this.notification.removeEventListener('close', this.createNotification);
                this.notification.close();
                this.notification = null;
            }
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
        setupNotification() {
            if (
                !window.Notification
                || !this.$store.state.settings.hasPermanentNotificationPermission
            ) {
                // Ensure notification API is available and notification is wanted
                return;
            }

            const that = this;
            // Only create the notification once the position is ready
            const createNotificationWhenPositionIsReady = (newValue) => {
                if (newValue) {
                    that.createNotification();
                }
            };

            if (Notification.permission && Notification.permission === 'granted') {
                this.notificationInitializationWatcher = this.$watch(
                    'currentLatLng',
                    createNotificationWhenPositionIsReady,
                );
            } else {
                Notification.requestPermission((permission) => {
                    if (permission === 'granted') {
                        this.notificationInitializationWatcher = this.$watch(
                            'currentLatLng',
                            createNotificationWhenPositionIsReady,
                        );
                    }
                });
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
        this.setupNotification();

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
