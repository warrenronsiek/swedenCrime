#!/usr/bin/env bash

ogr2ogr -f GeoJSON countySwe.json ./SWE_adm_shp/SWE_adm2.shp
geo2topo countySwe.json > countySweTopo.json
toposimplify -S .2 -F -f countySweTopo.json > simpSweTopo.json