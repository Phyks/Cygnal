<template>
    <Modal v-model="isActive" :maxWidth="400">
        <v-card>
            <v-card-title class="headline">{{ $t('reportIssueModal.reportIssue') }}</v-card-title>

            <v-card-text>
                <v-textarea
                    :label="$t('reportIssueModal.description')"
                    v-model="description"
                    ></v-textarea>
                <v-checkbox
                    v-if="isIncludeGPXVisible"
                    :label="$t('reportIssueModal.includeGPX')"
                    v-model="shouldIncludeGPX"
                    ></v-checkbox>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn
                    @click="sendEmail"
                    color="green darken-1"
                    :dark="!!description"
                    :disabled="!description"
                    :href="mailtoLink"
                    large
                    role="button"
                    >
                    {{ $t('reportIssueModal.send') }} <v-icon class="ml-1">email</v-icon>
                </v-btn>

                <v-spacer></v-spacer>

                {{ $t('misc.or') }}

                <v-spacer></v-spacer>

                <v-btn
                    color="grey"
                    @click="isActive = false"
                    dark
                    large
                    role="button"
                    >
                    {{ $t('buttons.close') }}
                </v-btn>

                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </Modal>
</template>

<script>
import { CONTACT_EMAIL_ADDRESS } from '@/constants';

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
        isIncludeGPXVisible() {
            return this.$store.state.location.gpx.length > 0;
        },
        mailtoLink() {
            let mailText = this.description;
            if (this.shouldIncludeGPX) {
                mailText += `\n\nGPX trace: ${JSON.stringify(this.$store.state.location.gpx)}.`;
            }
            return `mailto:${CONTACT_EMAIL_ADDRESS}?subject=Issue%20with%20Cyclassist&body=${encodeURIComponent(mailText)}`;
        },
    },
    data() {
        return {
            description: null,
            shouldIncludeGPX: false,
        };
    },
    methods: {
        sendEmail() {
            // Close modal
            this.isActive = false;
            // Reset description and checkbox
            this.description = null;
            this.shouldIncludeGPX = false;
        },
    },
    props: {
        value: Boolean,
    },
};
</script>
