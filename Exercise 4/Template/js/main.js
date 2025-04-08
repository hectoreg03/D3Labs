// 1. Load the data
d3.json("data/buildings.json").then((data) => {

  // 2. Create SVG canvas
  const svg = d3.select("#chart-area")
    .append("svg")
      .attr("width", 500)
      .attr("height", 500);

  // 3. Create scales

  // X scale - scaleBand for buildings
  const x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, 400])
    .paddingInner(0.3)
    .paddingOuter(0.3);

  // Y scale - linear scale for height
  const y = d3.scaleLinear()
    .domain([0, 828]) // max height (e.g., Burj Khalifa)
    .range([0, 400]);

  // Color scale - ordinal using d3.schemeSet3
  const color = d3.scaleOrdinal()
    .domain(data.map(d => d.name))
    .range(d3.schemeSet3);

  // 4. Draw rectangles for each building
  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
      .attr("x", d => x(d.name))
      .attr("y", d => 400 - y(d.height)) // flip the bar vertically
      .attr("width", x.bandwidth())
      .attr("height", d => y(d.height))
      .attr("fill", d => color(d.name));

}).catch((error) => {
  console.log("Error loading the data:", error);
});
