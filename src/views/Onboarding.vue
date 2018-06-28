<template>
    <v-container>
        <v-layout row wrap>
            <v-flex xs12 sm4 offset-sm4 v-if="step == 0">
                <v-layout row class="text-xs-center">
                    <v-flex xs12>
                        <h1>Cycl'assist</h1>
                    </v-flex>
                </v-layout>
                <v-layout row class="text-xs-center">
                    <v-flex xs12>
                        <div></div>
                        <p>{{ $t('onboarding.start') }}</p>
                    </v-flex>
                </v-layout>
                <v-layout row class="text-xs-center">
                    <v-flex xs12>
                        <v-btn round color="primary" dark @click="step += 1">{{ $t('onboarding.start') }}</v-btn>
                    </v-flex>
                </v-layout>
            </v-flex>
            <v-flex xs12 v-if="step == 1">
                <v-layout row>
                    <v-flex xs12 sm4 offset-sm4>
                        <h2 class="body-2">{{ $t('about.availableReportsTitle') }}</h2>
                        <ul class="ml-3">
                            <li><strong>{{ $t('reportLabels.gcum') }}</strong>{{ $t('misc.spaceBeforeDoublePunctuations') }}: {{ $t('about.gcumDescription') }}</li>
                            <li><strong>{{ $t('reportLabels.interrupt') }}</strong>{{ $t('misc.spaceBeforeDoublePunctuations') }}: {{ $t('about.interruptDescription') }}</li>
                            <li><strong>{{ $t('reportLabels.pothole') }}</strong>{{ $t('misc.spaceBeforeDoublePunctuations') }}: {{ $t('about.potholeDescription') }}</li>
                        </ul>

                        <p class="text-xs-center">
                            <v-btn round color="primary" dark @click="step += 1">{{ $t('onboarding.next') }}</v-btn>
                        </p>
                    </v-flex>
                </v-layout>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
export default {
    data() {
        return {
            step: 0,
        };
    },
};
</script>
