<template>
    <v-flex xs6 class="pa-2 pointer" @click.stop="handleClick">
        <v-card flat>
            <v-container fill-height fluid class="pa-0">
                <v-layout fill-height>
                    <v-flex xs12 class="text-xs-center">
                        <img :src="imageSrc" class="icon"></img>
                        <p>{{ label }}</p>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-card>
    </v-flex>
</template>

<script>
export default {
    props: {
        type: String,
        label: String,
        imageSrc: String,
        save: Function,
    },
    methods: {
        handleClick() {
            return this.save(this.type);
        },
    },
};
</script>

<style scoped>
.icon {
    max-width: 100%;
    border: 2px solid #231f20;
    border-radius: 10px;
}

.pointer {
    cursor: pointer;
}
</style>
