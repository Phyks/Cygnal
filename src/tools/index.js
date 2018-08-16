import moment from 'moment';

import {
    EARTH_RADIUS,
    MOCK_LOCATION_GPX_PLAYBACK_SPEED,
    MOCK_LOCATION_UPDATE_INTERVAL,
    MOCK_LOCATION_USE_GPX,
    MOCK_LOCATION_LAT_MIN, MOCK_LOCATION_LAT_MAX,
    MOCK_LOCATION_LNG_MIN, MOCK_LOCATION_LNG_MAX,
} from '@/constants';

let mockGPX = null;
if (process.env.NODE_ENV !== 'production') {
    mockGPX = require('@/tools/mock_gpx.json'); // eslint-disable-line global-require
}

export function distance(latLng1, latLng2) {
    const lat1 = (latLng1[0] * Math.PI) / 180;
    const lng1 = (latLng1[1] * Math.PI) / 180;

    const lat2 = (latLng2[0] * Math.PI) / 180;
    const lng2 = (latLng2[1] * Math.PI) / 180;

    const a = (
        (Math.sin((lat2 - lat1) / 2.0) ** 2)
        + (Math.cos(lat1) * Math.cos(lat2) * (Math.sin((lng2 - lng1) / 2.0) ** 2))
    );
    const c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS * c;
}

export function mockLocationRandom() {
    let heading = null;
    if (Math.random() > 0.25) {
        heading = Math.random() * 360;
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
        },
        timestamp: new Date().getTime(),
    };
    console.log('New mock location: ', newLocation);
    return newLocation;
}

export function mockLocationWithGPX(index, setPosition) {
    setPosition(mockGPX[index]);
    if (index < mockGPX.length) {
        const delay = (
            moment(mockGPX[index + 1].time).valueOf()
            - moment(mockGPX[index].time).valueOf()
        );
        setTimeout(
            () => mockLocationWithGPX(index + 1, setPosition),
            delay / MOCK_LOCATION_GPX_PLAYBACK_SPEED,
        );
    }
}

export function mockLocation(setPosition) {
    if (MOCK_LOCATION_USE_GPX) {
        mockLocationWithGPX(0, setPosition);
        return null;
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
