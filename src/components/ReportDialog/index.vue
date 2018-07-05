<template>
    <div>
        <v-dialog v-model="error" max-width="290">
            <v-card>
                <v-card-title class="subheading">{{ $t('reportDialog.unableToSendTitle') }}</v-card-title>

                <v-card-text>{{ $t('reportDialog.unableToSendDescription') }} </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn
                        color="red darken-1"
                        @click="error = null"
                        dark
                        large
                        >
                        {{ $t('misc.discard') }}
                    </v-btn>

                    <v-spacer></v-spacer>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-bottom-sheet v-model="isActive">
            <v-card>
                <v-container fluid>
                    <v-layout row wrap>
                        <ReportTile v-for="(item, type) in REPORT_TYPES" :type="type" :imageSrc="item.image" :label="$t(item.label)" :save="saveReport" :key="type"></ReportTile>
                    </v-layout>
                </v-container>
            </v-card>
        </v-bottom-sheet>
    </div>
</template>

<script>
import { REPORT_TYPES } from '@/constants';

import ReportTile from './ReportTile.vue';

export default {
    components: {
        ReportTile,
    },
    props: {
        value: Boolean,
        lat: Number,
        lng: Number,
    },
    computed: {
        isActive: {
            get() {
                return this.value;
            },
            set(val) {
                this.$emit('input', val);
            },
        },
    },
    data() {
        return {
            error: null,
            REPORT_TYPES,
        };
    },
    methods: {
        saveReport(type) {
            this.isActive = !this.isActive;
            return this.$store.dispatch('saveReport', {
                type,
                lat: this.lat,
                lng: this.lng,
            }).catch((exc) => {
                console.error(exc);
                this.error = exc;
            });
        },
    },
};
</script>

<style scoped>
.overlayDialog {
    z-index: 1003 !important;
}
</style>

<style>
.dialog__content {
    z-index: 1002 !important;
}
</style>
