<template>
    <v-flex xs12 v-if="report" class="reportCard">
        <div></div>
        <v-container grid-list-md fluid>
            <v-layout row align-center>
                <v-flex xs3 md2>
                    <img :src="report.icon" :alt="report.label" class="icon">
                </v-flex>
                <v-flex xs5 md6>
                    <v-layout row wrap>
                        <v-flex xs12 class="firstLine subheading font-weight-medium">
                            {{ report.label }}
                        </v-flex>
                        <v-flex xs12 class="secondLine">
                            {{ $t('reportCard.Reported') }} {{ report.fromNow }}
                        </v-flex>
                    </v-layout>
                </v-flex>
                <v-flex xs2 class="text-xs-center">
                    <v-btn role="button" :aria-label="$t('buttons.upvote')" color="green" dark small icon class="smallButton" @click.stop="upvote">
                        <v-icon>thumb_up</v-icon>
                    </v-btn>
                </v-flex>

                <v-flex xs2 class="text-xs-center">
                    <v-btn role="button" :aria-label="$t('buttons.downvote')" color="red" dark medium icon class="mediumButton" @click.stop="downvote">
                        <v-icon>thumb_down</v-icon>
                    </v-btn>
                </v-flex>

                <v-btn
                    color="grey"
                    class="lighten-1"
                    dark
                    small
                    absolute
                    bottom
                    left
                    fab
                    @click.stop="closeReportCard"
                    role="button"
                    :aria-label="$t('buttons.close')"
                    >
                    <v-icon>close</v-icon>
                </v-btn>
            </v-layout>
        </v-container>
    </v-flex>
</template>

<script>
import moment from 'moment';

import { REPORT_TYPES } from '@/constants';

export default {
    computed: {
        report() {
            const reportID = this.$store.state.reportDetails.id;
            if (reportID != null) {
                const report = this.$store.state.reports.find(item => item.id === reportID);
                return {
                    fromNow: moment(report.attributes.datetime).fromNow(),
                    icon: this.icons[report.attributes.type],
                    id: report.id,
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
    methods: {
        closeReportCard() {
            return this.$store.dispatch('hideReportDetails');
        },
        downvote() {
            const reportID = this.report.id;
            this.closeReportCard();  // Resets this.report
            return this.$store.dispatch('downvote', { id: reportID });
        },
        upvote() {
            const reportID = this.report.id;
            this.closeReportCard();  // Resets this.report
            return this.$store.dispatch('upvote', { id: reportID });
        },
    },
};
</script>

<style scoped>
.reportCard {
    position: absolute;
    z-index: 1001;
    width: 100%;
    background-color: white;
}

.icon {
    max-height: 52px;
    max-width: 100%;
}

.mediumButton {
    height: 56px;
    width: 56px;
}

.smallButton {
    height: 40px;
    width: 40px;
}

.secondLine {
    padding-top: 1px;
    padding-bottom: 1em !important;
}

.firstLine {
    padding: 2px !important;
}
</style>
