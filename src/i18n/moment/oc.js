//! moment.js locale configuration
//! locale : Occitan, lengadocian dialecte [oc-lnc]
//! author : Quentí
/* eslint-disable */

import moment from 'moment';

export default moment.defineLocale('oc', {
    months : {
        standalone: 'genièr_febrièr_març_abril_mai_junh_julhet_agost_setembre_octòbre_novembre_decembre'.split('_'),
        format: 'de genièr_de febrièr_de març_d\'abril_de mai_de junh_de julhet_d\'agost_de setembre_d\'octòbre_de novembre_de decembre'.split('_'),
        isFormat: /D[oD]?(\s)+MMMM/
    },
    monthsShort : 'gen._febr._març._abr._mai._junh._jul._ag._set._oct._nov._dec.'.split('_'),
    monthsParseExact : true,
    weekdays : 'dimenge_diluns_dimars_dimècres_dijòus_divendres_dissabte'.split('_'),
    weekdaysShort : 'dg._dl._dm._dc._dj._dv._ds.'.split('_'),
    weekdaysMin : 'dg_dl_dm_dc_dj_dv_ds'.split('_'),
    weekdaysParseExact : true,
    longDateFormat : {
        LT : 'H:mm',
        LTS : 'H:mm:ss',
        L : 'DD/MM/YYYY',
        LL : 'D MMMM [de] YYYY',
        ll : 'D MMM YYYY',
        LLL : 'D MMMM [de] YYYY [a] H:mm',
        lll : 'D MMM YYYY, H:mm',
        LLLL : 'dddd D MMMM [de] YYYY [a] H:mm',
        llll : 'ddd D MMM YYYY, H:mm'
    },
    calendar : {
        sameDay : function () {
            return '[uèi a] LT';
        },
        nextDay : function () {
            return '[deman a] LT';
        },
        nextWeek : function () {
            return 'dddd [a] LT';
        },
        lastDay : function () {
            return '[ièr a] LT';
        },
        lastWeek : function () {
            return 'dddd [passat a] LT';
        },
        sameElse : 'L'
    },
    relativeTime : {
        future : 'd\'aquí %s',
        past : 'fa %s',
        s : 'unas segondas',
        ss : '%d segondas',
        m : 'una minuta',
        mm : '%d minutas',
        h : 'una ora',
        hh : '%d oras',
        d : 'un jorn',
        dd : '%d jorns',
        M : 'un mes',
        MM : '%d meses',
        y : 'un an',
        yy : '%d ans'
    },
    dayOfMonthOrdinalParse: /\d{1,2}(r|n|t|è|a)/,
    ordinal : function (number, period) {
        var output = (number === 1) ? 'r' :
            (number === 2) ? 'n' :
            (number === 3) ? 'r' :
            (number === 4) ? 't' : 'è';
        if (period === 'w' || period === 'W') {
            output = 'a';
        }
        return number + output;
    },
    week : {
        dow : 1, // Monday is the first day of the week.
        doy : 4  // The week that contains Jan 4th is the first week of the year.
    }
});
