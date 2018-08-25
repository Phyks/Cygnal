<template>
    <Modal v-model="isActive">
        <v-card>
            <v-card-title class="headline">{{ $t('shareMapViewModal.shareCurrentMapView') }}</v-card-title>

            <v-card-text>
                {{ $t('shareMapViewModal.copyURLToShareCurrentMapView') }}

                <v-text-field ref="shareLinkRef" readonly :hint="shareLinkHint" @click="copyShareLink" v-model="shareMapViewURL" prepend-icon="share"></v-text-field>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn
                    color="green darken-1"
                    @click="isActive = false"
                    dark
                    large
                    role="button"
                    >
                    {{ $t('misc.ok') }}
                </v-btn>

                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </Modal>
</template>

<script>
import { DEFAULT_ZOOM } from '@/constants';

import Modal from '@/components/Modal.vue';

export default {
    components: {
        Modal,
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
        shareMapViewURL() {
            const currentMapCenter = this.$store.state.map.center;
            if (!currentMapCenter.every(item => item !== null)) {
                return null;
            }
            const currentMapZoom = this.$store.state.map.zoom || DEFAULT_ZOOM;
            const path = this.$router.resolve({
                name: 'SharedMap',
                params: {
                    lat: currentMapCenter[0],
                    lng: currentMapCenter[1],
                    zoom: currentMapZoom,
                },
            }).href;
            return `${window.location.origin}/${path}`;
        },
    },
    data() {
        return {
            shareLinkHint: null,
        };
    },
    methods: {
        copyShareLink() {
            this.$refs.shareLinkRef.$el.querySelector('input').select();
            if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
                document.execCommand('copy');
                this.shareLinkHint = this.$t('shareMapViewModal.copiedToClipboard');
            }
        },
    },
    props: {
        value: Boolean,
    },
};
</script>
