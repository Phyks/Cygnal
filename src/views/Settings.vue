<template>
    <v-container fluid class="no-padding">
        <v-layout row wrap>
            <v-flex xs12 sm4 offset-sm4 class="text-xs-center">
                <h2>{{ $t('menu.Settings') }}</h2>
                <form>
                    <v-select
                        :items="i18nItems"
                        v-model="i18nSelect"
                        :label="$t('settings.locale')"
                        required
                        ></v-select>

                    <v-checkbox
                        :label="$t('settings.preventSuspend')"
                        v-model="preventSuspend"
                        ></v-checkbox>

                        <v-btn @click="submit">{{ $t('settings.save') }}</v-btn>
                </form>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import { messages } from '@/i18n';
import { storageAvailable } from '@/tools';

export default {
    data() {
        let preventSuspend = localStorage.getItem('preventSuspend');
        if (preventSuspend) {
            preventSuspend = JSON.parse(preventSuspend);
        } else {
            preventSuspend = true;
        }
        return {
            i18nItems: Object.keys(messages),
            i18nSelect: this.$i18n.locale,
            preventSuspend,
        };
    },
    methods: {
        submit() {
            if (storageAvailable('localStorage')) {
                localStorage.setItem('i18nSetting', this.i18nSelect);
                localStorage.setItem('preventSuspend', JSON.stringify(this.preventSuspend));
            }
            this.$i18n.locale = this.i18nSelect;
        },
    },
};
</script>
