import FileSaver from 'file-saver';
import createGPX from 'gps-to-gpx';
import moment from 'moment';

import { VERSION } from '@/constants';

export default function (activityName, locationGPX) {
    const courseKey = 'heading';
    const eleKey = 'elevation';
    const hdopKey = 'hdop';
    const speedKey = 'speed';
    const vdopKey = 'vdop';

    const waypoints = [];
    locationGPX.forEach((item) => {
        const waypoint = Object.assign({}, item, { timestamp: new Date(item.timestamp) });
        [courseKey, eleKey, hdopKey, speedKey, vdopKey].forEach((key) => {
            if (waypoint[key] === null || waypoint[key] === undefined) {
                delete waypoint[key];
            }
        });
        waypoints.push(waypoint);
    });
    const gpx = createGPX(waypoints, {
        activityName,
        creator: `Cycl'Assist v${VERSION}`,
        courseKey,
        eleKey,
        hdopKey,
        latKey: 'latitude',
        lonKey: 'longitude',
        speedKey,
        startTime: waypoints[0].timestamp,
        timeKey: 'timestamp',
        vdopKey,
    });
    FileSaver.saveAs(
        new Blob([gpx], { type: 'application/gpx+xml;charset=utf-8' }),
        `cyclassist_${moment().locale('en').format('YYYY-MM-DD_HH-mm_ddd')}.gpx`,
    );
}
