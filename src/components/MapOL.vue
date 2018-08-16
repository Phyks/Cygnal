<template>
    <div class="fill-height fill-width">
        <div id="map" class="fill-height fill-width">
        </div>

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
// TODO:
//  * Position marker with heading
//  * markers
//  * polyline
//  * reportLatLng
import 'ol/ol.css';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import Point from 'ol/geom/Point';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import View from 'ol/View';
import { defaults as defaultControls } from 'ol/control';
import { fromLonLat, toLonLat } from 'ol/proj';
import {
    Circle as CircleStyle, Fill, Stroke, Style,
} from 'ol/style';

import * as constants from '@/constants';
import { distance } from '@/tools';

export default {
    computed: {
        headingInRadiansFromNorth() {
            if (this.heading !== null) {
                return this.heading * (Math.PI / 180); // in radians from North
            }
            return null;
        },
        olCenter() {
            return fromLonLat([this.center[1], this.center[0]]);
        },
        olPosition() {
            if (this.positionLatLng) {
                return fromLonLat([this.positionLatLng[1], this.positionLatLng[0]]);
            }
            return null;
        },
        radiusFromAccuracy() {
            if (this.accuracy && this.accuracy < constants.ACCURACY_DISPLAY_THRESHOLD) {
                // Compute the radius (in pixels) based on GPS accuracy, taking
                // into account the current zoom level
                // Formula coming from https://wiki.openstreetmap.org/wiki/Zoom_levels.
                const accuracyInPixels = this.accuracy / (
                    (constants.EARTH_RADIUS * 2 * Math.PI * Math.cos(this.positionLatLng[0]
                        * (Math.PI / 180)))
                    / (2 ** (this.zoom + 8))
                );
                if (accuracyInPixels > this.markerRadius) {
                    return accuracyInPixels;
                }
            }
            return null;
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
            positionFeature: null,
            accuracyFeature: null,
        };
    },
    methods: {
        handleClick(event) {
            event.preventDefault();
            event.stopPropagation();
            if (this.onPress) {
                const coords = toLonLat(event.coordinate).reverse();
                this.onPress(coords);
            }
            return false;
        },
        hideRecenterButton() {
            if (this.isRecenterButtonShown) {
                this.isRecenterButtonShown = false;
            }
        },
        onMoveStart() {
            if (!this.isProgrammaticMove) {
                this.showRecenterButton();
            }
        },
        onMoveEnd() {
            const view = this.map.getView();
            if (this.onMapCenterUpdate) {
                const mapCenterLonLat = toLonLat(view.getCenter());
                this.onMapCenterUpdate([mapCenterLonLat[1], mapCenterLonLat[0]]);
            }
            if (this.onMapZoomUpdate) {
                this.onMapZoomUpdate(view.getZoom());
            }
        },
        recenterMap() {
            const view = this.map.getView();
            this.hideRecenterButton();
            if (view.getZoom() !== this.zoom) {
                this.isProgrammaticMove = true;
                this.map.once('moveend', () => { this.isProgrammaticMove = false; });
            }
            const mapCenter = view.getCenter();
            if (
                mapCenter[0] !== this.olCenter[0]
                && mapCenter[1] !== this.olCenter[1]
            ) {
                this.isProgrammaticMove = true;
                this.map.once('moveend', () => { this.isProgrammaticMove = false; });
            }
            view.setCenter(this.olCenter);
            view.setZoom(this.zoom);
        },
        showRecenterButton() {
            if (!this.isRecenterButtonShown) {
                this.isRecenterButtonShown = true;
            }
        },
    },
    mounted() {
        const view = new View({
            center: this.olCenter,
            maxZoom: this.maxZoom,
            minZoom: this.minZoom,
            zoom: this.zoom,
        });

        this.accuracyFeature = new Feature();
        this.accuracyFeature.setStyle(new Style({
            image: new CircleStyle({
                radius: this.radiusFromAccuracy,
                fill: new Fill({
                    color: 'rgba(51, 153, 204, 0.25)',
                }),
                stroke: new Stroke({
                    color: '#3399CC',
                    width: 2,
                }),
            }),
        }));
        this.accuracyFeature.setGeometry(
            this.olPosition ? new Point(this.olPosition) : null,
        );
        this.positionFeature = new Feature();
        this.positionFeature.setStyle(new Style({
            image: new CircleStyle({
                radius: 6,
                fill: new Fill({
                    color: '#3399CC',
                }),
                stroke: new Stroke({
                    color: '#fff',
                    width: 2,
                }),
            }),
        }));
        this.positionFeature.setGeometry(
            this.olPosition ? new Point(this.olPosition) : null,
        );

        this.isProgrammaticMove = true;
        this.map = new Map({
            target: 'map',
            layers: [
                new TileLayer({
                    source: new XYZ({
                        url: this.tileServer,
                        attributions: this.attribution,
                    }),
                }),
                new VectorLayer({
                    source: new VectorSource({
                        features: [this.accuracyFeature, this.positionFeature],
                    }),
                }),
            ],
            controls: defaultControls({
                attributionOptions: {
                    collapsible: false,
                },
                rotateOptions: {
                    autoHide: false,
                },
            }),
            view,
        });
        this.map.once('moveend', () => {
            this.isProgrammaticMove = false;

            this.map.on('click', this.handleClick);
            this.map.on('movestart', this.onMoveStart);
            this.map.on('moveend', this.onMoveEnd);
        });
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
        olPosition(newOlPosition) {
            if (this.positionFeature) {
                this.positionFeature.setGeometry(
                    newOlPosition ? new Point(newOlPosition) : null,
                );
                this.accuracyFeature.setGeometry(
                    newOlPosition ? new Point(newOlPosition) : null,
                );
                this.accuracyFeature.getStyle().getImage().setRadius(this.radiusFromAccuracy);
            }
        },
        zoom(newZoom) {
            const view = this.map.getView();
            if (!this.map) {
                // Map should have been created
                return;
            }
            if (!this.isRecenterButtonShown) {
                // Handle programmatic navigation
                if (view.getZoom() !== newZoom) {
                    this.isProgrammaticMove = true;
                    this.map.once('moveend', () => { this.isProgrammaticMove = false; });
                }
                view.setZoom(newZoom);
            }
        },
        olCenter(newOlCenter) {
            if (!this.map) {
                // Map should have been created
                return;
            }

            const view = this.map.getView();
            if (!this.isRecenterButtonShown) {
                // Handle programmatic navigation
                if (view.getZoom() !== this.zoom) {
                    this.isProgrammaticMove = true;
                    this.map.once('moveend', () => { this.isProgrammaticMove = false; });
                }
                const currentCenter = view.getCenter();
                if (
                    currentCenter[0] !== newOlCenter[0]
                    && currentCenter[1] !== newOlCenter[1]
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
                                distance: distance(this.center, marker.latLng),
                            }),
                        ).filter(item => item.distance < constants.MIN_DISTANCE_REPORT_DETAILS);
                        const closestReport = distances.reduce( // Get the closest one
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
                view.setZoom(this.zoom);
                view.setCenter(newOlCenter);
            }
        },
    },
};
</script>

<style scoped>
.fill-width {
    width: 100%;
}
</style>
