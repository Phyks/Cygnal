// Keys should be sorted alphabetically
export default {
    about: {
        availableReportsTitle: 'The available reports so far are:',
        geolocationDescription: 'As of current version, your geolocation is handled within your device and never sent from it to any external service.',
        license: 'It is released under an <a href="https://opensource.org/licenses/MIT">MIT license</a> (<a href="https://framagit.org/phyks/cyclassist">source code</a>). Icons are based on creations from Wikimedia and Vecteezy. The map background is using tiles from <a href="https://www.opencyclemap.org/docs/">OpenCycleMap</a>, thanks to <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> and <a href="http://leafletjs.com/">Leaflet</a>. Collected reports are available under <a href="https://opendatacommons.org/licenses/odbl/">ODbL license</a>.',
        summary: 'This app lets you track and share issues with bike lanes.',
        usage: 'How to use',
        usageDescription: 'Use the button in the lower right corner to add a new report at your current location. To add a report elsewhere, do a click where you want the report to be shown.',
    },
    geolocation: {
        fetching: 'Fetching current position…',
        unavailable: 'Sorry, geolocation is not available in your browser.',
    },
    intro: {
        start: "Let's go!",
    },
    menu: {
        About: 'Help',
        Map: 'Map',
        Settings: 'Settings',
    },
    misc: {
        discard: 'Discard',
        retry: 'Retry',
        spaceBeforeDoublePunctuations: '',
    },
    reportCard: {
        Reported: 'Reported',
    },
    reportDialog: {
        unableToSendDescription: 'There was a network issue preventing from sending the latest report.',
        unableToSendTitle: 'Unable to send latest report',
    },
    reportLabels: {
        gcum: 'GCUM',
        gcumDescription: 'A car poorly parked on a bike lane. Such reports are automatically deleted after one hour, as they are by nature temporary.',
        interrupt: 'Interruption',
        interruptDescription: 'An interruption of the bike lane (works, unexpected end of the bike lane, etc.).',
        obstacle: 'Obstacle',
        obstacleDescription: 'An obstacle on the bike lane (stones, bulky waste, etc.).',
        pothole: 'Pothole',
        potholeDescription: 'A pothole in the ground.',
    },
    settings: {
        locale: 'Language',
        preventSuspend: 'Prevent device from going to sleep',
        save: 'Save',
    },
};
