<template>
    <Modal v-model="hasError">
        <v-card>
            <v-card-title class="subheading">{{ $t('reportDialog.unableToSendTitle') }}</v-card-title>

            <v-card-text>{{ $t('reportDialog.unableToSendDescription') }} </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn @click="hasError = false" large role="button">
                    {{ $t('misc.ok') }}
                </v-btn>

                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </Modal>
</template>

<script>
import Modal from '@/components/Modal.vue';

export default {
    components: {
        Modal,
    },
    computed: {
        hasError: {
            get() {
                return this.value;
            },
            set(val) {
                this.$emit('input', val);
            },
        },
    },
    props: {
        value: Boolean,
    },
};
</script>
