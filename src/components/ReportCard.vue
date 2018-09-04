<template>
    <v-flex xs12 v-if="report" class="reportCard">
        <div></div>
        <v-container grid-list-md fluid>
            <v-layout row align-center>
                <v-flex xs3 md2>
                    <img :src="report.icon" :alt="report.label" class="icon">
                </v-flex>
                <v-flex xs4 md6>
                    <v-layout row wrap>
                        <v-flex xs12 class="firstLine subheading font-weight-medium">
                            {{ report.label }}
                        </v-flex>
                        <v-flex xs12 class="secondLine">
                            {{ $t('reportCard.Reported', { fromNow: report.fromNow }) }}
                        </v-flex>
                    </v-layout>
                </v-flex>
                <v-flex xs2 class="text-xs-center">
                    <v-btn role="button" :aria-label="$t('buttons.upvote')" color="green" dark small icon class="smallButton" @click.stop="upvote">
                        <v-icon>thumb_up</v-icon>
                    </v-btn>
                </v-flex>

                <v-flex xs3 class="text-xs-center">
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
import { REPORT_TYPES, REPORT_ALARM_VIBRATION_SEQUENCE } from '@/constants';
import { distanceInWordsToNow } from '@/tools/date';
import beepSound from '@/assets/beep.mp3';

export default {
    computed: {
        report() {
            const reportID = this.$store.state.reportDetails.id;
            if (reportID != null) {
                const report = this.$store.state.reports.find(item => item.id === reportID);
                return {
                    fromNow: distanceInWordsToNow(Date.parse(report.attributes.datetime)),
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
            beepAudio: new Audio(beepSound),
            icons,
        };
    },
    methods: {
        closeReportCard() {
            return this.$store.dispatch('hideReportDetails');
        },
        downvote() {
            const reportID = this.report.id;
            this.closeReportCard(); // Resets this.report
            return this.$store.dispatch('downvote', { id: reportID });
        },
        notifyUser() {
            // Eventually play sound
            if (this.$store.state.settings.hasPlaySoundPermission) {
                this.playBeepSound();
            }
            // Eventually vibrate
            if (this.$store.state.settings.hasVibratePermission && navigator.vibrate) {
                navigator.vibrate(REPORT_ALARM_VIBRATION_SEQUENCE);
            }
        },
        playBeepSound() {
            // Force play it
            this.beepAudio.play();
        },
        upvote() {
            const reportID = this.report.id;
            this.closeReportCard(); // Resets this.report
            return this.$store.dispatch('upvote', { id: reportID });
        },
    },
    watch: {
        report(newReport, oldReport) {
            if (newReport) {
                const isDifferentReport = (oldReport === null) || (newReport.id !== oldReport.id);
                // If the report is automatically opened due to proximity
                if (!this.$store.state.reportDetails.userAsked && isDifferentReport) {
                    this.notifyUser();
                }
            }
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
    margin: 0;
}

.smallButton {
    height: 40px;
    width: 40px;
    margin: 0;
}

.secondLine {
    padding-top: 1px;
    padding-bottom: 1em !important;
}

.firstLine {
    padding: 2px !important;
}
</style>
