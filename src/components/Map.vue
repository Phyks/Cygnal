<template>
    <div class="fill-height fill-width">
        <v-lmap :center="latLng" :zoom="this.zoom" :minZoom="this.minZoom" :maxZoom="this.maxZoom" :options="{ zoomControl: false }" @contextmenu="handleLongPress" @moveend="onMoveEnd" @movestart="onMoveStart">
            <v-ltilelayer :url="tileServer" :attribution="attribution"></v-ltilelayer>

            <v-lts v-if="heading" :lat-lng="positionLatLng" :options="markerOptions"></v-lts>
            <v-lcirclemarker v-else :lat-lng="positionLatLng" :color="markerOptions.color" :fillColor="markerOptions.fillColor" :fillOpacity="1.0" :weight="markerOptions.weight" :radius="markerRadius"></v-lcirclemarker>

            <v-lcircle v-if="shouldDisplayAccuracy" :lat-lng="latlng" :radius="radiusFromAccuracy"></v-lcircle>

            <ReportMarker v-for="marker in markers" :key="marker.id" :marker="marker"></ReportMarker>
        </v-lmap>
    </div>
</template>

<script>
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

import * as constants from '@/constants';
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
    props: {
        accuracy: {
            type: Number,
            default: null,
        },
        heading: Number,
        latLng: Array,
        markers: Array,
        onLongPress: Function,
        onMoveEnd: Function,
        onMoveStart: Function,
        positionLatLng: Array,
    },
    computed: {
        radiusFromAccuracy() {
            if (this.accuracy) {
                return this.accuracy / (
                    (constants.EARTH_RADIUS * 2 * Math.PI * Math.cos(this.latLng[0] *
                        (Math.PI / 180))) /
                    (2 ** (this.zoom + 8))
                );
            }
            return null;
        },
        shouldDisplayAccuracy() {
            return (
                this.accuracy &&
                this.accuracy < 100 &&
                this.radiusFromAccuracy > this.markerRadius
            );
        },
        markerOptions() {
            return {
                fillColor: '#00ff00',
                color: '#000000',
                heading: this.heading,
                weight: 1,
            };
        },
    },
    data() {
        return {
            attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
            zoom: constants.DEFAULT_ZOOM,
            markerRadius: 10.0,
            minZoom: constants.MIN_ZOOM,
            maxZoom: constants.MAX_ZOOM,
            tileServer: constants.TILE_SERVER,
        };
    },
    methods: {
        handleLongPress(event) {
            if (this.onLongPress) {
                this.onLongPress(event.latlng);
            }
        },
    },
};
</script>

<style>
.application .leaflet-bar a {
    color: black;
}
</style>

<style scoped>
.fill-width {
    width: 100%;
}
</style>
