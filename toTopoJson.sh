#!/usr/bin/env bash

ogr2ogr -f GeoJSON countySwe.json ./SWE_adm_shp/SWE_adm2.shp
geo2topo countySwe.json > countySweTopo.json