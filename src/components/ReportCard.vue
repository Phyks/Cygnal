<template>
    <v-flex xs12 v-if="report" class="reportCard">
        <v-list>
            <v-list-tile avatar @click="">
                <v-list-tile-avatar>
                    <img
                        :src="report.icon"
                        :alt="report.label"
                    >
                </v-list-tile-avatar>

                <v-list-tile-content>
                    <v-list-tile-title>{{ report.label }}</v-list-tile-title>
                    <v-list-tile-sub-title>{{ $t('reportCard.Reported') }} {{ report.fromNow }}</v-list-tile-sub-title>
                </v-list-tile-content>

                <v-list-tile-action>
                    <v-icon color="green">thumb_up</v-icon>
                    <v-icon color="red">thumb_down</v-icon>
                </v-list-tile-action>
            </v-list-tile>
        </v-list>
    </v-flex>
</template>

<script>
import moment from 'moment';

import { REPORT_TYPES } from '@/constants';

export default {
    computed: {
        report() {
            const reportID = this.$store.state.reportDetailsID;
            if (reportID != null) {
                const report = this.$store.state.reports.find(item => item.id === reportID);
                return {
                    fromNow: moment(report.attributes.datetime).fromNow(),
                    icon: this.icons[report.attributes.type],
                    label: this.$t(`reportLabels.${report.attributes.type}`),
                    type: report.attributes.type,
                };
            }
            return null;
        },
    },
    data() {
        const icons = {};
        Object.keys(REPORT_TYPES).forEach((type) => {
            icons[type] = REPORT_TYPES[type].image;
        });
        return {
            icons,
        };
    },
};
</script>

<style scoped>
.reportCard {
    position: absolute;
    z-index: 1001;
    width: 100%;
}
</style>
