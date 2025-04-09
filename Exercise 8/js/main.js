let margin = { left:80, right:20, top:50, bottom:100 },
    height = 500 - margin.top - margin.bottom,
    width = 800 - margin.left - margin.right;

let year = 1800;
let interval;
let isPlaying = false;
let formattedData;
let currentContinent = "all";

// Create SVG
let svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

let g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Scales
let x = d3.scaleLog().base(10).domain([142, 150000]).range([0, width]);
let y = d3.scaleLinear().domain([0, 90]).range([height, 0]);
let area = d3.scaleLinear().domain([2000, 1400000000]).range([25*Math.PI, 1500*Math.PI]);
let continentColor = d3.scaleOrdinal(d3.schemePastel1);

// Axes
let xAxisGroup = g.append("g").attr("transform", `translate(0, ${height})`);
let yAxisGroup = g.append("g");

// Labels
g.append("text").attr("x", width / 2).attr("y", height + 50).attr("text-anchor", "middle").text("Income per person (GDP per capita)");
g.append("text").attr("x", -height/2).attr("y", -60).attr("text-anchor", "middle").attr("transform", "rotate(-90)").text("Life Expectancy");
let timeLabel = g.append("text").attr("x", width - 50).attr("y", height - 10).attr("text-anchor", "middle").attr("font-size", "40px").attr("opacity", "0.4").text(String(year));

// D3 Tip
let tip = d3.tip().attr('class', 'd3-tip').html(d =>
    `<strong>Country:</strong> ${d.country}<br>
     <strong>Continent:</strong> ${d.continent}<br>
     <strong>Income:</strong> $${d3.format(",.0f")(d.income)}<br>
     <strong>Life Expectancy:</strong> ${d3.format(".1f")(d.life_exp)}<br>
     <strong>Population:</strong> ${d3.format(",")(d.population)}`
);
g.call(tip);

// Load data
d3.json("data/data.json").then(data => {
    formattedData = data.map(year => {
        return year.countries
            .filter(d => d.income != null && d.life_exp != null && d.population != null)
            .map(d => ({
                ...d,
                income: +d.income,
                life_exp: +d.life_exp,
                population: +d.population
            }));
    });

    // Get continents for dropdown
    let continents = new Set();
    formattedData.forEach(yearData => {
        yearData.forEach(d => continents.add(d.continent));
    });
    continents.forEach(cont => {
        $("#continent-select").append(`<option value="${cont}">${cont}</option>`);
    });

    update(formattedData[0]);
});

// Axes
let xAxisCall = d3.axisBottom(x)
    .tickValues([400, 4000, 40000])
    .tickFormat(d => "$" + d);
xAxisGroup.call(xAxisCall);

let yAxisCall = d3.axisLeft(y);
yAxisGroup.call(yAxisCall);

// Slider
$("#date-slider").slider({
    min: 1800,
    max: 2020,
    step: 1,
    slide: (event, ui) => {
        year = ui.value;
        $("#year-label").text(year);
        update(formattedData[year - 1800]);
    }
});

// Play button
$("#play-button").on("click", () => {
    if (isPlaying) {
        isPlaying = false;
        clearInterval(interval);
        $("#play-button").text("Play");
    } else {
        isPlaying = true;
        interval = setInterval(step, 1000);
        $("#play-button").text("Pause");
    }
});

// Reset
$("#reset-button").on("click", () => {
    year = 1800;
    $("#date-slider").slider("value", year);
    $("#year-label").text(year);
    update(formattedData[0]);
    if (isPlaying) {
        clearInterval(interval);
        isPlaying = false;
        $("#play-button").text("Play");
    }
});

// Continent filter
$("#continent-select").on("change", function() {
    currentContinent = this.value;
    update(formattedData[year - 1800]);
});

// Auto step
function step() {
    year = year < 2020 ? year + 1 : 1800;
    $("#date-slider").slider("value", year);
    $("#year-label").text(year);
    update(formattedData[year - 1800]);
}

// Update function
function update(data) {
    let t = d3.transition().duration(100);
    let filtered = currentContinent === "all" ? data : data.filter(d => d.continent === currentContinent);

    // Join
    let circles = g.selectAll("circle").data(filtered, d => d.country);

    // Exit
    circles.exit().attr("class", "exit").remove();

    // Enter
    circles.enter().append("circle")
        .attr("fill", d => continentColor(d.continent))
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .merge(circles)
        .transition(t)
        .attr("cx", d => x(d.income))
        .attr("cy", d => y(d.life_exp))
        .attr("r", d => Math.sqrt(area(d.population) / Math.PI));

    timeLabel.text(year);
}
