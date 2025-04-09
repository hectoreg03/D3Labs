/*
*    Adapted from Mike Bostock at bl.ocks.org
*    https://bl.ocks.org/mbostock/5682158
*/

var margin = {top: 20, right: 300, bottom: 30, left: 50},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom,
    radius = Math.min(width, height) / 2;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var g = svg.append("g")
    .attr("transform", 
        "translate(" + width / 2 + "," + height / 2 + ")");

var color = d3.scaleOrdinal(d3.schemeCategory10);

// Arc generator for the donut chart
var arc = d3.arc()
    .innerRadius(radius - 100) // Inner radius for the donut hole
    .outerRadius(radius);

// Pie layout generator
var pie = d3.pie()
    .value((d) => d.count) // Use the 'count' for pie slices
    .sort(null); // Don't sort the slices, they will be ordered by data

d3.tsv("data/donut2.tsv").then((data) => {
    // Transform data: lowercase the fruit and parse the count as a number
    data.forEach((d) => {
        d.fruit = d.fruit.toLowerCase();
        d.count = +d.count;
    });

    // Create a nest function to group the data by fruits (regionsByFruit)
    var regionsByFruit = d3.nest()
        .key((d) => d.fruit)  // Group by fruit type
        .entries(data);

    // Create radio buttons for each fruit
    var label = d3.select("form").selectAll("label")
        .data(regionsByFruit)
        .enter().append("label");

    // Dynamically add radio buttons to select the fruit
    label.append("input")
        .attr("type", "radio")
        .attr("name", "fruit")
        .attr("value", (d) => d.key)
        .on("change", update)
        .filter((d, i) => !i)  // Select the first radio button by default
        .each(update)
        .property("checked", true);

    label.append("span")
        .attr("fill", "red")
        .text((d) => d.key);

}).catch((error) => {
    console.log(error);
});

function update(region) {
    var path = g.selectAll("path");

    var data0 = path.data(),
        data1 = pie(region.values);

    // JOIN elements with new data.
    path = path.data(data1, key);

    // EXIT old elements from the screen.
    path.exit()
        .datum((d, i) => findNeighborArc(i, data1, data0, key) || d)
        .transition()
        .duration(750)
        .attrTween("d", arcTween)
        .remove();

    // UPDATE elements still on the screen.
    path.transition()
        .duration(750)
        .attrTween("d", arcTween);

    // ENTER new elements in the array.
    path.enter()
        .append("path")
        .each((d, i) => { 
            this._current = findNeighborArc(i, data0, data1, key) || d; 
        })
        .attr("fill", (d) => color(d.data.region))
        .transition()
        .duration(750)
        .attrTween("d", arcTween);
}

function key(d) {
    return d.data.region;
}

function findNeighborArc(i, data0, data1, key) {
    var d;
    return (d = findPreceding(i, data0, data1, key)) ? {startAngle: d.endAngle, endAngle: d.endAngle}
        : (d = findFollowing(i, data0, data1, key)) ? {startAngle: d.startAngle, endAngle: d.startAngle}
        : null;
}

// Find the element in data0 that joins the highest preceding element in data1.
function findPreceding(i, data0, data1, key) {
    var m = data0.length;
    while (--i >= 0) {
        var k = key(data1[i]);
        for (var j = 0; j < m; ++j) {
            if (key(data0[j]) === k) return data0[j];
        }
    }
}

// Find the element in data0 that joins the lowest following element in data1.
function findFollowing(i, data0, data1, key) {
    var n = data1.length, m = data0.length;
    while (++i < n) {
        var k = key(data1[i]);
        for (var j = 0; j < m; ++j) {
            if (key(data0[j]) === k) return data0[j];
        }
    }
}

function arcTween(d) {
    var i = d3.interpolate(this._current, d);
    this._current = i(1);
    return (t) => { return arc(i(t)); };
}
