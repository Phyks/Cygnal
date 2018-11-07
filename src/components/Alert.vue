<template>
    <div class="alert-wrapper">
        <v-alert class="alert" type="error" v-model="showAlert" :dismissible="true" transition="slide-y-transition">
            {{ error }}
            <v-progress-linear
                class="progress"
                v-model="progressValue"
                background-opacity="0"
                color="rgba(0,0,0,0.3)"
                ></v-progress-linear>
        </v-alert>
    </div>
</template>

<script>
export default {
    beforeDestroy() {
        this.clearTimer();
    },
    data() {
        return {
            interval: null,
            progressValue: 100,
            showAlert: true,
        };
    },
    methods: {
        clearTimer() {
            if (this.interval !== null) {
                clearInterval(this.interval);
            }
        },
    },
    mounted() {
        this.interval = setInterval(() => {
            this.progressValue -= 4;
            if (this.progressValue < 0) {
                this.showAlert = false;
                this.clearTimer();
            }
        }, 100);
    },
    props: {
        error: String,
        onDismiss: Function,
    },
    watch: {
        showAlert(newAlert) {
            if (!newAlert && this.onDismiss) {
                this.onDismiss();
            }
        },
    },
};
</script>

<style scoped>
.alert-wrapper {
    position: absolute;
    top: 0;
    z-index: 9999;
    width: 100%;
}

.alert {
    margin-left: auto;
    margin-right: auto;
    margin-top: 0;
    width: 50%;
}

.progress {
    position: absolute;
    bottom: 0;
    left: 0;
    margin-bottom: 0;
}
</style>
