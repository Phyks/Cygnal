var assert = require('assert');
var date = require('./date');

describe('Date tools', function() {
    describe('addLeadingZeros', function () {
        it('should add leading zeros', function () {
            assert.equal(date.addLeadingZeros(10, 2), '10');
            assert.equal(date.addLeadingZeros(10, 4), '0010');
        });
    });

    describe('formatDate', function () {
        it('should format date correctly', function () {
            var unix = new Date(0);
            assert.equal(date.formatDate(unix, 'MM'), '01');
            assert.equal(date.formatDate(unix, 'DD'), '01');
            assert.equal(date.formatDate(unix, 'YYYY'), '1970');
            var timeZoneOffset = date.addLeadingZeros(unix.getTimezoneOffset() / 60, 2);
            assert.equal(
                date.formatDate(unix, 'HH'),
                timeZoneOffset
            );
            assert.equal(date.formatDate(unix, 'mm'), '00');
            assert.equal(date.formatDate(unix, 'ddd'), 'Thu');

            assert.equal(
                date.formatDate(unix, 'ddd DD/MM/YYYY HH:mm'),
                'Thu 01/01/1970 ' + timeZoneOffset + ':00'
            );
        });
    });

    describe('diff', function () {
        it('should output correct diff', function () {
            var from = new Date(0);
            var to = new Date(1543498512000);
            assert.deepEqual(
                date.diff(from, to),
                {
                    day: 17865,
                    hour: 428750,
                    millisecond: 1543498512000,
                    minute: 25724975,
                    month: 587,
                    second: 1543498512,
                    week: 2552,
                    year: 49
                }
            );
        });
    });

    describe('selectUnits', function () {
        it('should output correct units', function () {
            assert.equal(
                date.selectUnits(
                    date.diff(new Date(0), new Date(100))
                ),
                'second'
            )
            assert.equal(
                date.selectUnits(
                    date.diff(new Date(0), new Date(30 * 1000))
                ),
                'second'
            )
            assert.equal(
                date.selectUnits(
                    date.diff(new Date(0), new Date(40 * 60 * 1000))
                ),
                'minute'
            )
            assert.equal(
                date.selectUnits(
                    date.diff(new Date(0), new Date(20 * 60 * 60 * 1000))
                ),
                'hour'
            )
            assert.equal(
                date.selectUnits(
                    date.diff(new Date(0), new Date(20 * 24 * 60 * 60 * 1000))
                ),
                'day'
            )
            assert.equal(
                date.selectUnits(
                    date.diff(new Date(0), new Date(5 * 7 * 24 * 60 * 60 * 1000))
                ),
                'month'
            )
            assert.equal(
                date.selectUnits(
                    date.diff(new Date(0), new Date(5 * 30 * 24 * 60 * 60 * 1000))
                ),
                'month'
            )
            assert.equal(
                date.selectUnits(
                    date.diff(new Date(0), new Date(5 * 365 * 24 * 60 * 60 * 1000))
                ),
                'year'
            )
        });
    });

    describe('distanceInWords', function () {
        it('should output correct distance in words', function () {
            var now = (new Date()).getTime();

            assert.equal(
                date.distanceInWordsToNow(
                    new Date(now - 100)
                ),
                '0 seconds ago'
            )
            assert.equal(
                date.distanceInWordsToNow(
                    new Date(now - 30 * 1000)
                ),
                '30 seconds ago'
            )
            assert.equal(
                date.distanceInWordsToNow(
                    new Date(now - 40 * 60 * 1000)
                ),
                '40 minutes ago'
            )
            assert.equal(
                date.distanceInWordsToNow(
                    new Date(now - 20 * 60 * 60 * 1000)
                ),
                '20 hours ago'
            )
            assert.equal(
                date.distanceInWordsToNow(
                    new Date(now - 20 * 24 * 60 * 60 * 1000)
                ),
                '20 days ago'
            )
            assert.equal(
                date.distanceInWordsToNow(
                    new Date(now - 5 * 7 * 24 * 60 * 60 * 1000)
                ),
                'one month ago'
            )
            assert.equal(
                date.distanceInWordsToNow(
                    new Date(now - 5 * 30 * 24 * 60 * 60 * 1000)
                ),
                '5 months ago'
            )
            assert.equal(
                date.distanceInWordsToNow(
                    new Date(now - 5 * 365 * 24 * 60 * 60 * 1000)
                ),
                '5 years ago'
            )
        });
    })
});
