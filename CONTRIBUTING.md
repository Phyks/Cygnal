Contributing
============

These are some infos which might be useful before contributing.

## TL;DR

We have a (rather standard) [code of conduct](CODE_OF_CONDUCT.md), please make
sure to review it prior to contributing.

The main language for working on this project is English. French is fine as
well, if you are more comfortable speaking French.

* Branch off `master`.
* One feature per commit.
* In case of changes request, amend your commit.

New issues and merge requests are better at
[Framagit](https://framagit.org/phyks/cyclassist). If this is a blocking issue
for you, you can contribute through Github as well.

You can contribute in many ways to Cycl'Assist, be it development,
translations or simply communicating around about this webapp!

There is also an ongoing issue concerning the general UX and design of the
webapp. If you have any knowledge on these subjects and want to help, feel
free to comment [this issue](https://framagit.org/phyks/cyclassist/issues/42)
(in French or in English).


## Development setup

The quickest way to get started is to simply run

```
API_BASE_URL=http://127.0.0.1:8081/ yarn dev
```

to spawn the client-side webapp, listening on `localhost:8080` and

```
python -m server
```

to spawn the server-side part, listening on `localhost:8081`.

You might want to have a look at [`doc/0.hosting.md`](doc/0.hosting.md) for
extra information on the available configuration options and general guidance
with hosting the software.


## Adding new opendata sources

A few opendata files are already imported in Cycl'Assist. All the scripts to
fetch and import them are located under the `scripts/opendata` folder.

If you find any other opendata file which is not already imported and would be
worth having in Cycl'Assist, please feel free to edit the scripts under
`scripts/opendata` and create a merge request!


## Useful tips for contributors

### Mocking locations

A useful tool for dev on Cycl'Assist is the ability to mock location (instead
of using the location provided by your GPS or manual position). This is
possible by editing the values `src/constants.js` file. You can either
generate random positions in a bounding box or rely on a GPX file.

To mock position using a GPX file, there is one extra required step. You
should run `scripts/gps_to_gpx.py <GPX_FILE>` to create a file at
`src/tools/mock_gpx.json` which will be used as a mocking source
for the position data (provided the settings in `src/constants.js` require
mocking position using a GPX trace).


### _A la carte_ component

We are using [_A la carte_](https://vuetifyjs.com/en/guides/a-la-carte)
Vuetify components to reduce the size of the build.

If you then require new Vuetify components, check that they are indeed
included in the `src/vuetify.js` file. The `yarn list-vuetify-components`
command might be useful to help you determine which components are used across
the code.


### Unittests

Unittests are written in `.spec.js` files placed next to the tested JS module.


## Translating

Translation is done directly on [Zanata](https://translate.zanata.org/iteration/view/cyclassist/master?dswid=7345).

To add new strings to localize, edit the `src/i18n/en.json` file with your new
strings (and only this file). English locale should be considered as the
reference locale and new strings should always be added there.

Then, you can run `yarn push-locales` to send the updated locales to translate
to the Zanata server.

Once the strings have been translated at Zanata, you can run `yarn
pull-locales` to fetch the translated files.

_Note :_ To use these scripts you will need the Translate-toolkit(`pip install
translate-toolkit`) and the [Zanata Python CLI
client](https://github.com/zanata/zanata-python-client).
