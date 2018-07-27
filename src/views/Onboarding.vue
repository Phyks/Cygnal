<template>
    <v-container fluid fill-height class="no-padding">
        <v-layout row wrap class="text-xs-center blue lighten-2 px-2" v-if="step == 0">
            <v-flex xs12>
                <h2 class="display-1 pa-3">{{ $t('intro.welcome') }}</h2>
                <p>{{ $t('about.summary') }}</p>
                <p><img src="@/assets/logo.svg" alt="Logo"/></p>
                <v-btn role="button" round color="green" dark @click="step += 1">{{ $t('intro.next') }}</v-btn>
            </v-flex>
        </v-layout>
        <v-layout row wrap class="text-xs-center blue lighten-2 px-2" v-if="step == 1">
            <v-flex xs12>
                <h2 class="headline pa-3">{{ $t('intro.reportTypes') }}</h2>

                <p class="text-xs-center">En cliquant sur l'icône <v-icon>report_problem</v-icon>, la boîte de signalement s'ouvre. Vous pouvez signaler :</p>

                <ReportsDescription></ReportsDescription>

                <v-btn role="button" round color="green" dark @click="step += 1">{{ $t('intro.next') }}</v-btn>
            </v-flex>
        </v-layout>
        <v-layout row wrap class="text-xs-center blue lighten-2" v-if="step == 2">
            <v-flex xs8 offset-xs2>
                <h2 class="headline pa-3">{{ $t('intro.checkingPermissions') }}</h2>

                <v-layout row class="white">
                    <v-flex class="mb-3 mx-3">
                        <PermissionsSwitches></PermissionsSwitches>
                    </v-flex>
                </v-layout>

                <v-btn role="button" round color="green" dark @click="step += 1">{{ $t('intro.next') }}</v-btn>
            </v-flex>
        </v-layout>
        <v-layout row wrap class="text-xs-center blue lighten-2" v-if="step == 3">
            <v-flex xs8 offset-xs2>
                <h2 class="headline pa-3">{{ $t('intro.ready') }}</h2>
                <p><img src="@/assets/logo.svg" alt="Logo"/></p>
                <v-btn role="button" round color="green" dark @click="goToMap">{{ $t('intro.startReporting') }}</v-btn>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import ReportsDescription from '@/components/ReportsDescription.vue';
import PermissionsSwitches from '@/components/PermissionsSwitches.vue';

export default {
    components: {
        ReportsDescription,
        PermissionsSwitches,
    },
    created() {
        this.$store.dispatch('markIntroAsSeen');
    },
    data() {
        let step = 0;
        if (this.$store.state.settings.skipOnboarding) {
            step = 3;
        }
        return {
            step,
        };
    },
    methods: {
        goToMap() {
            if (!this.$store.state.settings.skipOnboarding) {
                this.$store.dispatch('setSetting', { setting: 'skipOnboarding', value: true });
            }
            this.$router.push({ name: 'Map' });
        },
    },
};
</script>

<style scoped>
.no-padding {
    padding: 0;
}
</style>
