<template>
    <div>
        <p class="text-xs-center">{{ error }}</p>
        <p class="text-xs-center">
            <v-btn role="button" color="blue" dark @click="retryFunction">{{ $t('misc.retry') }}</v-btn>
        </p>
        <p>{{ $t('misc.or') }}</p>
        <p>
            <AddressInput
                :label="$t('locationPicker.pickALocationManually')"
                :onInput="onManualLocationPicker"
                ></AddressInput>
        </p>
    </div>
</template>

<script>
import AddressInput from '@/components/AddressInput.vue';

export default {
    components: {
        AddressInput,
    },
    methods: {
        onManualLocationPicker(value) {
            this.$store.dispatch(
                'setCurrentPosition',
                { latLng: [value.latlng.lat, value.latlng.lng] },
            );
        },
    },
    props: {
        error: String,
        retryFunction: Function,
    },
};
</script>
