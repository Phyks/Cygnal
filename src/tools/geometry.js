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
 *
 * Examples:
 * @code
 *      const ring = [[0, 0], [0, 1], [1, 1], [0.5, 0.5], [1, 0], [0, 0]];
 *      isInRing([0, 0], ring, false) === true
 *      isInRing([0, 0], ring, true) === false
 *      isInRing([0.25, 0.25], ring, false) === true
 *      isInRing([0.25, 0.25], ring, true) === true
 *      isInRing([0.8, 0.6], ring, true) === false
 *      isInRing([0.8, 0.6], ring, false) === false
 *      isInRing([2, 2], ring, false) === false
 *      isInRing([2, 2], ring, true) === false
 * @endcode
 */
export function isInRing(latLng, ring, ignoreBoundary) {
    let isInside = false;

    // If the ring is a full loop, ignore the duplicate point
    let openRing = Array.concat([], ring);
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
 *
 * Examples:
 * @code
 *      isInBBox([0.5, 0.5], [0, 0, 1, 1]) === true
 *      isInBBox([0, 1], [0, 0, 1, 1]) === true
 *      isInBBox([1, 0], [0, 0, 1, 1]) === true
 *      isInBBox([2, 0], [0, 0, 1, 1]) === false
 *      isInBBox([0, 2], [0, 0, 1, 1]) === false
 * @endcode
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
 *
 * Examples:
 * @code
 *      computeBBox([[0, 0], [1, 0], [1, 1], [0, 1]]) === [0, 0, 1, 1]
 * @endcode
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
 *
 * Examples:
 * @code
 *      const ring = [[0, 0], [0, 1], [1, 1], [0.5, 0.5], [1, 0], [0, 0]];
 *      isWithinPolygon([0, 0], ring, false) === true
 *      isWithinPolygon([0, 0], ring, true) === false
 *      isWithinPolygon([0.25, 0.25], ring, false) === true
 *      isWithinPolygon([0.25, 0.25], ring, true) === true
 *      isWithinPolygon([0.8, 0.6], ring, true) === false
 *      isWithinPolygon([0.8, 0.6], ring, false) === false
 *      isWithinPolygon([2, 2], ring, false) === false
 *      isWithinPolygon([2, 2], ring, true) === false
 * @endcode
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


/* eslint-disable max-len */
/**
 * Cheap distance computation between two points based on
 * https://blog.mapbox.com/fast-geodesic-approximations-with-cheap-ruler-106f229ad016.
 * (ISC license)
 *
 * @param latLng1   A [latitude, longitude] array for the first point.
 * @param latLng2   A [latitude, longitude] array for the second point.
 * @return          The distance in meters.
 *
 * Examples
 * @code
 *      // Vincenty's formula gives 5177.692 meters
 *      Math.abs(pointToPointDistance([48.8171, 2.3186], [48.8454, 2.3746]) - 5177.692) / pointToPointDistance([48.8171, 2.3186], [48.8454, 2.3746]) < 1 / 100
 *      // Vincenty's formula gives 7720.121 meters
 *      Math.abs(pointToPointDistance([50.6314, 3.0027], [50.6271, 3.1116]) - 7720.121) / pointToPointDistance([50.6314, 3.0027], [50.6271, 3.1116]) < 1 / 100
 *      // Vincenty's formula gives 10443.762 meters
 *      Math.abs(pointToPointDistance([42.6722, 2.8508], [42.7093, 2.9679]) -  10443.762) / pointToPointDistance([42.6722, 2.8508], [42.7093, 2.9679]) < 1 / 100
 * @endcode
 */
/* eslint-enable max-len */
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
 *
 * Examples:
 * @code
 *      Math.abs(dot([1, 0], [0, 0]) - 0) < Number.EPSILON
 *      Math.abs(dot([1, 0], [1, 0]) - 1) < Number.EPSILON
 *      Math.abs(dot([1, 1], [1, 2]) - 3) < Number.EPSILON
 * @endcode
 */
export function dot(u, v) {
    return (u[0] * v[0] + u[1] * v[1]);
}


/* eslint-disable max-len */
/**
 * Compute the distance between a point and a polyLine.
 * Adapted from https://github.com/Turfjs/turf/, licensed under MIT.
 *
 * @param latLng        An array [latitude, longitude] for the point to
 *                      compute distance from.
 * @param polyLine      A list of [latitude, longitude] arrays for each vertex
 *                      of the polyLine.
 * @return              The distance between the point and the polyLine.
 *
 * Examples:
 * @code
 *      const polyLine = [[48.8105, 2.3088], [48.8098, 2.3218]];
 *
 *      // Any point at the end
 *      Math.abs(pointToLineDistance([48.8105, 2.3088], polyLine) - 0) < Number.EPSILON
 *      Math.abs(pointToLineDistance([48.8098, 2.3218], polyLine) - 0) < Number.EPSILON
 *
 *      // Points in misc positions
 *      Math.abs(pointToLineDistance([48.8170, 2.3188], polyLine) - 780) / 780 < 1 / 100
 *      Math.abs(pointToLineDistance([48.8121, 2.3074], polyLine) - 205) / 205 < 1 / 100
 *      Math.abs(pointToLineDistance([48.8089, 2.3315], polyLine) - 720) / 720 < 5 / 100
 *
 *      // Longer polyLine
 *      Math.abs(pointToLineDistance([48.8098, 2.3218], [[48.8105, 2.3088], [48.8098, 2.3218], [48.8089, 2.3315]]) - 0) < Number.EPSILON
 *      Math.abs(pointToLineDistance([48.82787, 2.32686], [[48.809982, 2.3190774], [48.8176872, 2.3320935], [48.8182127, 2.3323712], [48.8222148, 2.3143633], [48.8222632, 2.314133], [48.8115136, 2.3002323], [48.8113242, 2.3000166], [48.809982, 2.3190774]]) - 900) / 900 < 1 / 100
 * @endcode
 */
/* eslint-enable max-len */
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


/* eslint-disable max-len */
/**
 * Compute the distance between a point and a polygon.
 *
 * @param latLng    A [latitude, longitude] array representing the point.
 * @param polygon   A list of [latitude, longitude] arrays of the vertices of
 *                  the polygon.
 * @return          The distance between the point and the polygon.
 *
 * Examples:
 * @code
 *      const polygon = [[48.809982, 2.3190774], [48.8176872, 2.3320935], [48.8182127, 2.3323712], [48.8222148, 2.3143633], [48.8222632, 2.314133], [48.8115136, 2.3002323], [48.8113242, 2.3000166], [48.809982, 2.3190774]];
 *
 *      // Point on the ring
 *      Math.abs(pointToPolygonDistance([48.809982, 2.3190774], polygon) - 0) < Number.EPSILON
 *      // Point in the inside
 *      Math.abs(pointToPolygonDistance([48.8161, 2.3169], polygon) - 0) < Number.EPSILON
 *      // Point outside of the ring
 *      Math.abs(pointToPolygonDistance([48.82787, 2.32686], polygon) -  900) / 900 < 1 / 100
 * @endcode
 */
/* eslint-enable max-len */
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


/* eslint-disable max-len */
/**
 * Compute the distance between a point and a GeoJSON geometry.
 *
 * @param latLng    A [latitude, longitude] array representing the point.
 * @param geometry  A GeoJSON-like geometry (Object with "type" and
 *                  "coordinates" keys). Coordinates are GeoJSON-like,
 *                  longitude first and latitude then.
 * @return          The distance between the point and the geometry.
 *
 * Examples:
 * @code
 *      const point = { type: 'Point', coordinates: [2.3746, 48.8454] }
 *      Math.abs(pointToGeometryDistance([48.8171, 2.3186], point) - 5177.692) / 5177.692 < 1 / 100
 *
 *      const lineString = { type: 'LineString', coordinates: [[2.3088, 48.8105], [2.3218, 48.8098]] }
 *      Math.abs(pointToGeometryDistance([48.8170, 2.3188], lineString) - 780) / 780 < 1 / 100
 *
 *      const polygon = { type: 'Polygon', coordinates: [[2.3190774, 48.809982], [2.3320935, 48.8176872], [2.3323712, 48.8182127], [2.3143633, 48.8222148], [2.314133, 48.8222632], [2.3002323, 48.8115136], [2.3000166, 48.8113242], [2.3190774, 48.809982]] }
 *      Math.abs(pointToGeometryDistance([48.82787, 2.32686], polygon) -  900) / 900 < 1 / 100
 *
 *      const unknownGeometry = { type: 'Foobar', coordinates: [48.8454, 2.3746] }
 *      pointToGeometryDistance([48.82787, 2.32686], unknownGeometry) === null
 * @endcode
 */
/* eslint-enable max-len */
export function pointToGeometryDistance(latLng, geometry) {
    const lngLatCoordinates = Array.concat([], geometry.coordinates);

    if (geometry.type === 'Point') {
        return pointToPointDistance(latLng, lngLatCoordinates.reverse());
    }

    if (geometry.type === 'LineString') {
        return pointToLineDistance(latLng, lngLatCoordinates.map(item => item.reverse()));
    }

    if (geometry.type === 'Polygon') {
        return pointToPolygonDistance(latLng, lngLatCoordinates.map(item => item.reverse()));
    }

    // Unsupported geometry
    return null;
}
