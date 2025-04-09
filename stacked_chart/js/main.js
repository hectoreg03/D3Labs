/*
*    main.js
*/

var margin = {top: 20, right: 300, bottom: 30, left: 50},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Time parser for x-scale
var parseDate = d3.timeParse('%Y');
var formatSi = d3.format(".3s");
var formatNumber = d3.format(".1f"),
    formatBillion = (x) => { return formatNumber(x / 1e9); };

// Scales
var x = d3.scaleTime().rangeRound([0, width]);
var y = d3.scaleLinear().rangeRound([height, 0]);
var color = d3.scaleOrdinal(d3.schemeSpectral[11]);

// Axis generators
var xAxisCall = d3.axisBottom();
var yAxisCall = d3.axisLeft().tickFormat(formatBillion);

// Axis groups
var xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");
var yAxis = g.append("g")
    .attr("class", "y axis");

// Y-Axis label
yAxis.append("text")
    .attr("class", "axis-title")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Billions of liters");

// Legend group
var legend = g.append("g")
    .attr("transform", "translate(" + (width + 150) + "," + (height - 210) + ")");

d3.csv('data/stacked_area2.csv').then((data) => {

    // Get the keys (columns), excluding the first one ("date")
    var keys = d3.keys(data[0]).filter((key) => key !== 'date');
    color.domain(keys);

    // Parse the date and convert numeric values
    data.forEach((d) => {
        d.date = parseDate(d.date);
        keys.forEach((k) => {
            d[k] = +d[k];
        });
    });

    // Calculate max sum value across all categories per date
    var maxDateVal = d3.max(data, (d) => {
        return d3.sum(keys.map((key) => d[key]));
    });

    // Set domain for scales
    x.domain(d3.extent(data, (d) => d.date));
    y.domain([0, maxDateVal]);

    // Axis call
    xAxis.call(xAxisCall.scale(x));
    yAxis.call(yAxisCall.scale(y));

    // Stack generator
    var stack = d3.stack()
        .keys(keys)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    var stackedData = stack(data);

    // Area generator
    var area = d3.area()
        .x((d) => x(d.data.date))
        .y0((d) => y(d[0]))
        .y1((d) => y(d[1]));

    // Draw the areas
    g.selectAll(".area")
        .data(stackedData)
        .enter().append("path")
        .attr("class", "area")
        .attr("d", area)
        .style("fill", (d) => color(d.key));

    // Add legend
    var legendRow = legend.selectAll(".legend-row")
        .data(keys)
        .enter().append("g")
        .attr("class", "legend-row")
        .attr("transform", (d, i) => "translate(0," + (i * 20) + ")");

    legendRow.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", color);

    legendRow.append("text")
        .attr("x", -10)
        .attr("y", 10)
        .attr("text-anchor", "end")
        .style("text-transform", "capitalize")
        .text((d) => d);

}).catch((error) => {
    console.log(error);
});
