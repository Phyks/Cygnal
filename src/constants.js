export const VERSION = '0.3';

export const NORMAL_ICON_SCALE = 0.625;
export const LARGE_ICON_SCALE = 1.0;
export const ICON_ANCHOR = [0.5, 1.0];

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

// Minimal number of downvotes needed for a report to be masked
export const REPORT_DOWNVOTES_THRESHOLD = 1;

// Earth radius as recommended by the International Union of Geodesy and
// Geophysics
// https://rosettacode.org/wiki/Haversine_formula
export const EARTH_RADIUS = 6371000; // in meters

// Keep reports only in a given radius around map center.
export const KEEP_REPORTS_METERS_AROUND = 10000; // in meters

export const DEFAULT_ZOOM = 17;
export const MIN_ZOOM = 6;
export const MAX_ZOOM = 18;

export const MAP_CENTER_WITHOUT_GEOLOCATION = [46.589, 2.944];
export const MAP_ZOOM_WITHOUT_GEOLOCATION = 6;

export const ACCURACY_DISPLAY_THRESHOLD = 100; // in meters
export const POSITION_MARKER_RADIUS = 10; // in pixels

let opencyclemapURL = 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png';
if (process.env.THUNDERFOREST_API_KEY) {
    opencyclemapURL += `?apikey=${process.env.THUNDERFOREST_API_KEY}`;
}
export const TILE_SERVERS = {
    'cartodb-voyager': 'https://{a-c}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    opencyclemap: opencyclemapURL,
};
export const DEFAULT_TILE_SERVER = 'cartodb-voyager';

export const GEOCODING_API_ENDPOINT = 'https://api-adresse.data.gouv.fr/search/';

// Delay in milliseconds between two consecutive calls to the backend API when
// doing batch requests
export const DELAY_BETWEEN_API_BATCH_REQUESTS = 1000;

// A vibration sequence for report alarms
export const REPORT_ALARM_VIBRATION_SEQUENCE = [500];

// Email address to send issues to
export const CONTACT_EMAIL_ADDRESS = 'phyks+cyclassist@phyks.me';
