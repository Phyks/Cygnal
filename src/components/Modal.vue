<template>
    <v-dialog v-model="isModalShown" :max-width="maxWidth">
        <slot></slot>
    </v-dialog>
</template>

<script>
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
        maxWidth: {
            type: Number,
            default: 290,
        },
        value: Boolean,
    },
};
</script>
