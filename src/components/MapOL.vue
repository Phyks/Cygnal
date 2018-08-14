<template>
    <div class="fill-height fill-width">
        <vl-map
            :load-tiles-while-animating="true"
            :load-tiles-while-interacting="true"
            data-projection="EPSG:4326"
            >
            <vl-view :zoom.sync="zoomComputed" :center.sync="centerComputed" :rotation.sync="rotation"></vl-view>

            <vl-layer-tile>
                <vl-source-xyz
                    :attributions="attribution"
                    :url="tileServer"
                    :minZoom="minZoom"
                    :maxZoom="maxZoom"
                    >
                </vl-source-xyz>
            </vl-layer-tile>
        </vl-map>
    </div>
</template>

<script>
import Vue from 'vue';
import VueLayers from 'vuelayers';
import 'vuelayers/lib/style.css';

import * as constants from '@/constants';

Vue.use(VueLayers, {
    dataProjection: 'EPSG:4326',
});

export default {
    computed: {
        centerComputed: {
            get() {
                return this.center.reverse();
            },
            set(newVal) {
                this.onMapCenterUpdate(newVal);
            },
        },
        zoomComputed: {
            get() {
                return this.zoom;
            },
            set(newVal) {
                this.onMapZoomUpdate(newVal);
            },
        },
        tileServer() {
            const tileServerSetting = this.$store.state.settings.tileServer;
            if (tileServerSetting in constants.TILE_SERVERS) {
                return constants.TILE_SERVERS[tileServerSetting];
            }
            const firstColon = tileServerSetting.indexOf(':');
            return tileServerSetting.substring(firstColon + 1);
        },
    },
    data() {
        const $t = this.$t.bind(this);
        return {
            attribution: $t('map.attribution'),
            isProgrammaticMove: false,
            isProgrammaticZoom: false,
            map: null,
            markerOptions: {
                fill: true,
                fillColor: '#00ff00',
                fillOpacity: 1.0,
                color: '#000000',
                opacity: 1.0,
                weight: 1,
            },
            markerRadius: 10.0,
            maxZoom: constants.MAX_ZOOM,
            minZoom: constants.MIN_ZOOM,
            isRecenterButtonShown: false,
            rotation: 0,
            geolocPosition: undefined,
        };
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
};
</script>

<style scoped>
.fill-width {
    width: 100%;
}
</style>
