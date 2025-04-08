const margin = { top: 10, right: 10, bottom: 100, left: 100 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const svg = d3.select("#chart-area")
  .append("svg")
    .attr("width", 600)
    .attr("height", 400);

const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.json("data/buildings.json").then((data) => {
  data.forEach(d => {
    d.height = +d.height;
  });

  const x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, width])
    .paddingInner(0.3)
    .paddingOuter(0.3);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.height)])
    .range([height, 0]);

  const color = d3.scaleOrdinal()
    .domain(data.map(d => d.name))
    .range(d3.schemeSet3);

  const rects = g.selectAll("rect")
    .data(data);

  rects.enter()
    .append("rect")
      .attr("x", d => x(d.name))
      .attr("y", d => y(d.height)) // shift down
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.height)) // compute height
      .attr("fill", d => color(d.name));

  const xAxisCall = d3.axisBottom(x);
  g.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxisCall)
    .selectAll("text")
      .attr("x", -5)
      .attr("y", 10)
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-40)");

  // Create and render the left axis (5 ticks, formatted)
  const yAxisCall = d3.axisLeft(y)
    .ticks(5)
    .tickFormat(d => `${d}m`);
  g.append("g")
    .attr("class", "y axis")
    .call(yAxisCall);

  // X-axis label
  g.append("text")
    .attr("class", "x axis-label")
    .attr("x", width / 2)
    .attr("y", height + 140)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("The World's Tallest Buildings");

  g.append("text")
    .attr("class", "y axis-label")
    .attr("x", -height / 2)
    .attr("y", -60)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Height (m)");

}).catch(error => {
  console.error("Error loading the data:", error);
});
