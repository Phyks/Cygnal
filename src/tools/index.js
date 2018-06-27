import { EARTH_RADIUS } from '@/constants';

export function distance(latLng1, latLng2) {
    const lat1 = (latLng1[0] * Math.PI) / 180;
    const lng1 = (latLng1[1] * Math.PI) / 180;

    const lat2 = (latLng2[0] * Math.PI) / 180;
    const lng2 = (latLng2[1] * Math.PI) / 180;

    const a = (
        (Math.sin((lat2 - lat1) / 2.0) ** 2) +
        (Math.cos(lat1) * Math.cos(lat2) * (Math.sin((lng2 - lng1) / 2.0) ** 2))
    );
    const c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS * c;
}

export function mockLocation() {
    const LAT_MIN = 48.854031;
    const LNG_MIN = 2.281279;
    const LAT_MAX = 48.886123;
    const LNG_MAX = 2.392742;
    return {
        coords: {
            accuracy: 10, // In meters
            latitude: (Math.random() * (LAT_MAX - LAT_MIN)) + LAT_MIN,
            longitude: (Math.random() * (LNG_MAX - LNG_MIN)) + LNG_MIN,
            heading: null, // 20 * (Math.PI / 180),
        },
    };
}