// Keys should be sorted alphabetically
export default {
    about: {
        availableReportsTitle: "Les signalements disponibles pour l'instant sont :",
        geolocationDescription: "Dans la version actuelle, votre position est traitée directement par votre appareil et n'est jamais envoyée à un service externe. Le fond de carte est téléchargé à la demande depuis <a href='https://carto.com/location-data-services/basemaps/'>Carto.com</a> et ils ont donc accès à une estimation de la position affichée. Si vous refusez le partage de votre géolocalisation, vous pourrez saisir une adresse manuellement à la place mais vous perdrez les fonctionnalités avancées qui reposent sur la géolocalisation.",
        license: "Le code source est sous <a href='https://opensource.org/licenses/MIT'>licence MIT license</a> (<a href='https://framagit.org/phyks/cyclassist'>code source</a>). Les icones sont basées sur des travaux de Wikimedia et Vecteezy. Les tuiles de fond de carte proviennent de chez <a href='https://carto.com/location-data-services/basemaps/'>Carto.com</a>, grace aux <a href='https://www.openstreetmap.org/copyright'>contributeurs OpenStreetMap</a> et à <a href='http://leafletjs.com/'>Leaflet</a>. Les signalements sont disponibles sous <a href='https://opendatacommons.org/licenses/odbl/'>licence ODbL</a>.",
        summary: 'Cette application vous permet de signaler et de partager des problèmes avec les itinéraires cyclables.',
        usage: 'Utilisation',
        usageDescription: "Utilisez le bouton en bas à droite pour ajouter un signalement à votre emplacement actuel. Pour ajouter un signalement ailleurs, faites un appui à l'emplacement souhaité sur la carte. Appuyer sur un marqueur sur la carte pour afficher plus d'informations et signaler que le problème est toujours présent ou non.",
    },
    buttons: {
        close: 'Fermer',
        downvote: 'Infirmer',
        menu: 'Menu',
        recenterMap: 'Recentrer la carte',
        reportProblem: 'Nouveau signalement',
        upvote: 'Confirmer',
    },
    geolocation: {
        fetching: 'En attente de votre position…',
        geolocation: 'Géolocalisation',
        unavailable: "Désolé, la géolocalisation n'est pas disponible dans votre navigateur.",
    },
    intro: {
        checkingPermissions: 'Vérification des permissions',
        next: 'Suivant',
        ready: 'Tout est prêt !',
        reportTypes: 'Types de signalements',
        startReporting: 'Commencer à signaler !',
        welcome: 'Bienvenue !',
    },
    menu: {
        About: 'Aide',
        Map: 'Carte',
        Settings: 'Préférences',
    },
    misc: {
        discard: 'Annuler',
        retry: 'Réessayer',
        spaceBeforeDoublePunctuations: ' ',
    },
    reportCard: {
        Reported: 'Signalé',
    },
    reportDialog: {
        unableToSendDescription: "Une erreur de réseau empêche l'envoi du dernier signalement.",
        unableToSendTitle: "Impossible d'envoyer le dernier signalement",
    },
    reportLabels: {
        accident: 'Accident',
        accidentDescription: 'Un accident sur la route (automatiquement supprimé après une heure).',
        gcum: 'GCUM',
        gcumDescription: 'Une voiture (mal) garée sur la piste cyclable (automatiquement supprimé après une heure).',
        interrupt: 'Interruption',
        interruptDescription: "Une interruption d'itinéraire cyclable (travaux, arrêt inattendu d'une piste cyclable, etc)",
        misc: 'Autre',
        miscDescription: 'Un problème qui ne rentre dans aucune autre catégorie.',
        obstacle: 'Obstacle',
        obstacleDescription: 'Un obstacle sur la piste cyclable (granit de bordure, encombrants, etc)',
        pothole: 'Nid de poule',
        potholeDescription: 'Un nid de poule dans la route.',
    },
    settings: {
        locale: 'Langue',
        preventSuspend: "Empêcher l'appareil de passer en veille",
        save: 'Sauver',
        skipOnboarding: "Sauter l'introduction",
        tileServer: 'Serveur de tuiles pour la carte',
    },
};
