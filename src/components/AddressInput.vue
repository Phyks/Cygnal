<template>
    <v-combobox
        :loading="loading"
        required
        :items="items"
        :search-input.sync="search"
        :filter="filter"
        v-model="select"
        :label="label"
        :hint="hint"
        persistent-hint
        clearable
        append-icon="my_location"
        :rules="rules"
        v-on:input="onInputHandler"
        ></v-combobox>
</template>

<script>
import fetch from 'isomorphic-fetch';

const API_ENDPOINT = 'https://api-adresse.data.gouv.fr/search/';

export default {
    props: {
        label: String,
        hint: String,
        onInput: Function,
    },
    data() {
        return {
            loading: false,
            APIItems: [],
            search: null,
            select: null,
            selectedItem: null,
            rules: [
                this.checkValue,
            ],
        };
    },
    watch: {
        search(value) {
            if (value) {
                this.queryAPI(value);
            } else {
                this.APIItems = [];
            }
        },
    },
    methods: {
        checkValue() {
            return (this.selectedItem != null) || 'Invalid selection';
        },
        queryAPI(value) {
            this.loading = true;

            fetch(`${API_ENDPOINT}?q=${value}`)
                .then(response => response.json())
                .then(data => data.features)
                .then((data) => {
                    this.loading = false;
                    this.APIItems = [];
                    data.forEach(
                        item => this.APIItems.push(item),
                    );
                    this.APIItems.sort((a, b) => (b.properties.score - a.properties.score));
                    this.APIItems = Array.concat([], this.APIItems);
                });
        },
        onInputHandler(value) {
            if (!value) {
                this.APIItems = [];
            } else {
                // Check against location string
                const APIItem = this.APIItems.find(item => (
                    item.properties && item.properties.label === value),
                );
                if (APIItem) {
                    this.selectedItem = {
                        latlng: {
                            lat: APIItem.geometry.coordinates[1],
                            lng: APIItem.geometry.coordinates[0],
                        },
                        label: APIItem.properties.label,
                    };
                    this.onInput(this.selectedItem);
                    return;
                }

                // No matched position
                this.selectedItem = null;
            }
        },
        filter(items) {
            // No filtering, already handled by the API endpoint.
            return items;
        },
    },
    computed: {
        items() {
            if (this.APIItems.length > 0) {
                return this.APIItems.map((item) => {
                    if (item.properties) {
                        return item.properties.label;
                    }
                    return item;
                });
            }
            return [];
        },
    },
};
</script>
