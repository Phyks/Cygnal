<template>
    <div>
        <v-switch
            class="switch"
            :messages="preventSuspendMessages"
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
            :messages="geolocationPermissionMessages"
            color="success"
            :label="$t('permissions.geolocation')"
            v-model="hasGeolocationPermission"
            >
        </v-switch>
        <v-switch
            class="switch"
            :messages="permanentNotificationMessages"
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
    data() {
        return {
            geolocationPermissionMessages: [
                `<i aria-hidden='true' class='v-icon mdi mdi-help-circle' style='vertical-align: middle;' aria-hidden='true'></i> ${this.$t('permissions.geolocationDescription')}`,
            ],
            permanentNotificationMessages: [
                `<i aria-hidden='true' class='v-icon mdi mdi-help-circle' style='vertical-align: middle;' aria-hidden='true'></i> ${this.$t('permissions.permanentNotificationDescription')}`,
            ],
            preventSuspendMessages: [
                `<i aria-hidden='true' class='v-icon mdi mdi-help-circle' style='vertical-align: middle;' aria-hidden='true'></i> ${this.$t('permissions.preventSuspendDescription')}`,
            ],
        };
    },
};
</script>

<style>
.switch .v-label {
    color: rgba(0,0,0,.87);
}
</style>
