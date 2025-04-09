var margin = { left: 100, right: 10, top: 10, bottom: 150 },
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var flag = true;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

// X and Y scales
var x = d3.scaleBand()
    .range([0, width])
    .padding(0.2);

var y = d3.scaleLinear()
    .range([height, 0]);

// X axis group
var xAxisGroup = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");

// Y axis group
var yAxisGroup = g.append("g")
    .attr("class", "y axis");

// X Axis Label
g.append("text")
    .attr("class", "x axis-label")
    .attr("x", width / 2)
    .attr("y", height + 140)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Month");

// Y Axis Label
var yLabel = g.append("text")
    .attr("class", "y axis-label")
    .attr("x", -height / 2)
    .attr("y", -60)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Revenue");

// Load data
d3.json("data/revenues.json").then(data => {
    data.forEach(d => {
        d.revenue = +d.revenue;
        d.profit = +d.profit;
    });

    d3.interval(() => {
		var newData = flag ? data : data.slice(1);
		update(newData);
		flag = !flag;
	}, 1000);

	// render inicial
	update(data);
}).catch(err => console.log(err));

function update(data) {
    var value = flag ? "revenue" : "profit";

    x.domain(data.map(d => d.month));
    y.domain([0, d3.max(data, d => d[value])]);

    var xAxisCall = d3.axisBottom(x);
    xAxisGroup.call(xAxisCall)
        .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)");

    var yAxisCall = d3.axisLeft(y)
        .ticks(10)
        .tickFormat(d => "$" + d);
    yAxisGroup.call(yAxisCall);

    var rects = g.selectAll("rect")
        .data(data, d => d.month);

    rects.exit().remove();

    rects
        .attr("x", d => x(d.month))
        .attr("y", d => y(d[value]))
        .attr("width", x.bandwidth)
        .attr("height", d => height - y(d[value]));

    rects.enter().append("rect")
        .attr("x", d => x(d.month))
        .attr("y", d => y(d[value]))
        .attr("width", x.bandwidth)
        .attr("height", d => height - y(d[value]))
        .attr("fill", "yellow");

    var label = flag ? "Revenue" : "Profit";
    yLabel.text(label);
}

