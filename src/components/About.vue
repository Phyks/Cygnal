<template>
    <v-container fluid>
        <v-layout row>
            <v-flex xs6 offset-xs3>
                <p>{{ $t('about.summary') }}</p>

                <h2 class="body-2">{{ $t('about.availableReportsTitle') }}</h2>
                <ul class="ml-3">
                    <li><strong>{{ $t('reportLabels.gcum') }}</strong>{{ $t('misc.spaceBeforeDoublePunctuations') }}: {{ $t('about.gcumDescription') }}</li>
                    <li><strong>{{ $t('reportLabels.interrupt') }}</strong>{{ $t('misc.spaceBeforeDoublePunctuations') }}: {{ $t('about.interruptDescription') }}</li>
                    <li><strong>{{ $t('reportLabels.pothole') }}</strong>{{ $t('misc.spaceBeforeDoublePunctuations') }}: {{ $t('about.potholeDescription') }}</li>
                </ul>

                <p class="mt-3" v-html="$t('about.license')"></p>

            </v-flex>
        </v-layout>
    </v-container>
</template>
