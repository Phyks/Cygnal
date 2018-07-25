<template>
    <div class="fill-height fill-width">
        <v-lmap
            ref="map"
            :minZoom="this.minZoom"
            :maxZoom="this.maxZoom"
            :options="{ zoomControl: false }"
            @click="handleClick"
            @movestart="onMoveStart"
            @moveend="onMoveEnd"
            @zoomstart="onZoomStart"
            >
            <v-ltilelayer :url="tileServer" :attribution="attribution"></v-ltilelayer>

            <template v-if="positionLatLng">
                <v-lts v-if="heading !== null" :lat-lng="positionLatLng" :options="markerOptions"></v-lts>
                <v-lcirclemarker
                    v-else
                    :lat-lng="positionLatLng"
                    :color="markerOptions.color"
                    :fillColor="markerOptions.fillColor"
                    :fillOpacity="1.0"
                    :weight="markerOptions.weight"
                    :radius="markerRadius"
                    >
                </v-lcirclemarker>

                <v-lcircle v-if="shouldDisplayAccuracy" :lat-lng="positionLatLng" :radius="radiusFromAccuracy"></v-lcircle>
            </template>

            <v-lpolyline :latLngs="polyline" :opacity="0.6" color="#00FF00"></v-lpolyline>

            <v-lmarker v-if="reportLatLng" :lat-lng="reportLatLng" :icon="unknownMarkerIcon"></v-lmarker>
            <ReportMarker v-for="marker in markers" :key="marker.id" :marker="marker"></ReportMarker>
        </v-lmap>
        <v-btn
            absolute
            dark
            fab
            large
            bottom
            left
            color="blue"
            class="overlayButton"
            v-if="isRecenterButtonShown"
            @click.native.stop="recenterMap"
            role="button"
            :aria-label="$t('buttons.recenterMap')"
            >
            <v-icon>my_location</v-icon>
        </v-btn>
    </div>
</template>

<script>
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

import compassNorthIcon from '@/assets/compassNorth.svg';
import unknownMarkerIcon from '@/assets/unknownMarker.svg';
import * as constants from '@/constants';
import { distance } from '@/tools';
import ReportMarker from './ReportMarker.vue';

// Fix for a bug in Leaflet default icon
// see https://github.com/PaulLeCam/react-leaflet/issues/255#issuecomment-261904061
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

export default {
    components: {
        ReportMarker,
    },
    computed: {
        markerOptions() {
            return {
                fillColor: '#00ff00',
                color: '#000000',
                heading: this.heading * (Math.PI / 180), // in radians from North
                weight: 1,
            };
        },
        radiusFromAccuracy() {
            if (this.accuracy) {
                // Compute the radius (in pixels) based on GPS accuracy, taking
                // into account the current zoom level
                // Formula coming from https://wiki.openstreetmap.org/wiki/Zoom_levels.
                return this.accuracy / (
                    (constants.EARTH_RADIUS * 2 * Math.PI * Math.cos(this.positionLatLng[0] *
                        (Math.PI / 180))) /
                    (2 ** (this.zoom + 8))
                );
            }
            return null;
        },
        shouldDisplayAccuracy() {
            // Only display accuracy if circle is large enough
            return (
                this.accuracy &&
                this.accuracy < constants.ACCURACY_DISPLAY_THRESHOLD &&
                this.radiusFromAccuracy > this.markerRadius
            );
        },
    },
    data() {
        return {
            attribution: this.$t('map.attribution'),
            isProgrammaticMove: false,
            isProgrammaticZoom: false,
            map: null,
            markerRadius: 10.0,
            maxZoom: constants.MAX_ZOOM,
            minZoom: constants.MIN_ZOOM,
            isRecenterButtonShown: false,
            tileServer: constants.TILE_SERVERS[this.$store.state.settings.tileServer],
            unknownMarkerIcon: L.icon({
                iconAnchor: [20, 40],
                iconSize: [40, 40],
                iconUrl: unknownMarkerIcon,
            }),
        };
    },
    methods: {
        handleClick(event) {
            if (this.onPress) {
                this.onPress(event.latlng);
            }
        },
        hideRecenterButton() {
            if (this.isRecenterButtonShown) {
                this.isRecenterButtonShown = false;
            }
        },
        onMoveStart() {
            if (!this.isProgrammaticMove && !this.isProgrammaticZoom) {
                this.showRecenterButton();
            }
        },
        onMoveEnd() {
            if (this.onMapCenterUpdate) {
                const mapCenter = this.map.getCenter();
                this.onMapCenterUpdate([mapCenter.lat, mapCenter.lng]);
            }
            if (this.onMapZoomUpdate) {
                this.onMapZoomUpdate(this.map.getZoom());
            }
        },
        onZoomStart() {
            if (!this.isProgrammaticZoom) {
                this.showRecenterButton();
            }
        },
        recenterMap() {
            this.hideRecenterButton();
            if (this.map.getZoom() !== this.zoom) {
                this.isProgrammaticZoom = true;
                this.map.once('zoomend', () => { this.isProgrammaticZoom = false; });
            }
            const mapCenter = this.map.getCenter();
            if (
                mapCenter.lat !== this.center[0] &&
                mapCenter.lng !== this.center[1]
            ) {
                this.isProgrammaticMove = true;
                this.map.once('moveend', () => { this.isProgrammaticMove = false; });
            }
            this.map.setView(this.center, this.zoom);
        },
        showCompass() {
            const north = L.control({ position: 'topright' });
            north.onAdd = () => {
                const div = L.DomUtil.create('div', 'compassIcon legend');
                div.innerHTML = `<img src="${compassNorthIcon}">`;
                L.DomEvent.disableClickPropagation(div);
                return div;
            };
            this.map.addControl(north);
        },
        showRecenterButton() {
            if (!this.isRecenterButtonShown) {
                this.isRecenterButtonShown = true;
            }
        },
    },
    mounted() {
        this.map = this.$refs.map.mapObject;
        if (this.map.getZoom() !== this.zoom) {
            this.isProgrammaticZoom = true;
            this.map.once('zoomend', () => { this.isProgrammaticZoom = false; });
        }
        const mapCenter = this.map.getCenter();
        if (
            mapCenter.lat !== this.center[0] &&
            mapCenter.lng !== this.center[1]
        ) {
            this.isProgrammaticMove = true;
            this.map.once('moveend', () => { this.isProgrammaticMove = false; });
        }
        this.map.setView(this.center, this.zoom);
        this.showCompass();
    },
    props: {
        accuracy: Number,
        center: {
            type: Array,
            required: true,
        },
        heading: Number, // in degrees, clockwise wrt north
        markers: Array,
        onPress: Function,
        onMapCenterUpdate: Function,
        onMapZoomUpdate: Function,
        polyline: Array,
        positionLatLng: Array,
        reportLatLng: Array,
        zoom: {
            type: Number,
            required: true,
        },
    },
    watch: {
        zoom(newZoom) {
            if (!this.map) {
                // Map should have been created
                return;
            }
            if (!this.isRecenterButtonShown) {
                // Handle programmatic navigation
                if (this.map.getZoom() !== newZoom) {
                    this.isProgrammaticZoom = true;
                    this.map.once('zoomend', () => { this.isProgrammaticZoom = false; });
                }
                this.map.setZoom(newZoom);
            }
        },
        center(newCenterLatLng) {
            if (!this.map) {
                // Map should have been created
                return;
            }

            if (!this.isRecenterButtonShown) {
                // Handle programmatic navigation
                if (this.map.getZoom() !== this.zoom) {
                    this.isProgrammaticZoom = true;
                    this.map.once('zoomend', () => { this.isProgrammaticZoom = false; });
                }
                if (
                    this.map.getCenter().lat !== newCenterLatLng[0] &&
                    this.map.getCenter().lng !== newCenterLatLng[1]
                ) {
                    this.isProgrammaticMove = true;
                    this.map.once('moveend', () => { this.isProgrammaticMove = false; });

                    // Eventually display closest report
                    const isReportDetailsAlreadyShown = this.$store.state.reportDetails.id;
                    const isReportDetailsOpenedByUser = this.$store.state.reportDetails.userAsked;
                    if (!isReportDetailsAlreadyShown || !isReportDetailsOpenedByUser) {
                        // Compute all markers distance, filter by max distance
                        const distances = this.markers.map(
                            marker => ({
                                id: marker.id,
                                distance: distance(newCenterLatLng, marker.latLng),
                            }),
                        ).filter(item => item.distance < constants.MIN_DISTANCE_REPORT_DETAILS);
                        const closestReport = distances.reduce(  // Get the closest one
                            (acc, item) => (
                                item.distance < acc.distance ? item : acc
                            ),
                            { distance: Number.MAX_VALUE, id: -1 },
                        );
                        // TODO: Take into account the history of positions for the direction
                        if (closestReport.id !== -1) {
                            this.$store.dispatch('showReportDetails', { id: closestReport.id, userAsked: false });
                        } else {
                            this.$store.dispatch('hideReportDetails');
                        }
                    }
                }
                this.map.setView(newCenterLatLng, this.zoom);
            }
        },
    },
};
</script>

<style>
.application .leaflet-bar a {
    color: black;
}

.compassIcon {
    background-color: white;
    border-radius: 50%;
    width: 42px;
    height: 42px;
    box-shadow: 0 3px 5px -1px rgba(0,0,0,.2),0 6px 10px 0 rgba(0,0,0,.14),0 1px 18px 0 rgba(0,0,0,.12);
    -webkite-box-shadow: 0 3px 5px -1px rgba(0,0,0,.2),0 6px 10px 0 rgba(0,0,0,.14),0 1px 18px 0 rgba(0,0,0,.12);
}

.compassIcon img {
    width: 100%;
    height: 100%;
}
</style>

<style scoped>
.fill-width {
    width: 100%;
}
</style>
