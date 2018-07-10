import L from 'leaflet';

import accidentMarker from '@/assets/accidentMarker.svg';
import gcumMarker from '@/assets/gcumMarker.svg';
import interruptMarker from '@/assets/interruptMarker.svg';
import miscMarker from '@/assets/miscMarker.svg';
import obstacleMarker from '@/assets/obstacleMarker.svg';
import potholeMarker from '@/assets/potholeMarker.svg';
import accidentIcon from '@/assets/accident.svg';
import gcumIcon from '@/assets/gcum.svg';
import interruptIcon from '@/assets/interrupt.svg';
import miscIcon from '@/assets/misc.svg';
import obstacleIcon from '@/assets/obstacle.svg';
import potholeIcon from '@/assets/pothole.svg';

export const REPORT_TYPES = {
    accident: {
        label: 'reportLabels.accident',
        image: accidentIcon,
        marker: L.icon({
            iconUrl: accidentMarker,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        }),
        markerLarge: L.icon({
            iconUrl: accidentMarker,
            iconSize: [60, 60],
            iconAnchor: [30, 60],
        }),

    },
    gcum: {
        label: 'reportLabels.gcum',
        image: gcumIcon,
        marker: L.icon({
            iconUrl: gcumMarker,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        }),
        markerLarge: L.icon({
            iconUrl: gcumMarker,
            iconSize: [60, 60],
            iconAnchor: [30, 60],
        }),

    },
    interrupt: {
        label: 'reportLabels.interrupt',
        image: interruptIcon,
        marker: L.icon({
            iconUrl: interruptMarker,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        }),
        markerLarge: L.icon({
            iconUrl: interruptMarker,
            iconSize: [60, 60],
            iconAnchor: [30, 60],
        }),
    },
    misc: {
        label: 'reportLabels.misc',
        image: miscIcon,
        marker: L.icon({
            iconUrl: miscMarker,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        }),
        markerLarge: L.icon({
            iconUrl: miscMarker,
            iconSize: [60, 60],
            iconAnchor: [30, 60],
        }),
    },
    obstacle: {
        label: 'reportLabels.obstacle',
        image: obstacleIcon,
        marker: L.icon({
            iconUrl: obstacleMarker,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        }),
        markerLarge: L.icon({
            iconUrl: obstacleMarker,
            iconSize: [60, 60],
            iconAnchor: [30, 60],
        }),
    },
    pothole: {
        label: 'reportLabels.pothole',
        image: potholeIcon,
        marker: L.icon({
            iconUrl: potholeMarker,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        }),
        markerLarge: L.icon({
            iconUrl: potholeMarker,
            iconSize: [60, 60],
            iconAnchor: [30, 60],
        }),
    },
};
// Display order of the report types
export const REPORT_TYPES_ORDER = ['gcum', 'interrupt', 'obstacle', 'pothole', 'accident', 'misc'];

export const MOCK_LOCATION = false;
export const MOCK_LOCATION_UPDATE_INTERVAL = 10 * 1000;

export const UPDATE_REPORTS_DISTANCE_THRESHOLD = 500;

// Minimal ratio between upvotes and downvotes needed for a report to be shown
export const REPORT_VOTES_THRESHOLD = 0.5;

export const EARTH_RADIUS = 6378137;

export const DEFAULT_ZOOM = 17;
export const MIN_ZOOM = 10;
export const MAX_ZOOM = 18;
export const TILE_SERVER = process.env.TILE_SERVER || 'https://a.tile.thunderforest.com/cycle/{z}/{x}/{y}.png';
