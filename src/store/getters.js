export function getLastLocation(state) {
    const { gpx } = state.location;
    if (gpx.length > 0) {
        return gpx[gpx.length - 1];
    }
    return null;
}
