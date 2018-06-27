Cyclassist
==========

> Track and share issues (work, interruption in routes, parked cars) in
> realtime on bike lanes!

This app is made of two parts: a client webapp and a server part to store and
serve the issues.

## Client part

### Build setup

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

### Useful environment variables

You can pass a few environment variables to the `yarn build|dev` commands to
adapt the behavior to your needs.

* `PUBLIC_PATH=https://.../foobar` to serve the app from a subdirectory.
* `API_BASE_URL=https://...` to specify the location of the server (defaults
    to `/`). The value should end with a trailing slash.
* `TILE_SERVER=` to pass a specific tile server to use rather than the default
    one.


## Server part

### Build setup

``` bash
# Install Python dependencies
pip install -r requirements.txt

# Start the server
python -m server
```

It is better to use a dedicated `virtualenv` if you can :)

### Useful environment variables

You can pass a few environment variables to the `python -m server` command to
adapt its behavior:

* `HOST=` to specify the host to listen to (defaults to `127.0.0.1` which
    means `localhost` only).
* `PORT=` to specify the port to listen on (defaults to `8081`).
* `DATABASE=` to specify a [database URL](http://docs.peewee-orm.com/en/latest/peewee/playhouse.html#db-url) to connect to (defaults to
    `sqlite:///reports.db` which means a SQLite database named `reports.db` in
    the current working directory).

### Serving

You can use the `wsgi.py` script at the root of the git repository to serve
the server side part.


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
