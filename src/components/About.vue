<template>
    <v-container fluid>
        <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
                <p>{{ $t('about.summary') }} {{ $t('about.geolocationDescription') }}</p>

                <h2 class="body-2">{{ $t('about.usage') }}</h2>
                <p>{{ $t('about.usageDescription') }}</p>

                <h2 class="body-2">{{ $t('about.availableReportsTitle') }}</h2>
                <ul class="ml-3">
                    <li><strong>{{ $t('reportLabels.accident') }}</strong>{{ $t('misc.spaceBeforeDoublePunctuations') }}: {{ $t('reportLabels.accidentDescription') }}</li>
                    <li><strong>{{ $t('reportLabels.gcum') }}</strong>{{ $t('misc.spaceBeforeDoublePunctuations') }}: {{ $t('reportLabels.gcumDescription') }}</li>
                    <li><strong>{{ $t('reportLabels.interrupt') }}</strong>{{ $t('misc.spaceBeforeDoublePunctuations') }}: {{ $t('reportLabels.interruptDescription') }}</li>
                    <li><strong>{{ $t('reportLabels.obstacle') }}</strong>{{ $t('misc.spaceBeforeDoublePunctuations') }}: {{ $t('reportLabels.obstacleDescription') }}</li>
                    <li><strong>{{ $t('reportLabels.pothole') }}</strong>{{ $t('misc.spaceBeforeDoublePunctuations') }}: {{ $t('reportLabels.potholeDescription') }}</li>
                    <li><strong>{{ $t('reportLabels.misc') }}</strong>{{ $t('misc.spaceBeforeDoublePunctuations') }}: {{ $t('reportLabels.miscDescription') }}</li>
                </ul>

                <p class="mt-3" v-html="$t('about.license')"></p>
            </v-flex>
        </v-layout>
    </v-container>
</template>
