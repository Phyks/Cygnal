<template>
    <div>
        <v-switch
            class="switch"
            :messages="[`<i aria-hidden='true' class='v-icon material-icons' style='vertical-align: middle;'>help</i> ${$t('permissions.preventSuspendDescription')}`]"
            color="success"
            :label="$t('permissions.preventSuspend')"
            v-model="hasPreventSuspendPermission"
            >
        </v-switch>
        <v-switch
            class="switch"
            color="success"
            :label="$t('permissions.playSound')"
            v-model="hasPlaySoundPermission"
            >
        </v-switch>
        <v-switch
            class="switch"
            color="success"
            :label="$t('permissions.vibrate')"
            v-model="hasVibratePermission"
            >
        </v-switch>
        <v-switch
            class="switch"
            :messages="[`<i aria-hidden='true' class='v-icon material-icons' style='vertical-align: middle;'>help</i> ${$t('permissions.geolocationDescription')}`]"
            color="success"
            :label="$t('permissions.geolocation')"
            v-model="hasGeolocationPermission"
            >
        </v-switch>
        <v-switch
            class="switch"
            :messages="[`<i aria-hidden='true' class='v-icon material-icons' style='vertical-align: middle;'>help</i> ${$t('permissions.permanentNotificationDescription')}`]"
            color="success"
            :label="$t('permissions.permanentNotification')"
            v-model="hasPermanentNotificationPermission"
            >
        </v-switch>
    </div>
</template>

<script>
export default {
    computed: {
        hasGeolocationPermission: {
            get() {
                return this.$store.state.settings.hasGeolocationPermission;
            },
            set(value) {
                this.$store.dispatch('setSetting', { setting: 'hasGeolocationPermission', value });
            },
        },
        hasPermanentNotificationPermission: {
            get() {
                return this.$store.state.settings.hasPermanentNotificationPermission;
            },
            set(value) {
                this.$store.dispatch('setSetting', { setting: 'hasPermanentNotificationPermission', value });
            },
        },
        hasPlaySoundPermission: {
            get() {
                return this.$store.state.settings.hasPlaySoundPermission;
            },
            set(value) {
                this.$store.dispatch('setSetting', { setting: 'hasPlaySoundPermission', value });
            },
        },
        hasPreventSuspendPermission: {
            get() {
                return this.$store.state.settings.hasPreventSuspendPermission;
            },
            set(value) {
                this.$store.dispatch('setSetting', { setting: 'hasPreventSuspendPermission', value });
            },
        },
        hasVibratePermission: {
            get() {
                return this.$store.state.settings.hasVibratePermission;
            },
            set(value) {
                this.$store.dispatch('setSetting', { setting: 'hasVibratePermission', value });
            },
        },
    },
};
</script>

<style>
.switch .v-label {
    color: rgba(0,0,0,.87);
}
</style>
