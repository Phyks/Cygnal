<template>
    <v-container fluid class="no-padding">
        <v-layout row wrap>
            <v-dialog v-model="isDialog" max-width="250px">
                <v-card>
                    <template v-if="whichDialog === LOCALE">
                        <v-card-title>
                            {{ $t('settings.locale') }}
                        </v-card-title>
                        <v-card-text>
                            <v-select
                                :items="i18nItems"
                                v-model="locale"
                                item-text="name"
                                item-value="iso"
                                required
                                ></v-select>
                        </v-card-text>
                    </template>
                    <template v-else-if="whichDialog === TILE_SERVER">
                        <v-card-title>
                            {{ $t('settings.tileServer') }}
                        </v-card-title>
                        <v-card-text>
                            <v-select
                                :items="tileServers"
                                v-model="tileServer"
                                :label="$t('settings.tileServer')"
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
                        </v-card-text>
                    </template>
                    <template v-else-if="whichDialog === DEFAULT_ORIENTATION">
                        <v-card-title>
                            {{ $t('settings.defaultOrientationMode') }}
                        </v-card-title>
                        <v-card-text>
                            <v-select
                                :items="orientationModes"
                                v-model="defaultOrientationMode"
                                required
                                ></v-select>
                        </v-card-text>
                    </template>
                    <template v-else-if="whichDialog === TILE_CACHING">
                        <v-card-title>
                            {{ $t('settings.tileCachingDuration') }}
                        </v-card-title>
                        <v-card-text>
                            <v-select
                                :items="tileCachingDurationOptions"
                                v-model="tileCachingDuration"
                                item-text="name"
                                item-value="duration"
                                required
                                v-if="tileCachingEnabled"
                                ></v-select>
                        </v-card-text>
                    </template>
                    <v-card-actions>
                        <v-btn color="primary" flat @click="isDialog = false">Close</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <v-flex xs12 sm4 offset-sm4 class="text-xs-center">
                <v-list subheader two-line>
                    <v-subheader>{{ $t('settings.general') }}</v-subheader>

                    <v-list-tile @click="showDialog(LOCALE)">
                        <v-list-tile-content>
                            <v-list-tile-title>
                                {{ $t('settings.locale') }}
                            </v-list-tile-title>
                            <v-list-tile-sub-title>
                                {{ localeName }}
                            </v-list-tile-sub-title>
                        </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile @click="showDialog(TILE_SERVER)">
                        <v-list-tile-content>
                            <v-list-tile-title>
                                {{ $t('settings.tileServer') }}
                            </v-list-tile-title>
                            <v-list-tile-sub-title>
                                {{ tileServer }}
                            </v-list-tile-sub-title>
                        </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile @click="showDialog(DEFAULT_ORIENTATION)">
                        <v-list-tile-content>
                            <v-list-tile-title>
                                {{ $t('settings.defaultOrientationMode') }}
                            </v-list-tile-title>
                            <v-list-tile-sub-title>
                                {{ defaultOrientationModeName }}
                            </v-list-tile-sub-title>
                        </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile v-if="tileCachingEnabled"  @click="showDialog(TILE_CACHING)">
                        <v-list-tile-content>
                            <v-list-tile-title>
                                {{ $t('settings.tileCachingDuration') }}
                            </v-list-tile-title>
                            <v-list-tile-sub-title>
                                {{ tileCachingDurationName }}
                            </v-list-tile-sub-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
                <v-divider></v-divider>
                <PermissionsSwitches></PermissionsSwitches>
                <v-divider></v-divider>
                <v-list subheader>
                    <v-subheader>{{ $t('settings.misc') }}</v-subheader>
                    <v-list-tile @click="dialog">
                        <v-list-tile-content>
                            <v-list-tile-title>
                                {{ $t('settings.showOnboarding') }}
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
        defaultOrientationModeName() {
            return this.orientationModes.find(
                item => item.value === this.defaultOrientationMode,
            ).text;
        },
        locale: {
            get() {
                return this.$store.state.settings.locale;
            },
            set(locale) {
                this.$store.dispatch('setLocale', { locale });
            },
        },
        localeName() {
            return this.i18nItems.find(item => item.iso === this.locale).name;
        },
        orientationModes() {
            return [
                {
                    text: this.$t('settings.fixedNorth'),
                    value: false,
                },
                {
                    text: this.$t('settings.autorotate'),
                    value: true,
                },
            ];
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
        tileCachingDurationName() {
            return this.tileCachingDurationOptions.find(
                item => item.duration === this.tileCachingDuration,
            ).name;
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
            DEFAULT_ORIENTATION: 'DEFAULT_ORIENTATION',
            LOCALE: 'LOCALE',
            TILE_CACHING: 'TILE_CACHING',
            TILE_SERVER: 'TILE_SERVER',
            isDialog: false,
            whichDialog: null,
            i18nItems,
            tileCachingEnabled,
        };
    },
    methods: {
        showDialog(which) {
            this.isDialog = true;
            this.whichDialog = which;
        },
    },
};
</script>
