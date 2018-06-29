// Keys should be sorted alphabetically
export default {
    about: {
        availableReportsTitle: "Les signalements disponibles pour l'instant sont :",
        gcumDescription: "Une voiture (mal) garée sur la piste cyclable. Ces signalements sont automatiquement supprimés au bout d'une heure car ils sont par essence temporaires.",
        geolocationDescription: "Dans la version actuelle, votre position est traitée directement par votre appareil et n'est jamais envoyée à un service externe.",
        interruptDescription: "Une interruption d'itinéraire cyclable (travaux, arrêt inattendu d'une piste cyclable, etc)",
        license: "Le code source est sous <a href='https://opensource.org/licenses/MIT'>licence MIT license</a> (<a href='https://framagit.org/phyks/cyclassist'>code source</a>). Les tuiles de fond de carte proviennent de chez <a href='https://www.opencyclemap.org/docs/'>OpenCycleMap</a>, grace aux <a href='https://www.openstreetmap.org/copyright'>contributeurs OpenStreetMap</a> et à <a href='http://leafletjs.com/'>Leaflet</a>. Les signalements sont disponibles sous <a href='https://opendatacommons.org/licenses/odbl/'>licence ODbL</a>.",
        potholeDescription: 'Un nid de poule dans la route.',
        summary: 'Cette application vous permet de signaler et de partager des problèmes avec les itinéraires cyclables.',
        usage: 'Utilisation',
        usageDescription: "Utilisez le bouton en bas à droite pour ajouter un signalement à votre emplacement actuel. Pour ajouter un signalement ailleurs, faites un appui long (ou clic droit) à l'emplacement souhaité sur la carte.",
    },
    geolocation: {
        fetching: 'En attente de votre position…',
        unavailable: "Désolé, la géolocalisation n'est pas disponible dans votre navigateur.",
    },
    menu: {
        About: 'Aide',
        Map: 'Carte',
        Settings: 'Préférences',
    },
    misc: {
        spaceBeforeDoublePunctuations: ' ',
    },
    reportLabels: {
        gcum: 'GCUM',
        interrupt: 'Interruption',
        pothole: 'Nid de poule',
    },
    settings: {
        locale: 'Langue',
        save: 'Sauver',
    },
};
