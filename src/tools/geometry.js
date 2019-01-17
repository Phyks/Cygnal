/**
 * Check whether a given point is within (in the interior) of a ring.
 * Adapted from https://github.com/Turfjs/turf/, licensed under MIT.
 *
 * @param latLng            The [latitude, longitude] coordinates of the point.
 * @param ring              A list of [latitude, longitude] for each vertex in
 *                          the ring. The ring is always considered to be
 *                          closed (last point being the same as the first
 *                          one), even if that is not explicitly the case.
 * @param ignoreBoundary    Whether to consider a point on the boundary as
 *                          being within the ring or not.
 *
 * @note                    This is used with latitude and longitude in mind,
 *                          hence the names, but is much more generic and can
 *                          be used with any (X, Y) coordinates.
 */
export function isInRing(latLng, ring, ignoreBoundary) {
    let isInside = false;

    // If the ring is a full loop, ignore the duplicate point
    let openRing = [].concat(ring);
    if (
        openRing[0][0] === openRing[openRing.length - 1][0]
        && openRing[0][1] === openRing[openRing.length - 1][1]
    ) {
        openRing = openRing.slice(0, openRing.length - 1);
    }

    for (let i = 0, j = openRing.length - 1; i < openRing.length; j = i, i += 1) {
        // Get the current edge of the ring
        const xi = openRing[i][0];
        const yi = openRing[i][1];
        const xj = openRing[j][0];
        const yj = openRing[j][1];

        // Check whether the point is on the boundary
        const onBoundary = (
            (latLng[1] * (xi - xj) + yi * (xj - latLng[0]) + yj * (latLng[0] - xi) === 0)
            && ((xi - latLng[0]) * (xj - latLng[0]) <= 0)
            && ((yi - latLng[1]) * (yj - latLng[1]) <= 0)
        );
        if (onBoundary) {
            return !ignoreBoundary;
        }

        const intersect = (
            ((yi > latLng[1]) !== (yj > latLng[1]))
            && (latLng[0] < (xj - xi) * (latLng[1] - yi) / (yj - yi) + xi)
        );
        if (intersect) {
            isInside = !isInside;
        }
    }
    return isInside;
}


/**
 * Check whether a point is within a given bbox.
 * Adapted from https://github.com/Turfjs/turf/, licensed under MIT.
 *
 * @param latlng    A [latitude, longitude] array for the point.
 * @param bbox      A [minLatitude, minLongitude, maxLatitude, maxLongitude]
 *                  array representing the bbox.
 * @return          True if the point is within the bbox, false otherwise.
 *
 * @note            This is used with latitude and longitude in mind, hence the
 *                  names, but is much more generic and can be used with any
 *                  (X, Y) coordinates.
 */
export function isInBBox(latLng, bbox) {
    return (
        bbox[0] <= latLng[0]
        && bbox[1] <= latLng[1]
        && bbox[2] >= latLng[0]
        && bbox[3] >= latLng[1]
    );
}


/**
 * Compute the bbox of a Polygon.
 *
 * @param polygon   A list of [latitude, longitude] each vertex in the polygon
 *                  (or polyline).
 * @return          A [minLatitude, minLongitude, maxLatitude, maxLongitude]
 *                  array representing the bbox.
 *
 * @note            This is used with latitude and longitude in mind, hence the
 *                  names, but is much more generic and can be used with any
 *                  (X, Y) coordinates.
 * @note            This works with a polygon or polyline.
 */
export function computeBBox(polygon) {
    const latList = polygon.map(item => item[0]);
    const lngList = polygon.map(item => item[1]);
    return [
        Math.min(...latList),
        Math.min(...lngList),
        Math.max(...latList),
        Math.max(...lngList),
    ];
}


/**
 * Check whether a point is within a Polygon.
 * Adapted from https://github.com/Turfjs/turf/, licensed under MIT.
 *
 * @param latLng            A [latitude, longitude] array for the point.
 * @param polygon           An array of [latitude, longitude] arrays for each
 *                          vertex of the Polygon (polygon ring).
 * @param ignoreBoundary    Whether a point on the boundary should be considered
 *                          within the Polygon or not. Default to false.
 * @return                  true if the point is within the Polygon, false
 *                          otherwise.
 *
 * @note                    This is used with latitude and longitude in mind,
 *                          hence the names, but is much more generic and can
 *                          be used with any (X, Y) coordinates.
 */
export function isWithinPolygon(latLng, polygon, ignoreBoundary) {
    const shouldIgnoreBoundary = ignoreBoundary || false;
    // Quick check: is point inside bbox?
    const bbox = computeBBox(polygon);
    if (isInBBox(latLng, bbox) === false) {
        return false;
    }

    // Thorough check
    if (isInRing(latLng, polygon, shouldIgnoreBoundary)) {
        return true;
    }
    return false;
}


/**
 * Cheap distance computation between two points based on
 * https://blog.mapbox.com/fast-geodesic-approximations-with-cheap-ruler-106f229ad016.
 * (ISC license)
 *
 * @param latLng1   A [latitude, longitude] array for the first point.
 * @param latLng2   A [latitude, longitude] array for the second point.
 * @return          The distance in meters.
 */
export function pointToPointDistance(latLng1, latLng2) {
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


/**
 * Compute the dot product of two vectors.
 * Adapted from https://github.com/Turfjs/turf/, licensed under MIT.
 *
 * @param u     Array of coordinates of the first vector.
 * @param v     Array of coordinates of the second vector.
 * @return      The dot product of the two vectors.
 */
export function dot(u, v) {
    return (u[0] * v[0] + u[1] * v[1]);
}


/**
 * Compute the distance between a point and a polyLine.
 * Adapted from https://github.com/Turfjs/turf/, licensed under MIT.
 *
 * @param latLng        An array [latitude, longitude] for the point to
 *                      compute distance from.
 * @param polyLine      A list of [latitude, longitude] arrays for each vertex
 *                      of the polyLine.
 * @return              The distance between the point and the polyLine.
 */
export function pointToLineDistance(latLng, polyLine) {
    let distance = Number.POSITIVE_INFINITY;

    // Iterate over the segments forming the polyLine
    for (let i = 0; i < (polyLine.length - 1); i += 1) {
        // Distance between point and the current segment
        let distanceToSegment = null;

        // Origin and end of the segment
        const a = polyLine[i];
        const b = polyLine[i + 1];

        // Segment vector
        const v = [b[0] - a[0], b[1] - a[1]];
        // Point to origin of the segment vector
        const w = [latLng[0] - a[0], latLng[1] - a[1]];

        const c1 = dot(w, v);
        if (c1 <= 0) {
            // Point is closer to origin
            distanceToSegment = pointToPointDistance(latLng, a);
        } else {
            const c2 = dot(v, v);
            if (c2 <= c1) {
                // Point is closer to end
                distanceToSegment = pointToPointDistance(latLng, b);
            } else {
                const b2 = c1 / c2;
                const Pb = [a[0] + (b2 * v[0]), a[1] + (b2 * v[1])];
                distanceToSegment = pointToPointDistance(latLng, Pb);
            }
        }

        if (distanceToSegment < distance) {
            distance = distanceToSegment;
        }
    }
    return distance;
}


/**
 * Compute the distance between a point and a polygon.
 *
 * @param latLng    A [latitude, longitude] array representing the point.
 * @param polygon   A list of [latitude, longitude] arrays of the vertices of
 *                  the polygon.
 * @return          The distance between the point and the polygon.
 */
export function pointToPolygonDistance(latLng, polygon) {
    const polygonRing = polygon;
    // Ensure the polygon ring is a full loop
    if (
        polygonRing[0][0] !== polygonRing[polygonRing.length - 1][0]
        && polygonRing[0][1] !== polygonRing[polygonRing.length - 1][1]
    ) {
        polygonRing.push(polygonRing[0]);
    }

    // First, check whether the point is on or inside the polygon
    if (isWithinPolygon(latLng, polygonRing, false)) {
        return 0;
    }

    // Otherwise return the distance from the point to the polygon ring.
    return pointToLineDistance(latLng, polygonRing);
}


/**
 * Compute the distance between a point and a GeoJSON geometry.
 *
 * @param latLng    A [latitude, longitude] array representing the point.
 * @param geometry  A GeoJSON-like geometry (Object with "type" and
 *                  "coordinates" keys). Coordinates are GeoJSON-like,
 *                  longitude first and latitude then.
 * @return          The distance between the point and the geometry.
 */
export function pointToGeometryDistance(latLng, geometry) {
    const lngLatCoordinates = [].concat(geometry.coordinates);

    if (geometry.type === 'Point') {
        return pointToPointDistance(latLng, lngLatCoordinates.reverse());
    }

    if (geometry.type === 'LineString') {
        return pointToLineDistance(latLng, lngLatCoordinates.map(item => item.reverse()));
    }

    if (geometry.type === 'Polygon') {
        return pointToPolygonDistance(
            latLng,
            lngLatCoordinates[0].map(item => [].concat(item).reverse()),
        );
    }

    // Unsupported geometry
    return null;
}
