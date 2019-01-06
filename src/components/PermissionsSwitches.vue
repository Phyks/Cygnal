<template>
    <v-list subheader three-line>
        <v-subheader>Permissions</v-subheader>

        <v-list-tile
            @click.prevent="hasPlaySoundPermission = !hasPlaySoundPermission"
            >
            <v-list-tile-action>
                <v-checkbox
                    v-model="hasPlaySoundPermission"
                    ></v-checkbox>
            </v-list-tile-action>

            <v-list-tile-content
                >
                <v-list-tile-title>
                    {{ $t('permissions.playSound') }}
                </v-list-tile-title>
            </v-list-tile-content>
        </v-list-tile>

        <v-list-tile
            @click.prevent="hasVibratePermission = !hasVibratePermission"
            >
            <v-list-tile-action>
                <v-checkbox
                    v-model="hasVibratePermission"
                    ></v-checkbox>
            </v-list-tile-action>

            <v-list-tile-content
                >
                <v-list-tile-title>
                    {{ $t('permissions.vibrate') }}
                </v-list-tile-title>
            </v-list-tile-content>
        </v-list-tile>

        <v-list-tile
            @click.prevent="hasGeolocationPermission = !hasGeolocationPermission"
            >
            <v-list-tile-action>
                <v-checkbox
                    v-model="hasGeolocationPermission"
                    ></v-checkbox>
            </v-list-tile-action>

            <v-list-tile-content>
                <v-list-tile-title>
                    {{ $t('permissions.geolocation') }}
                </v-list-tile-title>
                <v-list-tile-sub-title>
                    {{ $t('permissions.geolocationDescription') }}
                </v-list-tile-sub-title>
            </v-list-tile-content>
        </v-list-tile>

        <v-list-tile
            @click.prevent="hasPreventSuspendPermission = !hasPreventSuspendPermission"
            >
            <v-list-tile-action>
                <v-checkbox
                    v-model="hasPreventSuspendPermission"
                    ></v-checkbox>
            </v-list-tile-action>

            <v-list-tile-content>
                <v-list-tile-title>
                    {{ $t('permissions.preventSuspend') }}
                </v-list-tile-title>
                <v-list-tile-sub-title>
                    {{ $t('permissions.preventSuspendDescription') }}
                </v-list-tile-sub-title>
            </v-list-tile-content>
        </v-list-tile>

        <v-list-tile
            @click.prevent="hasPermanentNotificationPermission = (
                !hasPermanentNotificationPermission
            )"
            >
            <v-list-tile-action>
                <v-checkbox
                    v-model="hasPermanentNotificationPermission"
                    ></v-checkbox>
            </v-list-tile-action>

            <v-list-tile-content>
                <v-list-tile-title>
                    {{ $t('permissions.permanentNotification') }}
                </v-list-tile-title>
                <v-list-tile-sub-title>
                    {{ $t('permissions.permanentNotificationDescription') }}
                </v-list-tile-sub-title>
            </v-list-tile-content>
        </v-list-tile>
    </v-list>
</template>

<script>
// TODO: Disable list items if function is not supported
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
