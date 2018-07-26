<template>
    <div>
        <ReportErrorModal v-model="hasError"></ReportErrorModal>
        <v-bottom-sheet v-model="isActive">
            <v-card>
                <v-container fluid>
                    <v-layout row wrap>
                        <ReportTile
                            v-for="type in REPORT_TYPES_ORDER"
                            :type="type"
                            :imageSrc="REPORT_TYPES[type].image"
                            :label="$t(REPORT_TYPES[type].label)"
                            :save="saveReport"
                            :key="type"
                            >
                        </ReportTile>
                    </v-layout>
                </v-container>
            </v-card>
        </v-bottom-sheet>
    </div>
</template>

<script>
import { REPORT_TYPES, REPORT_TYPES_ORDER } from '@/constants';

import ReportErrorModal from '@/components/ReportErrorModal.vue';
import ReportTile from './ReportTile.vue';

export default {
    beforeDestroy() {
        window.removeEventListener('keydown', this.hideReportDialogOnEsc);
    },
    components: {
        ReportErrorModal,
        ReportTile,
    },
    computed: {
        isActive: {
            get() {
                return this.value;
            },
            set(val) {
                if (val === false) {
                    this.onHide();
                }
                this.$emit('input', val);
            },
        },
    },
    data() {
        return {
            hasError: false,
            REPORT_TYPES,
            REPORT_TYPES_ORDER,
        };
    },
    methods: {
        hideReportDialogOnEsc(event) {
            let isEscape = false;
            if ('key' in event) {
                isEscape = (event.key === 'Escape' || event.key === 'Esc');
            } else {
                isEscape = (event.keyCode === 27);
            }
            if (isEscape) {
                this.isActive = false;
            }
        },
        saveReport(type) {
            this.isActive = false;
            const report = {
                type,
                lat: this.latLng[0],
                lng: this.latLng[1],
            };
            return this.$store.dispatch('saveReport', report)
                .catch((exc) => {
                    console.error(exc);
                    this.hasError = true;
                    this.$store.dispatch('saveUnsentReport', { report });
                });
        },
    },
    mounted() {
        window.addEventListener('keydown', this.hideReportDialogOnEsc);
    },
    props: {
        value: Boolean,
        latLng: Array,
        onHide: Function,
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
