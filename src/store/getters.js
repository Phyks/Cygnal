import { REPORT_DOWNVOTES_THRESHOLD } from '@/constants';

export function getLastLocation(state) {
    const { gpx } = state.location;
    if (gpx.length > 0) {
        return gpx[gpx.length - 1];
    }
    return null;
}

export function notDismissedReports(state) {
    return state.reports.filter((item) => {
        if (item.attributes.downvotes >= REPORT_DOWNVOTES_THRESHOLD) {
            return false;
        }
        return true;
    });
}
