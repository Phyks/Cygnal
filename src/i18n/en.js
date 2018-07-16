// Keys should be sorted alphabetically
export default {
    about: {
        availableReportsTitle: 'The available reports so far are:',
        geolocationDescription: 'As of current version, your precise geolocation is handled within your device and never sent from it to any external service. The map background is downloaded on demand from <a href="https://carto.com/location-data-services/basemaps/">Carto.com</a> and they have then access to an estimate of the displayed position.',
        license: 'It is released under an <a href="https://opensource.org/licenses/MIT">MIT license</a> (<a href="https://framagit.org/phyks/cyclassist">source code</a>). Icons are based on creations from Wikimedia and Vecteezy. The map background is using tiles from <a href="https://carto.com/location-data-services/basemaps/">Carto.com</a>, thanks to <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> and <a href="http://leafletjs.com/">Leaflet</a>. Collected reports are available under <a href="https://opendatacommons.org/licenses/odbl/">ODbL license</a>.',
        summary: 'This app lets you track and share issues with bike lanes.',
        usage: 'How to use',
        usageDescription: 'Use the button in the lower right corner to add a new report at your current location. To add a report elsewhere, do a click where you want the report to be shown. Press on a marker on the map to display more informations and report the problem as being still there or solved.',
    },
    buttons: {
        close: 'Close',
        downvote: 'Downvote',
        menu: 'Menu',
        recenterMap: 'Recenter map',
        reportProblem: 'Report problem',
        upvote: 'Upvote',
    },
    geolocation: {
        fetching: 'Fetching current position…',
        geolocation: 'Geolocation',
        unavailable: 'Sorry, geolocation is not available in your browser.',
    },
    intro: {
        checkingPermissions: 'Checking permissions',
        next: 'Next',
        ready: 'Ready to start',
        reportTypes: 'Report types',
        startReporting: 'Start reporting!',
        welcome: 'Welcome',
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
        accident: 'Accident',
        accidentDescription: 'Any accident on the road (automatically removed after one hour).',
        gcum: 'GCUM',
        gcumDescription: 'A car poorly parked on a bike lane. Such reports are automatically deleted after one hour, as they are by nature temporary (automatically removed after one hour).',
        interrupt: 'Interruption',
        interruptDescription: 'An interruption of the bike lane (works, unexpected end of the bike lane, etc.).',
        misc: 'Other',
        miscDescription: 'A problem on the road which does not fit in any other category.',
        obstacle: 'Obstacle',
        obstacleDescription: 'An obstacle on the bike lane (stones, bulky waste, etc.).',
        pothole: 'Pothole',
        potholeDescription: 'A pothole in the ground.',
    },
    settings: {
        locale: 'Language',
        preventSuspend: 'Prevent device from going to sleep',
        save: 'Save',
        skipOnboarding: 'Skip onboarding',
    },
};
