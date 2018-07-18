Cyclassist
==========

> Track and share issues (work, interruption in routes, parked cars) in
> realtime on bike lanes!

This app is made of two parts: a client webapp and a server part to store and
serve the issues. This code is the code running behind https://cyclo.phyks.me/.

As of current version, only the client side part (code running on your local
device) handles your geolocation. **Your precise geolocation is never sent**
to the server or any external resource. However, the map background is
downloaded on demand from [Thunderforest](http://thunderforest.com/) so they
could know the location of the displayed map.

## OpenData

The data collected by https://cyclo.phyks.me/ is available under an
[ODbL](https://opendatacommons.org/licenses/odbl/) license. You can get the
most up to date JSON dump of available reports at https://cyclo.phyks.me/api/v1/reports.

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


### Server part

#### Build setup

``` bash
# Install Python dependencies
pip install -r requirements.txt

# Start the server
python -m server
```

It is better to use a dedicated `virtualenv` if you can :)

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
* [Work icons](https://www.vecteezy.com/vector-art/87351-road-traffic-cartoon-icons-vector)
    were designed by Vecteezy.
* [Trash icon](https://pixabay.com/en/trash-waste-trashcan-garbage-99257/) is
    coming from Pixabay under CC0 license.
* [Accident icon](https://www.flaticon.com/free-icon/car-running-over-a-bicycle_91680) is
    coming from Flaticon.
