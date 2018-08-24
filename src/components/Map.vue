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
// TODO: Map going outside of container + on resize ?
// TODO: Track symbol should be an arrow
import 'ol/ol.css';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import View from 'ol/View';
import { defaults as defaultControls } from 'ol/control';
import { fromLonLat, toLonLat } from 'ol/proj';
import {
    Circle as CircleStyle, Fill, Icon, Stroke, Style,
} from 'ol/style';

import compassNorthIcon from '@/assets/compassNorth.svg';
import unknownMarkerIcon from '@/assets/unknownMarker.svg';
import * as constants from '@/constants';
import { distance } from '@/tools';

const MAIN_VECTOR_LAYER_NAME = 'MAIN';
const REPORTS_MARKERS_VECTOR_LAYER_NAME = 'REPORTS_MARKERS';

export default {
    computed: {
        reportDetailsID() {
            // Get the currently shown report details ID
            return this.$store.state.reportDetails.id;
        },
        olCenter() {
            // Compute center in OL coordinates system
            return fromLonLat([this.center[1], this.center[0]]);
        },
        olPolyline() {
            // Compute the polyline in OL coordinates system
            return this.polyline.map(item => fromLonLat([item[1], item[0]]));
        },
        olPosition() {
            // Compute the current position in OL coordinates system
            if (this.positionLatLng) {
                return fromLonLat([this.positionLatLng[1], this.positionLatLng[0]]);
            }
            return null;
        },
        radiusFromAccuracy() {
            // Compute the radius (in pixels) based on GPS accuracy, taking
            // into account the current zoom level
            if (this.accuracy && this.accuracy < constants.ACCURACY_DISPLAY_THRESHOLD) {
                // Formula coming from https://wiki.openstreetmap.org/wiki/Zoom_levels.
                const accuracyInPixels = this.accuracy / (
                    (constants.EARTH_RADIUS * 2 * Math.PI * Math.cos(this.positionLatLng[0]
                        * (Math.PI / 180)))
                    / (2 ** (this.zoom + 8))
                );
                if (accuracyInPixels > constants.POSITION_MARKER_RADIUS) {
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
            // Remove the protocol part, avoid easily avoidable unsecured
            // content over HTTPS.
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
            maxZoom: constants.MAX_ZOOM,
            minZoom: constants.MIN_ZOOM,
            isRecenterButtonShown: false,
            // Variables for easy access to map feature and layers
            accuracyFeature: null,
            reportsMarkersFeatures: {},
            reportsMarkersVectorSource: null,
            mainVectorSource: null,
            polylineFeature: null,
            positionFeature: null,
            reportLatLngFeature: null,
        };
    },
    methods: {
        deleteReportMarker(markerID) {
            const feature = this.reportsMarkersFeatures[markerID];
            if (feature) {
                this.reportsMarkersVectorSource.removeFeature(feature);
                delete this.reportsMarkersFeatures[markerID]; // careful to delete the item itself
            }
        },
        drawReportMarker(marker, addedMarkersIDs) {
            if ((addedMarkersIDs && !addedMarkersIDs.has(marker.id))
                || this.reportsMarkersFeatures[marker.id]
            ) {
                // Skip the marker if it was not added or is already on the map
                return;
            }

            // Create a Feature for the marker, to add it on the map
            const reportMarkerFeature = new Feature({
                geometry: new Point(fromLonLat([marker.latLng[1], marker.latLng[0]])),
                id: marker.id,
            });
            reportMarkerFeature.setStyle(new Style({
                image: new Icon({
                    anchor: constants.ICON_ANCHOR,
                    scale: (
                        marker.id === this.reportDetailsID
                            ? constants.LARGE_ICON_SCALE
                            : constants.NORMAL_ICON_SCALE
                    ),
                    src: constants.REPORT_TYPES[marker.type].marker,
                }),
            }));
            // Add the marker to the map and keep a reference to it
            this.reportsMarkersFeatures[marker.id] = reportMarkerFeature;
            this.reportsMarkersVectorSource.addFeature(reportMarkerFeature);
        },
        handleClick(event) {
            console.log('MAP', event);
            event.preventDefault();
            event.stopPropagation();

            let isClickOnMarker = false;
            if (this.map) {
                this.map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
                    if (layer.get('name') !== REPORTS_MARKERS_VECTOR_LAYER_NAME) {
                        return;
                    }
                    isClickOnMarker = true;
                    this.$store.dispatch(
                        'showReportDetails',
                        { id: feature.get('id'), userAsked: true },
                    );
                });
            }

            if (!isClickOnMarker && this.onPress) {
                // Reverse coordinates as OL uses lng first.
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
            const mapCenter = view.getCenter();

            this.hideRecenterButton();

            if (
                view.getZoom() !== this.zoom
                || mapCenter[0] !== this.olCenter[0]
                || mapCenter[1] !== this.olCenter[1]
                || view.getRotation() !== 0
            ) {
                this.isProgrammaticMove = true;
                this.map.once('moveend', () => { this.isProgrammaticMove = false; });
            }
            view.setCenter(this.olCenter);
            view.setRotation(0);
            view.setZoom(this.zoom);
        },
        showRecenterButton() {
            if (!this.isRecenterButtonShown) {
                this.isRecenterButtonShown = true;
            }
        },
    },
    mounted() {
        // Create accuracy circle feature
        this.accuracyFeature = new Feature({
            geometry: this.olPosition ? new Point(this.olPosition) : null,
        });
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

        // Create position marker feature
        this.positionFeature = new Feature({
            geometry: this.olPosition ? new Point(this.olPosition) : null,
        });
        this.positionFeature.setStyle(new Style({
            image: new CircleStyle({
                radius: constants.POSITION_MARKER_RADIUS,
                fill: new Fill({
                    color: '#3399CC',
                }),
                stroke: new Stroke({
                    color: '#fff',
                    width: 2,
                }),
            }),
        }));

        // Create polyline feature
        this.polylineFeature = new Feature({
            geometry: new LineString(this.olPolyline),
        });

        // Initialize the map
        this.isProgrammaticMove = true;
        this.mainVectorSource = new VectorSource({
            features: [
                this.accuracyFeature,
                this.positionFeature,
                this.polylineFeature,
            ],
        });
        // Initialize markers
        this.reportsMarkersVectorSource = new VectorSource();
        this.markers.forEach(marker => this.drawReportMarker(marker, null));
        // Create the rotate label
        const rotateLabel = document.createElement('img');
        rotateLabel.src = compassNorthIcon;
        rotateLabel.style.width = '100%';
        rotateLabel.style.height = '100%';
        // Create the map object
        this.map = new Map({
            controls: defaultControls({
                attributionOptions: {
                    collapsible: false,
                },
                rotateOptions: {
                    autoHide: false,
                    label: rotateLabel,
                },
                zoom: false,
            }),
            layers: [
                new TileLayer({
                    source: new XYZ({
                        url: this.tileServer,
                        attributions: this.attribution,
                    }),
                }),
                new VectorLayer({
                    name: MAIN_VECTOR_LAYER_NAME,
                    source: this.mainVectorSource,
                }),
                new VectorLayer({
                    name: REPORTS_MARKERS_VECTOR_LAYER_NAME,
                    source: this.reportsMarkersVectorSource,
                }),
            ],
            target: 'map',
            view: new View({
                center: this.olCenter,
                maxZoom: this.maxZoom,
                minZoom: this.minZoom,
                rotation: 0,
                zoom: this.zoom,
            }),
        });
        this.map.once('moveend', () => {
            this.isProgrammaticMove = false;

            this.map.on('click', this.handleClick);
            // Take care that OpenLayer map actually catches "pointerdown"
            // events and not "click" events. Then, we need an explicit event
            // handler for "click" to stop propagation to ReportCard component.
            document.querySelector('#map').addEventListener(
                'click',
                event => event.stopPropagation(),
            );
            this.map.on('movestart', this.onMoveStart);
            this.map.on('moveend', this.onMoveEnd);
        });

        // Set pointer to hover when hovering a report marker
        this.map.on('pointermove', (event) => {
            if (event.dragging) {
                return;
            }

            const hit = this.map.hasFeatureAtPixel(event.pixel, {
                layerFilter: layer => layer.get('name') === REPORTS_MARKERS_VECTOR_LAYER_NAME,
            });
            this.map.getTargetElement().style.cursor = hit ? 'pointer' : '';
        });
    },
    props: {
        accuracy: Number,
        center: {
            type: Array,
            required: true,
        },
        // TODO: Handle heading
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
        reportDetailsID(newID, oldID) {
            [oldID, newID].forEach((id) => {
                // We actually have to delete and recreate the feature,
                // OpenLayer won't refresh the view if we only change the
                // size. :/
                this.deleteReportMarker(id);
                const marker = this.markers.find(item => item.id === id);
                if (marker) {
                    this.drawReportMarker(marker, null);
                }
            });
        },
        markers(newMarkers, oldMarkers) {
            // Map should have been created
            if (this.reportsMarkersVectorSource === null) {
                return;
            }

            // Compute the diff between old and new marker arrays, to determine
            // added and removed markers
            const oldIDs = new Set(oldMarkers.map(item => item.id));
            const newIDs = new Set(newMarkers.map(item => item.id));

            // Add new markers to the map
            const addedMarkersIDs = new Set([...newIDs].filter(x => !oldIDs.has(x)));
            this.markers.forEach(marker => this.drawReportMarker(marker, addedMarkersIDs));

            // Remove removed markers from the map
            const removedMarkersIDs = [...oldIDs].filter(x => !newIDs.has(x));
            removedMarkersIDs.forEach(id => this.deleteReportMarker(id));
        },
        olCenter(newOlCenter) {
            if (!this.map) {
                // Map should have been created
                return;
            }

            const view = this.map.getView();
            if (!this.isRecenterButtonShown) {
                const currentCenter = view.getCenter();
                // Handle programmatic navigation
                if (
                    view.getZoom() !== this.zoom
                    || currentCenter[0] !== newOlCenter[0]
                    || currentCenter[1] !== newOlCenter[1]
                ) {
                    this.isProgrammaticMove = true;
                    this.map.once('moveend', () => { this.isProgrammaticMove = false; });
                }

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

                // Update view
                view.setCenter(newOlCenter);
                view.setRotation(0);
                view.setZoom(this.zoom);
            }
        },
        olPolyline(newOlPolyline) {
            if (this.polylineFeature) {
                // Update polyline trace
                this.polylineFeature.setGeometry(new LineString(newOlPolyline));
            }
        },
        olPosition(newOlPosition) {
            if (this.positionFeature) {
                // Update position marker position
                this.positionFeature.setGeometry(
                    newOlPosition ? new Point(newOlPosition) : null,
                );
            }
            if (this.accuracyFeature) {
                // Update accuracy circle position and radius
                this.accuracyFeature.setGeometry(
                    newOlPosition ? new Point(newOlPosition) : null,
                );
                this.accuracyFeature.getStyle().getImage().setRadius(this.radiusFromAccuracy);
            }
        },
        reportLatLng(newReportLatLng) {
            // Eventually remove old marker
            if (this.reportLatLngFeature && this.mainVectorSource) {
                this.mainVectorSource.removeFeature(this.reportLatLngFeature);
                this.reportLatLngFeature = null;
            }

            // Create unknown report marker if needed
            if (newReportLatLng && this.mainVectorSource) {
                this.reportLatLngFeature = new Feature({
                    geometry: new Point(fromLonLat([newReportLatLng[1], newReportLatLng[0]])),
                });
                this.reportLatLngFeature.setStyle(new Style({
                    image: new Icon({
                        anchor: constants.ICON_ANCHOR,
                        scale: constants.NORMAL_ICON_SCALE,
                        src: unknownMarkerIcon,
                    }),
                }));
                this.mainVectorSource.addFeature(this.reportLatLngFeature);
            }
        },
        zoom(newZoom) {
            if (!this.map) {
                // Map should have been created
                return;
            }
            const view = this.map.getView();
            if (!this.isRecenterButtonShown) {
                // Handle programmatic navigation
                if (view.getZoom() !== newZoom) {
                    this.isProgrammaticMove = true;
                    this.map.once('moveend', () => { this.isProgrammaticMove = false; });
                }
                view.setZoom(newZoom);
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

<style>
#map .ol-control button {
    height: 3em !important;
    width: 3em !important;
}

#map .ol-rotate {
    background: none !important;
}

#map .ol-rotate button {
    background-color: white !important;
    border: 1px solid rgba(0, 0, 0, .87);
    border-radius: 100%;
}
</style>
