// Dimensions
const margin = { top: 50, right: 50, bottom: 100, left: 100 };
const width = 900 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Create SVG
const svg = d3.select("#chart-area")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Scales
const x = d3.scaleLog()
  .base(10)
  .domain([142, 150000])
  .range([0, width]);

const y = d3.scaleLinear()
  .domain([0, 90])
  .range([height, 0]);

const area = d3.scaleLinear()
  .domain([2000, 1400000000])
  .range([25 * Math.PI, 1500 * Math.PI]);

const continentColor = d3.scaleOrdinal(d3.schemePastel1);

// Axes
const xAxisCall = d3.axisBottom(x)
  .tickValues([400, 4000, 40000])
  .tickFormat(d => `$${d}`);

svg.append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0, ${height})`)
  .call(xAxisCall);

svg.append("g")
  .attr("class", "y axis")
  .call(d3.axisLeft(y));

// Axis labels
svg.append("text")
  .attr("y", height + 50)
  .attr("x", width / 2)
  .attr("text-anchor", "middle")
  .attr("font-size", "16px")
  .text("Income per person");

svg.append("text")
  .attr("x", -height / 2)
  .attr("y", -60)
  .attr("transform", "rotate(-90)")
  .attr("text-anchor", "middle")
  .attr("font-size", "16px")
  .text("Life Expectancy");

// Year label
const yearLabel = svg.append("text")
  .attr("x", width - 30)
  .attr("y", height - 10)
  .attr("text-anchor", "end")
  .attr("font-size", "40px")
  .attr("fill", "gray");

// Load and process data
d3.json("data/data.json").then(function(data) {
	
	console.log(data);
  const formattedData = data.map(year => {
    return year.countries.filter(d => d.income && d.life_exp)
      .map(d => ({
        ...d,
        income: +d.income,
        life_exp: +d.life_exp,
        population: +d.population
      }));
  });

  const allContinents = Array.from(
    new Set(formattedData.flat().map(d => d.continent))
  );
  continentColor.domain(allContinents);

  // Legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 150}, 0)`);

  allContinents.forEach((c, i) => {
    legend.append("rect")
      .attr("y", i * 25)
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", continentColor(c));

    legend.append("text")
      .attr("x", 30)
      .attr("y", i * 25 + 15)
      .text(c);
  });

  let yearIndex = 0;

  function update(data, year) {
    const t = d3.transition().duration(800);
    yearLabel.text(year);

    const circles = svg.selectAll("circle")
      .data(data, d => d.country);

    circles.exit()
      .transition(t)
      .attr("r", 0)
      .remove();

    circles.enter().append("circle")
      .attr("fill", d => continentColor(d.continent))
      .attr("cx", d => x(d.income))
      .attr("cy", d => y(d.life_exp))
      .attr("r", 0)
      .merge(circles)
      .transition(t)
      .attr("cx", d => x(d.income))
      .attr("cy", d => y(d.life_exp))
      .attr("r", d => Math.sqrt(area(d.population) / Math.PI));
  }

  // Initial render
  update(formattedData[0], data[0].year);

  // Animation loop
  d3.interval(() => {
    yearIndex = (yearIndex + 1) % formattedData.length;
    update(formattedData[yearIndex], data[yearIndex].year);
  }, 1000);
});
