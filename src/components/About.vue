<template>
    <v-container fluid>
        <v-layout row>
            <v-flex xs12>
                <p>This app lets you track and share issues with bike lanes.</p>

                <h2 class="body-2">The available reports so far are:</h2>
                <ul class="ml-3">
                    <li><strong>GCUM</strong>: A car poorly parked on a bike lane.</li>
                    <li><strong>Interrupt</strong>: An interruption of the bike lane (works, unexpected end of the bike lane, etc.).</li>
                    <li><strong>Pothole</strong>: A pothole in the ground.</li>
                </ul>

                <p class="mt-3">It is released under an <a href="">MIT license</a>. The map background is using tiles from <a href="https://www.opencyclemap.org/docs/">OpenCycleMap</a>, thanks to <a href="">OpenStreetMap contributors</a> and <a href="">Leaflet</a>.</p>

            </v-flex>
        </v-layout>
    </v-container>
</template>
