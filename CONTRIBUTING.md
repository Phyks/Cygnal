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
[Framagit](https://framagit.org/phyks/cyclassist).

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


## Useful scripts for dev

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
