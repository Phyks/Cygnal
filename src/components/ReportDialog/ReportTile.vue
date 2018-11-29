<template>
    <v-flex xs6 class="pa-2 pointer" @click.stop="handleClick">
        <v-card flat>
            <v-container fill-height fluid class="pa-0">
                <v-layout fill-height>
                    <v-flex xs12 class="text-xs-center">
                        <img class="icon" :src="imageSrc"/>
                        <p>{{ label }}</p>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-card>
    </v-flex>
</template>

<script>
export default {
    methods: {
        handleClick() {
            return this.save(this.type);
        },
    },
    props: {
        type: String,
        label: String,
        imageSrc: String,
        save: Function,
    },
};
</script>

<style scoped>
.icon {
    max-width: 100%;
    max-height: 100px;
    border: 2px solid #231f20;
    border-radius: 10px;
}

.pointer {
    cursor: pointer;
}
</style>
