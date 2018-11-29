var assert = require('assert');
var geometry = require('./geometry');

describe('Geometry tools', function() {
    describe('isInRing', function () {
        var ring = [[0, 0], [0, 1], [1, 1], [0.5, 0.5], [1, 0], [0, 0]];

        it('should return true for a point in the ring', function () {
            assert(geometry.isInRing([0, 0], ring, false) === true);
            assert(geometry.isInRing([0.25, 0.25], ring, false)) === true;
            assert(geometry.isInRing([0.25, 0.25], ring, true) === true);
        });

        it('should return false for a point outside of the ring', function () {
            assert(geometry.isInRing([0, 0], ring, true) === false);
            assert(geometry.isInRing([0.8, 0.6], ring, true) === false);
            assert(geometry.isInRing([0.8, 0.6], ring, false) === false);
            assert(geometry.isInRing([2, 2], ring, false) === false);
            assert(geometry.isInRing([2, 2], ring, true) === false);
        })
    });

    describe('isInBBox', function () {
        it('should return true for a point inside the bbox', function () {
            assert(geometry.isInBBox([0.5, 0.5], [0, 0, 1, 1]) == true);
            assert(geometry.isInBBox([0, 1], [0, 0, 1, 1]) === true);
            assert(geometry.isInBBox([1, 0], [0, 0, 1, 1]) === true);
        });
        it('should return false for a point outside of the bbox', function () {
            assert(geometry.isInBBox([2, 0], [0, 0, 1, 1]) === false);
            assert(geometry.isInBBox([0, 2], [0, 0, 1, 1]) === false);
        });
    });

    describe('computeBBox', function () {
        it('should return correct BBox', function () {
            assert.deepEqual(geometry.computeBBox([[0, 0], [1, 0], [1, 1], [0, 1]]), [0, 0, 1, 1]);
        });
    });

    describe('isWithinPolygon', function () {
        var ring = [[0, 0], [0, 1], [1, 1], [0.5, 0.5], [1, 0], [0, 0]];

        it('should return true for points inside the polygon', function () {
            assert(geometry.isWithinPolygon([0, 0], ring, false) === true);
            assert(geometry.isWithinPolygon([0.25, 0.25], ring, false) === true);
            assert(geometry.isWithinPolygon([0.25, 0.25], ring, true) === true);
        });

        it('should return false for points outside the polygon', function () {
            assert(geometry.isWithinPolygon([0, 0], ring, true) === false);
            assert(geometry.isWithinPolygon([0.8, 0.6], ring, true) === false);
            assert(geometry.isWithinPolygon([0.8, 0.6], ring, false) === false);
            assert(geometry.isWithinPolygon([2, 2], ring, false) === false);
            assert(geometry.isWithinPolygon([2, 2], ring, true) === false);
        });
    });

    describe('pointToPointDistance', function () {
        it('should return results close to Vincenty\'s formula', function () {
            assert(
                (Math.abs(
                    geometry.pointToPointDistance([48.8171, 2.3186], [48.8454, 2.3746])
                    - 5177.692 // Vincenty's formula result
                ) / 5177.692)
                < 1 / 100
            );
            assert(
                (Math.abs(
                    geometry.pointToPointDistance([50.6314, 3.0027], [50.6271, 3.1116])
                    - 7720.121 // Vincenty's formula result
                ) / 7720.121)
                < 1 / 100
            );
            assert(
                (Math.abs(
                    geometry.pointToPointDistance([42.6722, 2.8508], [42.7093, 2.9679])
                    -  10443.762 // Vincenty's formula result
                ) / 10443.762)
                < 1 / 100
            );
        });
    });

    describe('dot', function () {
        it('should return the correct dot product', function () {
            assert(Math.abs(geometry.dot([1, 0], [0, 0]) - 0) < Number.EPSILON);
            assert(Math.abs(geometry.dot([1, 0], [1, 0]) - 1) < Number.EPSILON);
            assert(Math.abs(geometry.dot([1, 1], [1, 2]) - 3) < Number.EPSILON);
        })
    });

    describe('pointToLineDistance', function () {
        var polyLine = [[48.8105, 2.3088], [48.8098, 2.3218]];

        it('should return the correct distance for a point at the end', function () {
            assert(Math.abs(geometry.pointToLineDistance([48.8105, 2.3088], polyLine) - 0) < Number.EPSILON);
            assert(Math.abs(geometry.pointToLineDistance([48.8098, 2.3218], polyLine) - 0) < Number.EPSILON);
        });

        it('should return the correct distance for any point', function () {
            assert(Math.abs(geometry.pointToLineDistance([48.8170, 2.3188], polyLine) - 780) / 780 < 1 / 100);
            assert(Math.abs(geometry.pointToLineDistance([48.8121, 2.3074], polyLine) - 205) / 205 < 1 / 100);
            assert(Math.abs(geometry.pointToLineDistance([48.8089, 2.3315], polyLine) - 720) / 720 < 5 / 100);
        });

        it('should return the correct distance for longer lines', function () {
            assert(
                Math.abs(
                    geometry.pointToLineDistance(
                        [48.8098, 2.3218],
                        [[48.8105, 2.3088], [48.8098, 2.3218], [48.8089, 2.3315]]
                    ) - 0
                ) < Number.EPSILON
            );
            assert(
                (Math.abs(
                    geometry.pointToLineDistance(
                        [48.82787, 2.32686],
                        [[48.809982, 2.3190774], [48.8176872, 2.3320935], [48.8182127, 2.3323712], [48.8222148, 2.3143633], [48.8222632, 2.314133], [48.8115136, 2.3002323], [48.8113242, 2.3000166], [48.809982, 2.3190774]]
                    ) - 900
                ) / 900)
            < 1 / 100);
        });
    });

    describe('pointToPolygonDistance', function () {
        var polygon = [[48.809982, 2.3190774], [48.8176872, 2.3320935], [48.8182127, 2.3323712], [48.8222148, 2.3143633], [48.8222632, 2.314133], [48.8115136, 2.3002323], [48.8113242, 2.3000166], [48.809982, 2.3190774]];

        it('should return correct distance for a point on the ring', function () {
            assert(Math.abs(geometry.pointToPolygonDistance([48.809982, 2.3190774], polygon) - 0) < Number.EPSILON);
        });

        it('should return correct distance for a point in the inside', function () {
            assert(Math.abs(geometry.pointToPolygonDistance([48.8161, 2.3169], polygon) - 0) < Number.EPSILON);
        });

        it('should return correct distance for a point outside', function () {
            assert(Math.abs(geometry.pointToPolygonDistance([48.82787, 2.32686], polygon) -  900) / 900 < 1 / 100);
        });
    });

    describe('pointToGeometryDistance', function () {
        it('should return correct distance for a point', function () {
            var point = { type: 'Point', coordinates: [2.3746, 48.8454] };
            assert(Math.abs(geometry.pointToGeometryDistance([48.8171, 2.3186], point) - 5177.692) / 5177.692 < 1 / 100);
        });

        it('should return correct distance for a line', function () {
            var lineString = { type: 'LineString', coordinates: [[2.3088, 48.8105], [2.3218, 48.8098]] };
            assert(Math.abs(geometry.pointToGeometryDistance([48.8170, 2.3188], lineString) - 780) / 780 < 1 / 100);
        });

        it('should return correct distance for a polygon', function () {
            var polygon = { type: 'Polygon', coordinates: [[2.3190774, 48.809982], [2.3320935, 48.8176872], [2.3323712, 48.8182127], [2.3143633, 48.8222148], [2.314133, 48.8222632], [2.3002323, 48.8115136], [2.3000166, 48.8113242], [2.3190774, 48.809982]] };
            assert(Math.abs(geometry.pointToGeometryDistance([48.82787, 2.32686], polygon) -  900) / 900 < 1 / 100);
        });

        it('should return null for an unknown geometry', function () {
            var unknownGeometry = { type: 'Foobar', coordinates: [48.8454, 2.3746] };
            assert(geometry.pointToGeometryDistance([48.82787, 2.32686], unknownGeometry) === null);
        });
    });
});
