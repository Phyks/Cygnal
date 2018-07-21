<template>
    <v-app>
        <v-toolbar
            app
            >
            <router-link :to="{ name: 'Map' }" class="noLinkDecoration">
                <v-toolbar-title v-text="title" class="ma-0"></v-toolbar-title>
            </router-link>
            <v-spacer></v-spacer>
            <v-menu offset-y class="menu" v-if="$route.name === 'Onboarding' || $route.name === 'Map' || $route.name === 'SharedMap'">
                <v-btn slot="activator" icon role="button" :aria-label="$t('buttons.menu')">
                    <v-icon>more_vert</v-icon>
                </v-btn>
                <v-list>
                    <v-list-tile @click="sharePositionDialog = true" v-if="shareMapPositionURL">
                        <v-list-tile-title>{{ $t("menu.shareMapView") }}</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile @click="goToAbout">
                        <v-list-tile-title>{{ $t("menu.About") }}</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile @click="goToSettings">
                        <v-list-tile-title>{{ $t("menu.Settings") }}</v-list-tile-title>
                    </v-list-tile>
                </v-list>
            </v-menu>
            <v-btn icon role="button" :aria-label="$t('buttons.back')" v-else @click="goToMap">
                <v-icon>arrow_back</v-icon>
            </v-btn>
            <div>
                <v-progress-linear v-if="isLoading" :indeterminate="true" class="progressBar"></v-progress-linear>
            </div>
        </v-toolbar>
        <v-content>
            <v-dialog
                v-model="sharePositionDialog"
                max-width="290"
                >
                <v-card>
                    <v-card-title class="headline">Share map position</v-card-title>

                    <v-card-text>
                        Copy the URL below to share the current map view.

                        <v-text-field ref="sharePositionURLField" readonly :hint="sharePositionURLFieldHint" @click="copyShareMapPositionURL" v-model="shareMapPositionURL" prepend-icon="share"></v-text-field>
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer></v-spacer>

                        <v-btn
                            color="green darken-1"
                            @click="sharePositionDialog = false"
                            dark
                            large
                            role="button"
                            >
                            OK
                        </v-btn>

                        <v-spacer></v-spacer>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <router-view/>
        </v-content>
    </v-app>
</template>

<script>
export default {
    computed: {
        isLoading() {
            return this.$store.state.isLoading;
        },
        shareMapPositionURL() {
            // TODO: Should be position of the map, not position of the marker
            const currentPosition = this.$store.state.currentPosition;
            if (!currentPosition) {
                return null;
            }
            const currentZoom = this.$store.state.currentZoom || 18;
            const path = this.$router.resolve({ name: 'SharedMap', params: { lat: currentPosition[0], lng: currentPosition[1], zoom: currentZoom } }).href;
            return `${window.location.origin}/${path}`;
        },
    },
    data() {
        return {
            sharePositionDialog: false,
            sharePositionURLFieldHint: null,
            title: "Cycl'Assist",
        };
    },
    name: 'App',
    methods: {
        copyShareMapPositionURL() {
            this.$refs.sharePositionURLField.$el.querySelector('input').select();
            if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
                document.execCommand('copy');
                this.sharePositionURLFieldHint = this.$t('misc.copiedToClipboard');
            }
        },
        goToAbout() {
            this.$router.push({ name: 'About' });
        },
        goToMap() {
            this.$router.push({ name: 'Map' });
        },
        goToSettings() {
            this.$router.push({ name: 'Settings' });
        },
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
}

.bottom-sheet.dialog {
    webkit-transition: .1s cubic-bezier(.25, .8, .5, 1);
    transition: .1s cubic-bezier(.25, .8, .5, 1);
}
</style>
