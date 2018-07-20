#!/bin/bash
for i in po/*.po
do
    j=$(echo $i | cut -d '.' -f 1 | cut -d '/' -f 2)
    po2json -i $i -t src/i18n/en.json --progress none | ./scripts/renest_json.py > po/$j.json
    mv po/$j.json src/i18n/$j.json
done
