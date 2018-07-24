<template>
    <div>
        <v-list-tile @click="isShareMapViewModalVisible = true" v-if="shareMapViewURL">
            <v-list-tile-title>{{ $t("menu.shareMapView") }}</v-list-tile-title>
        </v-list-tile>
        <Modal v-model="isShareMapViewModalVisible">
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
                        @click="isShareMapViewModalVisible = false"
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
    </div>
</template>

<script>
import { DEFAULT_ZOOM } from '@/constants';

import Modal from '@/components/Modal.vue';

export default {
    components: {
        Modal,
    },
    computed: {
        shareMapViewURL() {
            // TODO: Should be position of the map, not position of the marker
            const currentPosition = this.$store.state.currentPosition;
            if (!currentPosition) {
                return null;
            }
            const currentZoom = this.$store.state.currentZoom || DEFAULT_ZOOM;
            const path = this.$router.resolve({
                name: 'SharedMap',
                params: {
                    lat: currentPosition[0],
                    lng: currentPosition[1],
                    zoom: currentZoom,
                },
            }).href;
            return `${window.location.origin}/${path}`;
        },
    },
    data() {
        return {
            isShareMapViewModalVisible: false,
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
};
</script>
