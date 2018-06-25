<template>
    <v-container fluid fill-height class="no-padding">
        <v-layout row wrap fill-height>
            <v-flex xs12 fill-height v-if="lat && lng">
                <Map :lat="lat" :lng="lng" :heading="heading"></Map>
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

import { MOCK_LOCATION } from '@/constants';
import Map from '@/components/Map.vue';
import ReportDialog from '@/components/ReportDialog/index.vue';

export default {
    components: {
        Map,
        ReportDialog,
    },
    created() {
        this.initializePositionWatching();
        this.setNoSleep();
    },
    beforeDestroy() {
        this.disableNoSleep();
        this.disablePositionWatching();
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

            if (!('geolocation' in navigator)) {
                this.error = this.$t('geolocation.unavailable');
            }

            if (MOCK_LOCATION) {
                this.lat = MOCK_LOCATION.lat;
                this.lng = MOCK_LOCATION.lng;
                this.heading = MOCK_LOCATION.heading;
            } else {
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
                navigator.geolocation.clearWatch(this.watchID);
            }
        },
        handlePositionError(error) {
            this.error = `Error ${error.code}: ${error.message}`;
        },
        setPosition(position) {
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
            console.log(this.noSleep);
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
