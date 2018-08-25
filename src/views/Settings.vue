<template>
    <v-container fluid class="no-padding">
        <v-layout row wrap>
            <v-flex xs12 sm4 offset-sm4 class="text-xs-center">
                <h2>{{ $t('menu.Settings') }}</h2>
                <form>
                    <v-select
                        :items="i18nItems"
                        v-model="locale"
                        item-text="name"
                        item-value="iso"
                        :label="$t('settings.locale')"
                        required
                        ></v-select>

                    <v-select
                        :items="tileServers"
                        v-model="tileServer"
                        :label="$t('settings.tileServer')"
                        required
                        ></v-select>

                    <v-select
                        :items="orientationModes"
                        v-model="defaultOrientationMode"
                        :label="$t('settings.defaultOrientationMode')"
                        required
                        ></v-select>

                    <v-text-field
                        :hint="$t('settings.customTileServerURLHint')"
                        :label="$t('settings.customTileServerURL')"
                        v-model="customTileServerURL"
                        v-if="showCustomTileServerURLField"
                        required
                        >
                    </v-text-field>

                    <v-checkbox
                        :label="$t('settings.skipOnboarding')"
                        v-model="skipOnboarding"
                        ></v-checkbox>

                    <PermissionsSwitches></PermissionsSwitches>
                </form>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import { TILE_SERVERS } from '@/constants';
import { AVAILABLE_LOCALES } from '@/i18n';

import PermissionsSwitches from '@/components/PermissionsSwitches.vue';

export default {
    components: {
        PermissionsSwitches,
    },
    computed: {
        customTileServerURL: {
            get() {
                const tileServerStore = this.$store.state.settings.tileServer;
                if (tileServerStore in TILE_SERVERS) {
                    return null;
                }
                const firstColon = tileServerStore.indexOf(':');
                return tileServerStore.substring(firstColon + 1);
            },
            set(URL) {
                this.$store.dispatch('setSetting', { setting: 'tileServer', value: `custom:${URL}` });
            },
        },
        defaultOrientationMode: {
            get() {
                return this.$store.state.settings.shouldAutorotateMap;
            },
            set(newDefaultOrientationMode) {
                this.$store.dispatch('setSetting',
                    { setting: 'shouldAutorotateMap', value: newDefaultOrientationMode },
                );
            },
        },
        locale: {
            get() {
                return this.$store.state.settings.locale;
            },
            set(locale) {
                this.$store.dispatch('setLocale', { locale });
            },
        },
        showCustomTileServerURLField() {
            return !(this.$store.state.settings.tileServer in TILE_SERVERS);
        },
        skipOnboarding: {
            get() {
                return this.$store.state.settings.skipOnboarding;
            },
            set(skipOnboarding) {
                this.$store.dispatch('setSetting', { setting: 'skipOnboarding', value: skipOnboarding });
                this.$store.dispatch('unmarkIntroAsSeen');
            },
        },
        tileServer: {
            get() {
                const tileServerStore = this.$store.state.settings.tileServer;
                if (tileServerStore.startsWith('custom:')) {
                    return this.$t('settings.customTileServer');
                }
                return tileServerStore;
            },
            set(tileServer) {
                if (tileServer in TILE_SERVERS) {
                    this.$store.dispatch('setSetting', { setting: 'tileServer', value: tileServer });
                } else {
                    this.$store.dispatch('setSetting', { setting: 'tileServer', value: 'custom:' });
                }
            },
        },
        tileServers() {
            return [].concat(Object.keys(TILE_SERVERS), this.$t('settings.customTileServer'));
        },
    },
    data() {
        const $t = this.$t.bind(this);
        return {
            i18nItems: AVAILABLE_LOCALES,
            orientationModes: [
                {
                    text: $t('settings.fixedNorth'),
                    value: false,
                },
                {
                    text: $t('settings.autorotate'),
                    value: true,
                },
            ],
        };
    },
};
</script>
