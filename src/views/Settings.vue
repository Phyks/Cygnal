<template>
    <v-container fluid class="no-padding">
        <v-layout row wrap>
            <v-flex xs12 sm4 offset-sm4 class="text-xs-center">
                <h2>{{ $t('menu.Settings') }}</h2>
                <form>
                    <v-select
                        :items="i18nItems"
                        v-model="locale"
                        :label="$t('settings.locale')"
                        required
                        ></v-select>

                    <v-select
                        :items="tileServers"
                        v-model="tileServer"
                        :label="$t('settings.tileServer')"
                        required
                        ></v-select>

                    <v-checkbox
                        :label="$t('settings.preventSuspend')"
                        v-model="preventSuspend"
                        ></v-checkbox>

                    <v-checkbox
                        :label="$t('settings.skipOnboarding')"
                        v-model="skipOnboarding"
                        ></v-checkbox>

                    <v-btn role="button" @click="submit">{{ $t('settings.save') }}</v-btn>
                </form>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import { TILE_SERVERS } from '@/constants';
import { messages } from '@/i18n';

export default {
    data() {
        return {
            i18nItems: Object.keys(messages),
            locale: this.$store.state.settings.locale,
            preventSuspend: this.$store.state.settings.preventSuspend,
            skipOnboarding: this.$store.state.settings.skipOnboarding,
            tileServer: this.$store.state.settings.tileServer,
            tileServers: Object.keys(TILE_SERVERS),
        };
    },
    methods: {
        submit() {
            this.$store.dispatch('setLocale', { locale: this.locale });
            this.$store.dispatch('setSetting', { setting: 'preventSuspend', value: this.preventSuspend });
            this.$store.dispatch('setSetting', { setting: 'skipOnboarding', value: this.skipOnboarding });
            this.$store.dispatch('setSetting', { setting: 'tileServer', value: this.tileServer });
        },
    },
};
</script>
