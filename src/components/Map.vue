<template>
    <div class="fill-height fill-width">
        <v-lmap :center="latlng" :zoom="this.zoom" :minZoom="this.minZoom" :maxZoom="this.maxZoom" :options="{ zoomControl: false }">
            <v-ltilelayer :url="tileServer" :attribution="attribution"></v-ltilelayer>
            <v-lts :lat-lng="latlng" :options="markerOptions"></v-lts>
            <v-lmarker v-for="marker in markers" :key="marker.id" :lat-lng="marker.latLng"></v-lmarker>
        </v-lmap>
    </div>
</template>

<script>
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix for a bug in Leaflet default icon
// see https://github.com/PaulLeCam/react-leaflet/issues/255#issuecomment-261904061
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

export const DEFAULT_ZOOM = 17;
export const MIN_ZOOM = 15;
export const MAX_ZOOM = 18;
export const TILE_SERVER = process.env.TILE_SERVER || 'https://a.tile.thunderforest.com/cycle/{z}/{x}/{y}.png';


export default {
    props: {
        heading: Number,
        lat: Number,
        lng: Number,
        markers: Array,
    },
    computed: {
        latlng() {
            return [this.lat, this.lng];
        },
        markerOptions() {
            return {
                fillColor: '#00ff00',
                heading: this.heading,
            };
        },
    },
    data() {
        return {
            attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
            zoom: DEFAULT_ZOOM,
            minZoom: MIN_ZOOM,
            maxZoom: MAX_ZOOM,
            tileServer: TILE_SERVER,
        };
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
