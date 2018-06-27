import L from 'leaflet';

import gcumMarker from '@/assets/gcumMarker.svg';
import obstacleMarker from '@/assets/obstacleMarker.svg';
import potholeMarker from '@/assets/potholeMarker.svg';
import GCUMIcon from '@/assets/gcum.svg';
import ObstacleIcon from '@/assets/obstacle.svg';
import PotHoleIcon from '@/assets/pothole.svg';

export const REPORT_TYPES = {
    gcum: {
        label: 'reportLabels.gcum',
        image: GCUMIcon,
        marker: L.icon({
            iconUrl: gcumMarker,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        }),
    },
    interrupt: {
        label: 'reportLabels.interrupt',
        image: ObstacleIcon,
        marker: L.icon({
            iconUrl: obstacleMarker,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        }),
    },
    pothole: {
        label: 'reportLabels.pothole',
        image: PotHoleIcon,
        marker: L.icon({
            iconUrl: potholeMarker,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        }),
    },
};

export const MOCK_LOCATION = false;
export const MOCK_LOCATION_UPDATE_INTERVAL = 30 * 1000;

export const UPDATE_REPORTS_DISTANCE_THRESHOLD = 500;

export const EARTH_RADIUS = 6378137;

export const DEFAULT_ZOOM = 17;
export const MIN_ZOOM = 15;
export const MAX_ZOOM = 18;
export const TILE_SERVER = process.env.TILE_SERVER || 'https://a.tile.thunderforest.com/cycle/{z}/{x}/{y}.png';
