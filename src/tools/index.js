
import {
    MOCK_LOCATION_GPX_PLAYBACK_SPEED,
    MOCK_LOCATION_UPDATE_INTERVAL,
    MOCK_LOCATION_USE_GPX,
    MOCK_LOCATION_LAT_MIN, MOCK_LOCATION_LAT_MAX,
    MOCK_LOCATION_LNG_MIN, MOCK_LOCATION_LNG_MAX,
} from '@/constants';

let mockGPX = [];
if (process.env.NODE_ENV !== 'production') {
    // Use a node_modules require here, this is handled by Webpack to fetch either
    // a custom mock_gpx.json or a default empty one.
    mockGPX = require('mock_gpx.json'); // eslint-disable-line global-require
}

/**
 * Cheap distance computation based on
 * https://blog.mapbox.com/fast-geodesic-approximations-with-cheap-ruler-106f229ad016.
 */
export function distance(latLng1, latLng2) {
    const cos = Math.cos((latLng1[0] + latLng2[0]) / 2 * Math.PI / 180);
    const cos2 = 2 * cos * cos - 1;
    const cos3 = 2 * cos * cos2 - cos;
    const cos4 = 2 * cos * cos3 - cos2;
    const cos5 = 2 * cos * cos4 - cos3;

    // Multipliers for converting longitude and latitude degrees into distance
    // (http://1.usa.gov/1Wb1bv7)
    const kx = 1000 * (111.41513 * cos - 0.09455 * cos3 + 0.00012 * cos5);
    const ky = 1000 * (111.13209 - 0.56605 * cos2 + 0.0012 * cos4);

    const dx = (latLng1[1] - latLng2[1]) * kx;
    const dy = (latLng1[0] - latLng2[0]) * ky;
    return Math.sqrt(dx * dx + dy * dy);
}

export function mockLocationRandom() {
    let heading = null;
    if (Math.random() > 0.25) {
        heading = Math.random() * 360;
    }
    let speed = null;
    if (Math.random() > 0.25) {
        speed = Math.random() * 9; // in meters/s
    }
    const newLocation = {
        coords: {
            accuracy: Math.random() * 100, // In meters
            latitude: (
                (Math.random() * (MOCK_LOCATION_LAT_MAX - MOCK_LOCATION_LAT_MIN))
                + MOCK_LOCATION_LAT_MIN
            ),
            longitude: (
                (Math.random() * (MOCK_LOCATION_LNG_MAX - MOCK_LOCATION_LNG_MIN))
                + MOCK_LOCATION_LNG_MIN
            ),
            heading,
            speed,
        },
        timestamp: new Date().getTime(),
    };
    console.log('New mock location: ', newLocation);
    return newLocation;
}

export function mockLocationWithGPX(index, setPosition) {
    if (mockGPX[index]) {
        setPosition(mockGPX[index]);
        if (mockGPX[index + 1]) {
            const delay = (
                Date.parse(mockGPX[index + 1].time)
                - Date.parse(mockGPX[index].time)
            );
            setTimeout(
                () => mockLocationWithGPX(index + 1, setPosition),
                delay / MOCK_LOCATION_GPX_PLAYBACK_SPEED,
            );
        }
    }
}

export function mockLocation(setPosition) {
    if (MOCK_LOCATION_USE_GPX) {
        mockLocationWithGPX(0, setPosition);
        return -1; // Return a fake setInterval id
    }
    setPosition(mockLocationRandom());
    return setInterval(
        () => setPosition(mockLocationRandom()),
        MOCK_LOCATION_UPDATE_INTERVAL,
    );
}

export function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22
            // Firefox
            || e.code === 1014
            // test name field too, because code might not be present
            // everything except Firefox
            || e.name === 'QuotaExceededError'
            // Firefox
            || e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
        )
        // acknowledge QuotaExceededError only if there's something already stored
        && storage.length !== 0;
    }
}

export function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
