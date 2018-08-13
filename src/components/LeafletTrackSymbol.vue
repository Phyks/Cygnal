<template>
    <div>
        <slot></slot>
    </div>
</template>

<script>
// Adapted from https://github.com/ais-one/vue2-leaflet-tracksymbol
import L from 'leaflet';
import 'leaflet-tracksymbol';

export default {
    props: {
        heading: Number,
        latLng: [Object, Array],
        options: Object,
        visible: {
            type: Boolean,
            default: true,
        },
    },
    watch: {
        heading(newHeading) {
            this.mapObject.setHeading(newHeading);
        },
        latLng(newLatLng) {
            this.mapObject.setLatLng(newLatLng);
        },
        options(newOptions) {
            L.setOptions(this.mapObject, newOptions);
        },
        visible: 'setVisible',
    },
    mounted() {
        const options = Object.assign({}, this.options, { heading: this.heading });
        this.mapObject = L.trackSymbol(this.latLng, options);
        if (this.$parent._isMounted) {
            this.deferredMountedTo(this.$parent.mapObject);
        }
    },
    beforeDestroy() {
        this.setVisible(false);
    },
    methods: {
        deferredMountedTo(parent) {
            this.parent = parent;
            const that = this.mapObject;
            for (let i = 0; i < this.$children.length; i += 1) {
                this.$children[i].deferredMountedTo(that);
            }
            if (this.visible) {
                this.mapObject.addTo(parent);
            }
        },
        setVisible(newVal, oldVal) {
            if (newVal === oldVal) {
                return;
            }
            if (this.mapObject) {
                if (newVal) {
                    this.mapObject.addTo(this.parent);
                } else {
                    this.parent.removeLayer(this.mapObject);
                }
            }
        },
    },
};
</script>
