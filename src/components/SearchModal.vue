<template>
    <Modal v-model="isActive">
        <v-card>
            <v-card-title class="headline">{{ $t('searchModal.searchModal') }}</v-card-title>

            <v-card-text>
                <AddressInput
                    :label="inputLabel"
                    :onInput="onManualLocationPicker"
                    :clearOnSelection="true"
                    ></AddressInput>
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
import { capitalize } from '@/tools';

import AddressInput from '@/components/AddressInput.vue';
import Modal from '@/components/Modal.vue';

export default {
    components: {
        AddressInput,
        Modal,
    },
    computed: {
        inputLabel() {
            return capitalize(this.$t('locationPicker.pickALocationManually'));
        },
        isActive: {
            get() {
                return this.value;
            },
            set(val) {
                this.$emit('input', val);
            },
        },
    },
    methods: {
        onManualLocationPicker(value) {
            this.isActive = false;
            this.$router.push({
                name: 'SharedMap',
                params: {
                    lat: value.latlng.lat,
                    lng: value.latlng.lng,
                    zoom: DEFAULT_ZOOM,
                },
            });
        },
    },
    props: {
        value: Boolean,
    },
};
</script>
