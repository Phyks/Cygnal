<template>
    <v-layout row fill-height wrap>
        <v-flex xs12 class="speed-badge text-xs-center white" v-if="speedInKmH !== null">
            <span class="title speed-badge-title mt-2">{{ speedInKmH }}</span>
            <span class="caption">km/h</span>
        </v-flex>

        <v-flex xs12 id="map" :style="{ height: mapElementHeight }"></v-flex>

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
    </v-layout>
</template>

<script>
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import View from 'ol/View';
import { defaults as defaultControls, Rotate } from 'ol/control';
import { fromLonLat, toLonLat } from 'ol/proj';
import {
    Circle as CircleStyle, Fill, Icon, Stroke, Style, Text,
} from 'ol/style';

import compassIcon from '@/assets/compass.svg';
import compassNorthIcon from '@/assets/compassNorth.svg';
import unknownMarkerIcon from '@/assets/unknownMarker.svg';
import * as constants from '@/constants';
import { distance } from '@/tools';

const MAIN_VECTOR_LAYER_NAME = 'MAIN';
const REPORTS_MARKERS_VECTOR_LAYER_NAME = 'REPORTS_MARKERS';

export default {
    computed: {
        headingInRadiansFromNorth() {
            if (this.heading !== null) {
                // in radians from North
                return 1.0 * this.heading * (Math.PI / 180);
            }
            return null;
        },
        isInAutorotateMap() {
            return this.isRecenterButtonShown ? false : this.hasUserAutorotateMap;
        },
        mapElementHeight() {
            // Recompute automatically the map element max height
            // Use logic from VToolbar to compute the toolbar height
            // FIXME: Ugly hack, easier way I found.
            let toolbarHeight = 56;
            if (this.$vuetify.breakpoint.mdAndUp) {
                toolbarHeight = 64;
            } else if (this.$vuetify.breakpoint.width > this.$vuetify.breakpoint.height) {
                toolbarHeight = 48;
            }
            return `${this.$vuetify.breakpoint.height - toolbarHeight}px`;
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
        reportDetailsID() {
            // Get the currently shown report details ID
            return this.$store.state.reportDetails.id;
        },
        speedInKmH() {
            // Convert speed from m/s to km/h
            if (this.speed !== null && this.speed !== undefined) {
                return this.speed * 3600 / 1000;
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
            hasUserAutorotateMap: this.$store.state.settings.shouldAutorotateMap,
            isProgrammaticMove: true,
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
        onMoveEnd() {
            const view = this.map.getView();
            if (this.onMapCenterUpdate) {
                const mapCenterLonLat = toLonLat(view.getCenter());
                this.onMapCenterUpdate([mapCenterLonLat[1], mapCenterLonLat[0]]);
            }
            // Show recenter button and call the callback if zoom is updated manually
            const zoom = view.getZoom();
            if (zoom !== this.zoom) {
                this.showRecenterButton();
                if (this.onMapZoomUpdate) {
                    this.onMapZoomUpdate(zoom);
                }
            }
        },
        recenterMap() {
            this.isProgrammaticMove = true;

            this.hideRecenterButton();

            const view = this.map.getView();
            view.setCenter(this.olCenter);
            if (this.isInAutorotateMap) {
                view.setRotation(-this.headingInRadiansFromNorth);
            } else {
                view.setRotation(0);
            }
            view.setZoom(this.zoom);
        },
        setPositionFeatureStyle() {
            if (!this.map || !this.positionFeature) {
                return;
            }

            const positionFeatureStyle = this.positionFeature.getStyle();

            // If heading is specified
            if (this.headingInRadiansFromNorth !== null) {
                const rotation = (this.isInAutorotateMap
                    ? -this.map.getView().getRotation() - Math.PI / 2
                    : (
                        this.headingInRadiansFromNorth
                        + this.map.getView().getRotation()
                        + Math.PI / 2
                    )
                );
                // Check current style and update rotation if an arrow is already drawn
                if (positionFeatureStyle) {
                    const TextStyle = positionFeatureStyle.getText();
                    if (TextStyle) {
                        TextStyle.setRotation(rotation);
                        return;
                    }
                }
                // Replace style by an arrow otherwise
                this.positionFeature.setStyle(new Style({
                    text: new Text({
                        textBaseline: 'middle',
                        offsetX: 0,
                        offsetY: 0,
                        rotateWithView: true,
                        rotation,
                        font: '30px sans-serif',
                        text: '►',
                        fill: new Fill({
                            color: '#3399CC',
                        }),
                        stroke: new Stroke({
                            color: '#fff',
                            width: 2,
                        }),
                    }),
                }));
                return;
            }

            // No heading specified, force circle if a circle is not already
            // displayed
            if (!positionFeatureStyle || !positionFeatureStyle.getImage()) {
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
            }
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
        rotateLabel.src = (this.isInAutorotateMap
            ? compassIcon
            : compassNorthIcon
        );
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
                    tipLabel: this.$t('map.toggleRotationMode'),
                    resetNorth: () => {
                        // Switch autorotate mode
                        this.hasUserAutorotateMap = !this.hasUserAutorotateMap;

                        const view = this.map.getView();
                        if (this.isInAutorotateMap) {
                            view.setRotation(-this.headingInRadiansFromNorth);
                        } else {
                            view.setRotation(0);
                        }
                    },
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
        // Set position marker style
        this.setPositionFeatureStyle();

        // Add click handler
        this.map.on('singleclick', this.handleClick);

        // Show recenter button on dragging the map
        this.map.on('pointerdrag', () => {
            this.isProgrammaticMove = false;
            this.showRecenterButton();
        });
        this.map.on('moveend', this.onMoveEnd);

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
        heading: Number, // in degrees, clockwise wrt north
        markers: Array,
        onPress: Function,
        onMapCenterUpdate: Function,
        onMapZoomUpdate: Function,
        polyline: Array,
        positionLatLng: Array,
        reportLatLng: Array,
        speed: Number, // in m/s
        zoom: {
            type: Number,
            required: true,
        },
    },
    watch: {
        isInAutorotateMap(newValue) {
            this.map.getControls().forEach((control) => {
                const controlItem = control;
                if (controlItem instanceof Rotate) {
                    controlItem.label_.src = (newValue
                        ? compassIcon
                        : compassNorthIcon
                    );
                }
            });
        },
        mapElementHeight() {
            // Force a redraw of the map after a few milliseconds and the DOM
            // has updated
            setTimeout(() => this.map.updateSize(), 200);
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
                        // Only open the details if the box was not just closed
                        if (this.$store.state.reportDetails.previousId !== closestReport.id) {
                            this.$store.dispatch('showReportDetails', { id: closestReport.id, userAsked: false });
                        }
                    } else {
                        this.$store.dispatch('hideReportDetails');
                    }
                }

                // Update view
                view.setCenter(newOlCenter);
                if (this.isInAutorotateMap) {
                    view.setRotation(-this.headingInRadiansFromNorth);
                } else {
                    view.setRotation(0);
                }
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
                this.setPositionFeatureStyle();
            }
            if (this.accuracyFeature) {
                // Update accuracy circle position and radius
                this.accuracyFeature.setGeometry(
                    newOlPosition ? new Point(newOlPosition) : null,
                );
                this.accuracyFeature.getStyle().getImage().setRadius(this.radiusFromAccuracy);
            }
        },
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
            if (!this.isRecenterButtonShown) {
                // Handle programmatic navigation
                this.map.getView().setZoom(newZoom);
            }
        },
    },
};
</script>

<style scoped>
.fill-width {
    width: 100%;
}

.speed-badge {
    position: absolute;
    right: 10px;
    font-size: 1.5em;
    margin: 1px;
    top: calc(3em + 25px);
    z-index: 1000;
    height: 3em;
    width: 3em;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, .87) !important;
}

.speed-badge-title {
    display: block;
}
</style>

<style>
#map .ol-control button {
    height: 3em !important;
    width: 3em !important;
    font-size: 1.5em; /* No different font sizes between touch and not touch screens. */
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
