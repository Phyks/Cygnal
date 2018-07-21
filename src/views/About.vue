<template>
    <v-container fluid>
        <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
                <p>{{ $t('about.summary') }} <span v-html="$t('about.geolocationDescription')"></span></p>

                <h2 class="body-2">{{ $t('about.usage') }}</h2>
                <p>{{ $t('about.usageDescription') }}</p>

                <h2 class="body-2">{{ $t('about.availableReportsTitle') }}</h2>
                <ReportsDescription></ReportsDescription>

                <p class="mt-3" v-html="$t('about.license')"></p>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import ReportsDescription from '@/components/ReportsDescription.vue';

export default {
    components: {
        ReportsDescription,
    },
};
</script>
