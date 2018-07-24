<template>
    <v-dialog v-model="isModalShown" max-width="290">
        <slot></slot>
    </v-dialog>
</template>

<script>
// TODO: Not closing when clicking outside
export default {
    beforeDestroy() {
        window.removeEventListener('keydown', this.hideModalOnEsc);
    },
    computed: {
        isModalShown: {
            get() {
                return this.value;
            },
            set(val) {
                this.$emit('input', val);
            },
        },
    },
    methods: {
        hideModalOnEsc(event) {
            let isEscape = false;
            if ('key' in event) {
                isEscape = (event.key === 'Escape' || event.key === 'Esc');
            } else {
                isEscape = (event.keyCode === 27);
            }
            if (isEscape) {
                this.isModalShown = false;
            }
        },
    },
    mounted() {
        window.addEventListener('keydown', this.hideModalOnEsc);
    },
    props: {
        value: Boolean,
    },
};
</script>
