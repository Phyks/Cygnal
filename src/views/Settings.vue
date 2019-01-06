<template>
    <v-container fluid class="no-padding">
        <v-layout row wrap>
            <v-flex xs12 sm4 offset-sm4 class="text-xs-center">
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

                    <v-select
                        :items="tileCachingDurationOptions"
                        v-model="tileCachingDuration"
                        item-text="name"
                        item-value="duration"
                        :label="$t('settings.tileCachingDuration')"
                        required
                        v-if="tileCachingEnabled"
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
                </form>

                <v-list subheader>
                    <v-subheader>Général</v-subheader>

                    <v-list-tile>
                        <v-list-tile-content>
                            <v-list-tile-title>
                                {{ $t('settings.locale') }}
                            </v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile>
                        <v-list-tile-content>
                            <v-list-tile-title>
                                {{ $t('settings.tileServer') }}
                            </v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile>
                        <v-list-tile-content>
                            <v-list-tile-title>
                                {{ $t('settings.defaultOrientationMode') }}
                            </v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile>
                        <v-list-tile-content>
                            <v-list-tile-title>
                                {{ $t('settings.tileCachingDuration') }}
                            </v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
                <PermissionsSwitches></PermissionsSwitches>
                <v-list subheader>
                    <v-subheader>Divers</v-subheader>
                    <v-list-tile>
                        <v-list-tile-content>
                            <v-list-tile-title>
                                {{ $t('settings.skipOnboarding') }}
                            </v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import localforage from 'localforage';

import { TILE_SERVERS } from '@/constants';
import { AVAILABLE_LOCALES } from '@/i18n';
import { capitalize } from '@/tools';

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
        tileCachingDuration: {
            get() {
                return this.$store.state.settings.tileCachingDuration;
            },
            set(tileCachingDuration) {
                this.$store.dispatch('setSetting', { setting: 'tileCachingDuration', value: tileCachingDuration });
            },
        },
        tileCachingDurationOptions() {
            return [
                {
                    duration: 0,
                    name: this.$i18n.t('settings.noCaching'),
                },
                {
                    duration: -1,
                    name: this.$i18n.t('settings.defaultDuration'),
                },
                {
                    duration: 3600 * 24,
                    name: capitalize(this.$i18n.tc('relativeDate.day', 1, { count: 1 })),
                },
                {
                    duration: 3600 * 24 * 7,
                    name: capitalize(this.$i18n.tc('relativeDate.day', 7, { count: 7 })),
                },
            ];
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
            return [].concat(Object.keys(TILE_SERVERS).sort(), this.$t('settings.customTileServer'));
        },
    },
    data() {
        const $t = this.$t.bind(this);
        const i18nItems = [];
        Object.keys(AVAILABLE_LOCALES).forEach(iso => i18nItems.push({
            iso,
            name: AVAILABLE_LOCALES[iso].name,
        }));
        i18nItems.sort((a, b) => a.iso > b.iso);

        // Only IndexedDB backend can be used in service workers
        const tileCachingEnabled = (
            localforage.driver() === localforage.INDEXEDDB
        );

        return {
            i18nItems,
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
            tileCachingEnabled,
        };
    },
};
</script>
