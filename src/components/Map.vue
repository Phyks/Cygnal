<template>
    <div class="fill-height fill-width">
        <v-lmap ref="map" :minZoom="this.minZoom" :maxZoom="this.maxZoom" :options="{ zoomControl: false }" @contextmenu="handleLongPress" @mousedown="onMouseDown" @mouseup="onMouseUp" @movestart="onMoveStart" @zoomstart="onZoomStart">
            <v-ltilelayer :url="tileServer" :attribution="attribution"></v-ltilelayer>

            <v-lts v-if="heading" :lat-lng="positionLatLng" :options="markerOptions"></v-lts>
            <v-lcirclemarker v-else :lat-lng="positionLatLng" :color="markerOptions.color" :fillColor="markerOptions.fillColor" :fillOpacity="1.0" :weight="markerOptions.weight" :radius="markerRadius"></v-lcirclemarker>

            <v-lcircle v-if="shouldDisplayAccuracy" :lat-lng="positionLatLng" :radius="radiusFromAccuracy"></v-lcircle>

            <ReportMarker v-for="marker in markers" :key="marker.id" :marker="marker"></ReportMarker>
        </v-lmap>
    </div>
</template>

<script>
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

import compassNorthIcon from '@/assets/compassNorth.svg';
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
        markers: Array,
        onLongPress: Function,
        positionLatLng: Array,
    },
    computed: {
        radiusFromAccuracy() {
            if (this.accuracy) {
                return this.accuracy / (
                    (constants.EARTH_RADIUS * 2 * Math.PI * Math.cos(this.positionLatLng[0] *
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
    mounted() {
        this.map = this.$refs.map.mapObject;
        if (this.map.getZoom() !== this.zoom) {
            this.isProgrammaticZoom = true;
            this.map.once('zoomend', () => { this.isProgrammaticZoom = false; });
        }
        this.map.setView(this.positionLatLng, this.zoom);
        this.showCompass();
    },
    updated() {
        if (!this.recenterButton) {
            if (this.map.getZoom() !== this.zoom) {
                this.isProgrammaticZoom = true;
                this.map.once('zoomend', () => { this.isProgrammaticZoom = false; });
            }
            this.map.setView(this.positionLatLng, this.zoom);
        }
    },
    data() {
        return {
            attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
            zoom: constants.DEFAULT_ZOOM,
            markerRadius: 10.0,
            minZoom: constants.MIN_ZOOM,
            maxZoom: constants.MAX_ZOOM,
            tileServer: constants.TILE_SERVER,
            isMouseDown: false,
            isProgrammaticZoom: false,
            recenterButton: null,
            map: null,
        };
    },
    methods: {
        handleLongPress(event) {
            if (this.onLongPress) {
                this.onLongPress(event.latlng);
            }
        },
        onMouseDown() {
            this.isMouseDown = true;
        },
        onMouseUp() {
            this.isMouseDown = false;
        },
        onMoveStart() {
            if (this.isMouseDown && !this.recenterButton) {
                this.showRecenterButton();
            }
        },
        onZoomStart() {
            if (!this.isProgrammaticZoom) {
                this.showRecenterButton();
            }
        },
        showCompass() {
            const north = L.control({ position: 'topright' });
            north.onAdd = () => {
                const div = L.DomUtil.create('div', 'compassIcon legend');
                div.innerHTML = `<img src="${compassNorthIcon}">`;
                return div;
            };
            this.map.addControl(north);
        },
        showRecenterButton() {
            if (!this.recenterButton) {
                this.recenterButton = L.control({ position: 'bottomleft' });
                this.recenterButton.onAdd = () => {
                    const btn = L.DomUtil.create('button', 'overlayButton btn btn--floating btn--large theme--dark blue legend');
                    btn.type = 'button';
                    btn.addEventListener('click', this.recenterMap);
                    btn.innerHTML = '<div class="btn__content"><i aria-hidden="true" class="icon material-icons">my_location</i></div>';
                    return btn;
                };
                this.map.addControl(this.recenterButton);
            }
        },
        hideRecenterButton() {
            if (this.recenterButton) {
                this.map.removeControl(this.recenterButton);
                this.recenterButton = null;
            }
        },
        recenterMap() {
            this.hideRecenterButton();
            if (this.map.getZoom() !== this.zoom) {
                this.isProgrammaticZoom = true;
                this.map.once('zoomend', () => { this.isProgrammaticZoom = false; });
            }
            this.map.setView(this.positionLatLng, this.zoom);
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
