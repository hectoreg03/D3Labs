// Set dimensions and margins
const margin = { top: 50, right: 30, bottom: 70, left: 70 };
const width = 800 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;

// Background style
d3.select("#chart-area")
  .style("background-color", "black")
  .style("padding", "20px");

// Create a reusable function to draw one chart
function drawChart(data, key, containerId, barColor) {
  const svg = d3.select(containerId)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const x = d3.scaleBand()
    .domain(data.map(d => d.month))
    .range([0, width])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[key])])
    .nice()
    .range([height, 0]);

  // Axes
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end")
      .style("fill", "white");

  svg.append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("fill", "white");

  // Bars
  svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.month))
      .attr("y", d => y(d[key]))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d[key]))
      .attr("fill", barColor);

  // Y label
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${-50}, ${height / 2}) rotate(-90)`)
    .attr("fill", "white")
    .text("Amount (USD)");

  // Title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .style("font-size", "16px")
    .text(`${key.charAt(0).toUpperCase() + key.slice(1)} per Month`);
}

// Load data
d3.json("data/revenues.json").then(data => {
  data.forEach(d => {
    d.revenue = +d.revenue;
    d.profit = +d.profit;
  });

  // Clear any previous SVGs (optional if refreshing dynamically)
  d3.select("#chart-area").html("");

  // Create containers for both charts
  d3.select("#chart-area")
    .append("div")
    .attr("id", "revenue-chart");

  d3.select("#chart-area")
    .append("div")
    .attr("id", "profit-chart")
    .style("margin-top", "40px");

  drawChart(data, "revenue", "#revenue-chart", "#1f77b4");
  drawChart(data, "profit", "#profit-chart", "#ff7f0e");
});
