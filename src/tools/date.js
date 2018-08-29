import i18n from '@/i18n';

/*
 * Code below is dapted from
 * https://github.com/date-fns/date-fns/blob/v1/src/format/index.js
 * Licensed under MIT © Sasha Koss.
 */
export function addLeadingZeros(number, targetLength) {
    let output = Math.abs(number).toString();
    while (output.length < targetLength) {
        output = `0${output}`;
    }
    return output;
}

const FORMATTERS = {
    // Month: 01, 02, ..., 12
    MM: date => addLeadingZeros(date.getMonth() + 1, 2),
    // Day of month: 01, 02, ..., 31
    DD: date => addLeadingZeros(date.getDate(), 2),
    // Year: 1900, 1901, ..., 2099
    YYYY: date => addLeadingZeros(date.getFullYear(), 4),
    // Hour: 00, 01, ..., 23
    HH: date => addLeadingZeros(date.getHours(), 2),
    // Minute: 00, 01, ..., 59
    mm: date => addLeadingZeros(date.getMinutes(), 2),
    // Day of the week: Mon, Tue, Wed, Thu, Fri, Sat, Sun
    ddd: date => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
};

export function formatDate(date, format) {
    let output = format;
    Object.keys(FORMATTERS).forEach((formatter) => {
        output = output.replace(formatter, FORMATTERS[formatter](date));
    });
    return output;
}

/*
 * Code below is adapted from
 * https://github.com/yahoo/intl-relativeformat/blob/master/src/core.js
 * Copyright (c) 2014, Yahoo! Inc. All rights reserved.
 * Copyrights licensed under the New BSD License.
*/

const THRESHOLDS = {
    second: 45,
    minute: 45,
    hour: 22,
    day: 26,
    month: 11,
};

function daysToYears(days) {
    // 400 years have 146097 days (taking into account leap year rules)
    return days * 400 / 146097;
}

export function diff(from, to) {
    // Convert to ms timestamps.
    const millisecond = Math.round(+to - (+from));
    const second = Math.round(millisecond / 1000);
    const minute = Math.round(second / 60);
    const hour = Math.round(minute / 60);
    const day = Math.round(hour / 24);
    const week = Math.round(day / 7);

    const rawYears = daysToYears(day);
    const month = Math.round(rawYears * 12);
    const year = Math.round(rawYears);

    return {
        millisecond,
        second,
        minute,
        hour,
        day,
        week,
        month,
        year,
    };
}

export function selectUnits(diffReport) {
    const fields = Object.keys(THRESHOLDS);
    for (let i = 0; i < fields.length; i += 1) {
        const units = fields[i];
        if (Math.abs(diffReport[units]) < THRESHOLDS[units]) {
            return units;
        }
    }
    return 'year';
}

export function distanceInWordsToNow(from) {
    const diffReport = diff(from, new Date());
    const units = selectUnits(diffReport);
    const diffInUnits = Math.abs(diffReport[units]);
    return i18n.t('relativeDate.ago', {
        duration: i18n.tc(`relativeDate.${units}`, diffInUnits, { count: diffInUnits }),
    });
}
