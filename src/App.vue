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
                    <v-list-tile @click="isShareMapViewModalShown = true" v-if="isShareMapViewMenuEntryVisible">
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
            <v-btn icon role="button" :aria-label="$t('buttons.back')" v-else @click="goBack">
                <v-icon>arrow_back</v-icon>
            </v-btn>
            <div>
                <v-progress-linear v-if="isLoading" :indeterminate="true" class="progressBar"></v-progress-linear>
            </div>
        </v-toolbar>
        <v-content>
            <ShareMapViewModal v-model="isShareMapViewModalShown"></ShareMapViewModal>
            <router-view></router-view>
        </v-content>
    </v-app>
</template>

<script>
import ShareMapViewModal from '@/components/ShareMapViewModal.vue';

export default {
    components: {
        ShareMapViewModal,
    },
    computed: {
        isLoading() {
            return this.$store.state.isLoading;
        },
        isShareMapViewMenuEntryVisible() {
            return this.$store.state.map.center.every(item => item !== null);
        },
    },
    data() {
        return {
            isShareMapViewModalShown: false,
            title: "Cycl'Assist",
        };
    },
    methods: {
        goToAbout() {
            this.$router.push({ name: 'About' });
        },
        goBack() {
            this.$router.go(-1);
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
