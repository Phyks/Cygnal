import FileSaver from 'file-saver';
import createGPX from 'gps-to-gpx/es/createGpx';

import { VERSION } from '@/constants';
import { formatDate } from '@/tools/date';

export default function (activityName, locationGPX) {
    const eleKey = 'elevation';
    const hdopKey = 'hdop';
    const vdopKey = 'vdop';

    // Extensions
    const extKey = 'extensions';
    const extensionsKeys = {
        heading: 'course',
        speed: 'speed',
    };

    const waypoints = [];
    locationGPX.forEach((item) => {
        const waypoint = Object.assign({}, item, { timestamp: new Date(item.timestamp) });

        // Omit keys with empty values
        [eleKey, hdopKey, vdopKey].forEach((key) => {
            if (waypoint[key] === null || waypoint[key] === undefined) {
                delete waypoint[key];
            }
        });

        // Handle extensions
        waypoint[extKey] = {};
        Object.keys(extensionsKeys).forEach((key) => {
            if (waypoint[key] !== null && waypoint[key] !== undefined) {
                waypoint[extKey][extensionsKeys[key]] = waypoint[key];
                delete waypoint[key];
            }
        });

        waypoints.push(waypoint);
    });
    const gpx = createGPX(waypoints, {
        activityName,
        creator: `Cycl'Assist v${VERSION}`,
        eleKey,
        extKey,
        hdopKey,
        latKey: 'latitude',
        lonKey: 'longitude',
        startTime: waypoints[0].timestamp,
        timeKey: 'timestamp',
        vdopKey,
    });
    FileSaver.saveAs(
        new Blob([gpx], { type: 'application/gpx+xml;charset=utf-8' }),
        `cyclassist_${formatDate(new Date(), 'YYYY-MM-DD_HH-mm_ddd')}.gpx`,
    );
}
