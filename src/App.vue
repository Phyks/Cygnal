<template>
    <v-app>
        <v-toolbar
            app
            >
            <router-link :to="{ name: 'Map' }" class="noLinkDecoration">
                <v-toolbar-title v-text="title" class="ma-0"></v-toolbar-title>
            </router-link>
            <v-spacer></v-spacer>
            <v-btn
                v-if="unsentReportsLength > 0"
                icon
                role="button"
                :aria-label="$t('buttons.uploadUnsents')"
                :loading="isSendingReports"
                :disabled="isSendingReports"
                class="mr-3"
                color="orange"
                dark
                @click="sendUnsentReports"
                >
                <v-badge color="orange" left>
                    <span slot="badge">{{ unsentReportsLength }}</span>
                    <v-icon>cloud_upload</v-icon>
                </v-badge>
            </v-btn>
            <v-menu
                offset-y
                class="menu"
                v-if="showMenu"
                >
                <v-btn slot="activator" icon role="button" :aria-label="$t('buttons.menu')">
                    <v-icon>more_vert</v-icon>
                </v-btn>
                <v-list>
                    <v-list-tile @click="isSearchModalShown = true" v-if="isMapLoaded">
                        <v-list-tile-title>{{ $t("menu.search") }}</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile @click="exportGPX" v-if="isExportGPXMenuEntryVisible">
                        <v-list-tile-title>{{ $t("menu.exportGPX") }}</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile @click="isShareMapViewModalShown = true" v-if="isMapLoaded">
                        <v-list-tile-title>{{ $t("menu.shareMapView") }}</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile @click="goToAbout">
                        <v-list-tile-title>{{ $t("menu.About") }}</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile @click="goToSettings">
                        <v-list-tile-title>{{ $t("menu.Settings") }}</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile @click="isReportIssueModalShown = true">
                        <v-list-tile-title>{{ $t("menu.reportIssue") }}</v-list-tile-title>
                    </v-list-tile>
                </v-list>
            </v-menu>
            <v-btn icon role="button" :aria-label="$t('buttons.back')" v-else @click="goBack">
                <v-icon>arrow_back</v-icon>
            </v-btn>
            <div>
                <v-progress-linear
                    v-if="isLoading"
                    :indeterminate="true"
                    class="progressBar"
                    ></v-progress-linear>
            </div>
        </v-toolbar>
        <v-content>
            <Alert
                type="error"
                :text="$t('reportDialog.unableToSend')"
                :onDismiss="dismissError"
                v-if="hasReportError"
                ></Alert>
            <ShareMapViewModal v-model="isShareMapViewModalShown"></ShareMapViewModal>
            <ReportIssueModal v-model="isReportIssueModalShown"></ReportIssueModal>
            <SearchModal v-model="isSearchModalShown"></SearchModal>
            <router-view></router-view>
        </v-content>
    </v-app>
</template>

<script>
import runtime from 'serviceworker-webpack-plugin/lib/runtime';

import { DELAY_BETWEEN_API_BATCH_REQUESTS } from '@/constants';

import Alert from '@/components/Alert.vue';
import ReportIssueModal from '@/components/ReportIssueModal.vue';
import SearchModal from '@/components/SearchModal.vue';
import ShareMapViewModal from '@/components/ShareMapViewModal.vue';

export default {
    components: {
        Alert,
        ReportIssueModal,
        SearchModal,
        ShareMapViewModal,
    },
    computed: {
        isLoading() {
            return this.$store.state.isLoading;
        },
        isExportGPXMenuEntryVisible() {
            return this.$store.state.location.gpx.length > 0;
        },
        isMapLoaded() {
            return (
                this.$store.state.map.center.every(item => item !== null)
                || this.$store.getters.getLastLocation
            );
        },
        showMenu() {
            return (
                this.$route.name === 'Onboarding'
                || this.$route.name === 'Map'
                || this.$route.name === 'SharedMap'
            );
        },
        unsentReportsLength() {
            return this.$store.state.unsentReports.length;
        },
    },
    data() {
        return {
            hasReportError: false,
            isReportIssueModalShown: false,
            isSearchModalShown: false,
            isSendingReports: false,
            isShareMapViewModalShown: false,
            title: "Cycl'Assist",
        };
    },
    methods: {
        dismissError() {
            this.hasReportError = false;
        },
        exportGPX() {
            import('@/tools/exportGPX' /* webpackChunkName: "MapView" */).then((module) => {
                const activityName = this.$t('misc.activityName');
                module.default(activityName, this.$store.state.location.gpx);
            });
        },
        goToAbout() {
            this.$router.push({ name: 'About' });
        },
        goBack() {
            this.$router.go(-1);
        },
        goToSettings() {
            this.$router.push({ name: 'Settings' });
        },
        sendUnsentReports() {
            if (!this.unsentReportsLength) {
                this.isSendingReports = false;
                return;
            }
            this.isSendingReports = true;

            const index = this.unsentReportsLength - 1;
            const report = this.$store.state.unsentReports[index];
            this.$store.dispatch('saveReport', report)
                .then(() => {
                    this.$store.dispatch('removeUnsentReport', { index });
                    this.hasReportError = false;
                    setTimeout(this.sendUnsentReports, DELAY_BETWEEN_API_BATCH_REQUESTS);
                })
                .catch((exc) => {
                    console.error(exc);
                    this.hasReportError = true;
                    this.isSendingReports = false;
                });
        },
    },
    mounted() {
        if ('serviceWorker' in navigator) {
            runtime.register().catch((error) => {
                console.log(`Registration failed with ${error}.`);
            });
        }
    },
};
</script>

<style scoped>
.menu {
    z-index: 2000 !important;
}

.noLinkDecoration {
    color: rgba(0, 0, 0, .87);
    text-decoration: none;
}

.progressBar {
    margin: 0;
    position: absolute;
    bottom: 0;
    left: 0;
}
</style>

<style>
body, html, .application {
    height: 100%;
}

.application--wrap {
    min-height: 100% !important;
    overflow: auto;
}

.bottom-sheet.dialog {
    webkit-transition: .1s cubic-bezier(.25, .8, .5, 1);
    transition: .1s cubic-bezier(.25, .8, .5, 1);
}
</style>
