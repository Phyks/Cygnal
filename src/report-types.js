import accidentMarker from '@/assets/accidentMarker.svg';
import gcumMarker from '@/assets/gcumMarker.svg';
import interruptMarker from '@/assets/interruptMarker.svg';
import miscMarker from '@/assets/miscMarker.svg';
import obstacleMarker from '@/assets/obstacleMarker.svg';
import potholeMarker from '@/assets/potholeMarker.svg';
import accidentIcon from '@/assets/accident.svg';
import gcumIcon from '@/assets/gcum.svg';
import interruptIcon from '@/assets/interrupt.svg';
import miscIcon from '@/assets/misc.svg';
import obstacleIcon from '@/assets/obstacle.svg';
import potholeIcon from '@/assets/pothole.svg';

export default {
    accident: {
        description: 'reportLabels.accidentDescription',
        label: 'reportLabels.accident',
        image: accidentIcon,
        marker: accidentMarker,
        markerLarge: accidentMarker,
    },
    gcum: {
        description: 'reportLabels.gcumDescription',
        label: 'reportLabels.gcum',
        image: gcumIcon,
        marker: gcumMarker,
        markerLarge: gcumMarker,
    },
    interrupt: {
        description: 'reportLabels.interruptDescription',
        label: 'reportLabels.interrupt',
        image: interruptIcon,
        marker: interruptMarker,
        markerLarge: interruptMarker,
    },
    misc: {
        description: 'reportLabels.miscDescription',
        label: 'reportLabels.misc',
        image: miscIcon,
        marker: miscMarker,
        markerLarge: miscMarker,
    },
    obstacle: {
        description: 'reportLabels.obstacleDescription',
        label: 'reportLabels.obstacle',
        image: obstacleIcon,
        marker: obstacleMarker,
        markerLarge: obstacleMarker,
    },
    pothole: {
        description: 'reportLabels.potholeDescription',
        label: 'reportLabels.pothole',
        image: potholeIcon,
        marker: potholeMarker,
        markerLarge: potholeMarker,
    },
};
