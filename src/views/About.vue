<template>
    <v-container fluid>
        <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
                <p>
                    {{ $t('about.summary') }}
                    <span v-html="$t('permissions.geolocationDescription')"></span>
                </p>

                <h2 class="body-2">{{ $t('about.usage') }}</h2>
                <p>{{ $t('about.usageDescription') }}</p>

                <h2 class="body-2">{{ $t('about.availableReportsTitle') }}</h2>
                <ReportsDescription></ReportsDescription>

                <h2 class="body-2 mt-3">{{ $t('about.stats') }}</h2>
                <v-progress-circular indeterminate v-if="!stats"></v-progress-circular>
                <ul v-else>
                    <li>
                        {{ $tc(
                            'about.nbActiveReports',
                            stats.nb_active_reports,
                            { nbActiveReports: stats.nb_active_reports }
                        ) }}</li>
                    <li>{{ $tc(
                            'about.nbReports',
                            stats.nb_reports,
                            { nbReports: stats.nb_reports }
                        ) }}</li>
                    <li>{{ $t(
                            'about.lastReportAdded',
                            { fromNow: stats.last_added_report_datetime }
                        ) }}</li>
                </ul>

                <h2 class="body-2 mt-3">{{ $t('about.license') }}</h2>
                <p v-html="$t('about.licenseDescription')"></p>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import { getStats } from '@/api';
import { distanceInWordsToNow } from '@/tools/date';

import ReportsDescription from '@/components/ReportsDescription.vue';

export default {
    components: {
        ReportsDescription,
    },
    created() {
        this.fetchData();
    },
    data() {
        return {
            stats: null,
        };
    },
    methods: {
        fetchData() {
            getStats().then((stats) => {
                this.stats = stats;
                this.stats.last_added_report_datetime = (
                    distanceInWordsToNow(Date.parse(this.stats.last_added_report_datetime))
                );
            });
        },
    },
    watch: {
        $route: 'fetchData',
    },
};
</script>
