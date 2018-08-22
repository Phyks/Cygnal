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

export const VERSION = '0.1';

export const REPORT_TYPES = {
    accident: {
        description: 'reportLabels.accidentDescription',
        label: 'reportLabels.accident',
        image: accidentIcon,
        marker: {
            iconUrl: accidentMarker,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        },
        markerLarge: {
            iconUrl: accidentMarker,
            iconSize: [60, 60],
            iconAnchor: [30, 60],
        },

    },
    gcum: {
        description: 'reportLabels.gcumDescription',
        label: 'reportLabels.gcum',
        image: gcumIcon,
        marker: {
            iconUrl: gcumMarker,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        },
        markerLarge: {
            iconUrl: gcumMarker,
            iconSize: [60, 60],
            iconAnchor: [30, 60],
        },

    },
    interrupt: {
        description: 'reportLabels.interruptDescription',
        label: 'reportLabels.interrupt',
        image: interruptIcon,
        marker: {
            iconUrl: interruptMarker,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        },
        markerLarge: {
            iconUrl: interruptMarker,
            iconSize: [60, 60],
            iconAnchor: [30, 60],
        },
    },
    misc: {
        description: 'reportLabels.miscDescription',
        label: 'reportLabels.misc',
        image: miscIcon,
        marker: {
            iconUrl: miscMarker,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        },
        markerLarge: {
            iconUrl: miscMarker,
            iconSize: [60, 60],
            iconAnchor: [30, 60],
        },
    },
    obstacle: {
        description: 'reportLabels.obstacleDescription',
        label: 'reportLabels.obstacle',
        image: obstacleIcon,
        marker: {
            iconUrl: obstacleMarker,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        },
        markerLarge: {
            iconUrl: obstacleMarker,
            iconSize: [60, 60],
            iconAnchor: [30, 60],
        },
    },
    pothole: {
        description: 'reportLabels.potholeDescription',
        label: 'reportLabels.pothole',
        image: potholeIcon,
        marker: {
            iconUrl: potholeMarker,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        },
        markerLarge: {
            iconUrl: potholeMarker,
            iconSize: [60, 60],
            iconAnchor: [30, 60],
        },
    },
};
// Display order of the report types
export const REPORT_TYPES_ORDER = ['gcum', 'interrupt', 'obstacle', 'pothole', 'accident', 'misc'];

export const MIN_DISTANCE_REPORT_DETAILS = 40; // in meters

export const MOCK_LOCATION = false;
export const MOCK_LOCATION_USE_GPX = true;
export const MOCK_LOCATION_GPX_PLAYBACK_SPEED = 2.0;
export const MOCK_LOCATION_UPDATE_INTERVAL = 5 * 1000; // in milliseconds
// Small area in Montrouge
export const MOCK_LOCATION_LAT_MIN = 48.81788;
export const MOCK_LOCATION_LNG_MIN = 2.31723;
export const MOCK_LOCATION_LAT_MAX = 48.81952;
export const MOCK_LOCATION_LNG_MAX = 2.32077;
// Paris
/*
export const MOCK_LOCATION_LAT_MIN = 48.854031;
export const MOCK_LOCATION_LNG_MIN = 2.281279;
export const MOCK_LOCATION_LAT_MAX = 48.886123;
export const MOCK_LOCATION_LNG_MAX = 2.392742;
*/

export const UPDATE_REPORTS_DISTANCE_THRESHOLD = 500; // in meters

// Minimal ratio between upvotes and downvotes needed for a report to be shown
export const REPORT_VOTES_THRESHOLD = 0.5;

export const EARTH_RADIUS = 6378137; // in meters

export const DEFAULT_ZOOM = 17;
export const MIN_ZOOM = 10;
export const MAX_ZOOM = 18;

export const ACCURACY_DISPLAY_THRESHOLD = 100; // in meters

let opencyclemapURL = 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png';
if (process.env.THUNDERFOREST_API_KEY) {
    opencyclemapURL += `?apikey=${process.env.THUNDERFOREST_API_KEY}`;
}
export const TILE_SERVERS = {
    'cartodb-voyager': 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    opencyclemap: opencyclemapURL,
};
export const DEFAULT_TILE_SERVER = 'cartodb-voyager';

export const GEOCODING_API_ENDPOINT = 'https://api-adresse.data.gouv.fr/search/';

// Delay in milliseconds between two consecutive calls to the backend API when
// doing batch requests
export const DELAY_BETWEEN_API_BATCH_REQUESTS = 1000;

// A vibration sequence for report alarms
export const REPORT_ALARM_VIBRATION_SEQUENCE = [500];
