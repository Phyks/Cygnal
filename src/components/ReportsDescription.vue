<template>
    <table class="margin-auto">
        <tr v-for="type in REPORT_TYPES_ORDER" :key="type">
            <td class="pa-2"><img class="reportIcon" :src="REPORT_TYPES[type].image"/></td>
            <td class="pa-2 text-xs-left">
                <strong>{{ $t(REPORT_TYPES[type].label) }}</strong><span
                    v-html="$t('misc.spaceBeforeDoublePunctuations')"
                    ></span>:
                {{ $t(REPORT_TYPES[type].description) }}
            </td>
        </tr>
    </table>
</template>

<script>
import { REPORT_TYPES_ORDER } from '@/constants';
import REPORT_TYPES from '@/report-types';

export default {
    data() {
        return {
            REPORT_TYPES,
            REPORT_TYPES_ORDER,
        };
    },
};
</script>

<style scoped>
.margin-auto {
    margin-left: auto;
    margin-right: auto;
}

.reportIcon {
    background: white;
    width: 100px;
    vertical-align: middle;
}
</style>
