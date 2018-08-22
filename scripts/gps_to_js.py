import json
import os
import sys

import gpxpy

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit('Usage: %s GPX_FILE' % sys.argv[0])

    with open (sys.argv[1], 'r') as fh:
        gpx = gpxpy.parse(fh)

    json_out = []
    for track in gpx.tracks:
        for segment in track.segments:
            for point in segment.points:
                # TODO: Other fields
                json_out.append({
                    'time': point.time.isoformat(),
                    'coords': {
                        'accuracy': point.horizontal_dilution,
                        'altitudeAccuracy': point.vertical_dilution,
                        'heading': None,
                        'latitude': point.latitude,
                        'longitude': point.longitude
                    }
                })
            break
        break

    script_dir = os.path.dirname(os.path.realpath(__file__))
    with open(os.path.join(script_dir, '../src/tools/mock_gpx.json'), 'w') as fh:
        json.dump(json_out, fh)
