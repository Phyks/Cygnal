Cyclassist
==========

> Track and share issues (work, interruption in routes, parked cars) in
> realtime on bike lanes!

This app is made of two parts: a client webapp and a server part to store and
serve the issues. This code is the code running behind https://cyclo.phyks.me/
(the stable and official instance).

**A sandbox instance if you want to try it out without polluting the main instance
is available at https://cyclo-dev.phyks.me**. Please note however this is a
sandbox instance which might be ahead of the official https://cyclo.phyks.me
instance from time to time, so that it might break from time to time.

As of current version, only the client side part (code running on your local
device) handles your geolocation. **Your precise geolocation is never sent**
to the server or any external resource. However, the map background is
downloaded on demand from [Thunderforest](http://thunderforest.com/) so they
could know the location of the displayed map.

<img src="support/screenshots/webapp.jpg" width="45%"/> <img src="support/screenshots/reportDialog.jpg" width="45%"/>

## OpenData

The data collected by https://cyclo.phyks.me/ is available under an
[ODbL](https://opendatacommons.org/licenses/odbl/) license. You can get the
most up to date JSON dump of available reports at
https://cyclo.phyks.me/api/v1/reports.

Statistics about the instance can be fetched at
https://cyclo.phyks.me/api/v1/stats.

## Hosting your own

### Client part

#### Build setup

``` bash
# Install JS dependencies
yarn install

# Serve with hot reload at localhost:8080
yarn dev

# Build for production with minification
yarn build

# Build for production and view the bundle analyzer report
yarn build --report
```

#### Useful environment variables

You can pass a few environment variables to the `yarn build|dev` commands to
adapt the behavior to your needs.

* `PUBLIC_PATH=https://.../foobar` to serve the app from a subdirectory.
* `API_BASE_URL=https://...` to specify the location of the server (defaults
    to `/`). The value should end with a trailing slash.
* `THUNDERFOREST_API_KEY=` to pass an API key server to use for
    [Thunderforest](http://thunderforest.com/) tiles (OpenCycleMap, etc).
* `API_TOKEN=` to pass a token required to access the server side API (check
    below in the server part environment variables for more details).

You should also have a look at the build variables under the `config/`
subdirectory.


#### Geographical extension

While the frontend could theoretically work in the entire world without much
modifications, it is currently written with mainland France in mind, mostly
because that is the territory the authors are most familiar with.
Additionnally, this limits the volume of geographical data (such as OSM
extracts) to handle and makes managing the app easier.

You could of course easily extend it to support other territories. The
French-specific parts of the code so far are:
* The [`AddressInput`](https://framagit.org/phyks/cyclassist/blob/master/src/components/AddressInput.vue) component which uses the [https://adresse.data.gouv.fr/](https://adresse.data.gouv.fr/) API to autocomplete addresses. You could easily replace it with [Algolia Places](https://community.algolia.com/places/) which covers the entire world.


#### Notes

We are using [A la carte](https://vuetifyjs.com/en/guides/a-la-carte) Vuetify
components to reduce the size of the build. Check that any extra components
you might use is indeed included in `src/vuetify.js` file. The `yarn
list-vuetify-components` command might be useful to help you determine which
components are used across the code.


### Server part

#### Build setup

``` bash
# Install Python dependencies
pip install -r requirements.txt

# Start the server
python -m server
```

It is better to use a dedicated `virtualenv` if you can :)

API routes are all listed within `server/routes.py` file, with documentation
strings.

#### Useful environment variables

You can pass a few environment variables to the `python -m server` command to
adapt its behavior:

* `HOST=` to specify the host to listen to (defaults to `127.0.0.1` which
    means `localhost` only).
* `PORT=` to specify the port to listen on (defaults to `8081`).
* `DATABASE=` to specify a [database URL](http://docs.peewee-orm.com/en/latest/peewee/playhouse.html#db-url) to connect to (defaults to
    `sqlite:///reports.db` which means a SQLite database named `reports.db` in
    the current working directory).
* `API_TOKEN=` to specify a token required to `POST` data to the API.

#### Serving in production

You can use the `wsgi.py` script at the root of the git repository to serve
the server side part. You can find some `uwsgi` and `nginx` base config files
under the `support` folder.


## Contributing

The quickest way to get started is to simply run

```
API_BASE_URL=http://127.0.0.1:8081/ yarn dev
```

to spawn the client-side webapp, listening on `localhost:8080` and

```
python -m server
```

to spawn the server-side part, listening on `localhost:8081`.

### Updating

Database migrations are in the `scripts/migrations` folder, labelled by
versions. You should run them in order from your current versions to the
latest one when you upgrade.

### Useful scripts for dev

You can run `scripts/gps_to_gpx.py` on your GPX trace to create a
`src/tools/mock_gpx.json` file ready to be used as a mocking source for the
position data (just edit the `src/constants.js` file accordingly).


## Translating

Translation is done directly on [Zanata](https://translate.zanata.org/iteration/view/cyclassist/master?dswid=7345).

To add new strings to localize, edit the `src/i18n/en.json` file with your new
strings (and only this file). Then, you can run `yarn push-locales` to send
the updated locales to translate and `yarn pull-locales` to fetch the
translated files. To use these scripts you will need the
Translate-toolkit(`pip install translate-toolkit`) and the [Zanata Python CLI
client](https://github.com/zanata/zanata-python-client).


## License

This software is licensed under an MIT license, unless explicitly mentionned
otherwise.

Icons are made from the original works:
* [Bike icon](https://commons.wikimedia.org/wiki/File:Ic_directions_bike_48px.svg)
    licensed under CC BY on Wikimedia.
* [Car icon](https://commons.wikimedia.org/wiki/File:Car_icon_top.svg)
    licensed under CC BY-SA on Wikimedia.
* [Pothole icon](https://commons.wikimedia.org/wiki/File:France_road_sign_A2a.svg)
    licensed under CC BY-SA on Wikimedia.
* [Compass icon](https://commons.wikimedia.org/wiki/File:Black_and_white_compass.svg)
    licensed in public domain on Wikimedia.
* [Work icons](https://www.vecteezy.com/vector-art/87351-road-traffic-cartoon-icons-vector)
    were designed by Vecteezy.
* [Trash icon](https://pixabay.com/en/trash-waste-trashcan-garbage-99257/) is
    coming from Pixabay under CC0 license.
* [Accident icon](https://www.flaticon.com/free-icon/car-running-over-a-bicycle_91680) is
    coming from Flaticon.

Beep sound is provided under CC0 license and coming from
[freesound.org](https://freesound.org/people/thisusernameis/sounds/426888/).

The map background is using tiles from <a
href=\"https://carto.com/location-data-services/basemaps/\">Carto.com</a> or
<a href=\"http://thunderforest.com/\">Thunderforest</a>, thanks to <a
href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap
contributors</a> and <a href=\"http://leafletjs.com/\">Leaflet</a>.

Manual location picking uses the awesome API from <a
href=\"https://adresse.data.gouv.fr\">adresse.data.gouv.fr</a>.
