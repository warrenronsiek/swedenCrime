/**
 * Created by warren on 3/13/17.
 */
import D3wrap from 'react-d3-wrap';
import React, {Component} from 'react';
import {geoConicEqualArea} from 'd3-geo';
import * as topojson from 'topojson';
import * as d3 from 'd3';
const _ = require('lodash');
const sweTopo = require('../static/simpSweTopo.json');
const sweCrime = require('../static/crimeByRegion.json');
import SweButton from './infoButtons/SwedenCrimeButton';
require('../css/slider.css');
const moment = require('moment');

const
  crimeArray = _.flatten(_.flatMap(sweCrime, a => a).map(o => Object.keys(o).map(i => o[i]))),
  crimeDates = Object.keys(sweCrime).map(d => moment(d));
const
  maxCrime = _.max(crimeArray),
  minCrime = _.min(crimeArray),
  minDate = _.min(crimeDates),
  maxDate = _.max(crimeDates);

const SWCrimeWrap = D3wrap({
  initialize(svg, data, options) {
    const
      width = svg.width.animVal.value,
      height = svg.height.animVal.value,
      crimeData = options.crimeData,
      d3svg = d3.select(svg);
    const g = d3svg.append("g");

    const projection = geoConicEqualArea()
      .scale(2800)
      .translate([width / 2 - 400, height / 2 + 1500]);
    const path = d3.geoPath().projection(projection);

    const color = d3.scaleTime().range(['#f7fbff', '#08306b']).domain([minCrime, maxCrime]);

    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    const drawWorld = function (world) {
      g.selectAll('path')
        .data(topojson.feature(world, world.objects.countySwe).features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("id", d => d.properties['NAME_2'])
        .each((d) => d.date = '2013-01')
        .attr("fill", (d) => {
          return color(d.crime = crimeData['2013-01-01'][d.properties['NAME_2']])
        })
        .on('mouseover', d => {
          d3.select("path#" + d.properties['NAME_2']).transition().attr('stroke', 'black').attr('stroke-width', '1px');
          tooltip
            .style('opacity', .9);
          tooltip
            .html(d.properties['NAME_2'] + "<br/>" + "crime/pop: " + d.crime +"<br/>"+ "date: " + d.date)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY + 20) + "px");
        })
        .on("mouseout", function(d) {
          d3.select("path#" + d.properties['NAME_2']).transition().attr('stroke', 'black').attr('stroke-width', '0px');
          tooltip
            .style("opacity", 0);
        });
    }(data);



    d3svg
      .call(d3.zoom()
        .scaleExtent([1 / 2, 10])
        .on("zoom", zoomed));

    function zoomed() {
      g.attr("transform", d3.event.transform);
    }
  },

  update(svg, data, options) {
    const width = svg.width.animVal.value, height = svg.height.animVal.value;
    const d3svg = d3.select(svg);
    const crimeData = options.crimeData;
    const color = d3.scaleLinear().range(['#f7fbff', '#08306b']).domain([minCrime, maxCrime]);

    let x = d3.scaleTime()
      .domain([new Date(minDate), new Date(maxDate)])
      .range([0, width * .6])
      .clamp(true);

    const slider = d3svg.append('g')
      .attr('class', 'slider')
      .attr('transform', 'translate(' + width * .2 + ',' + height * .9 + ')');

    slider.append("line")
      .attr("class", "track")
      .attr("x1", x.range()[0])
      .attr("x2", x.range()[1])
      .select(function () {
        return this.parentNode.appendChild(this.cloneNode(true));
      })
      .attr("class", "track-inset")
      .select(function () {
        return this.parentNode.appendChild(this.cloneNode(true));
      })
      .attr("class", "track-overlay")
      .call(d3.drag()
        .on("start.interrupt", () => slider.interrupt())
        .on("start drag", () => setDate(x.invert(d3.event.x))));

    slider.insert("g", ".track-overlay")
      .attr("class", "ticks")
      .attr("transform", "translate(0," + 18 + ")")
      .selectAll("text")
      .data(x.ticks(8))
      .enter().append("text")
      .attr("x", x)
      .attr("text-anchor", "middle")
      .text(d => d.getFullYear() + '-' + (parseInt(d.getMonth()) + 1));

    const handle = slider.insert("circle", ".track-overlay")
      .attr("class", "handle")
      .attr("r", 9);

    function setDate(date) {
      let roundedDate = moment(date).utc().format('YYYY-MM') + '-01';
      handle.attr('cx', x(Date.parse(roundedDate)));
      d3.selectAll('path')
        .filter(d => d.type == "Feature")
        .each(d => d.date = roundedDate.slice(0,7))
        .attr('fill', d => color(d.crime =crimeData[roundedDate][d.properties.NAME_2]))
    }
  }
});

export default class SwedenCrime extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <SWCrimeWrap
          data={sweTopo}
          width={document.documentElement.clientWidth - 250}
          height={document.documentElement.clientHeight - 150}
          options={{crimeData: sweCrime}}
        />
        <SweButton/>
      </div>
    )
  }
}
