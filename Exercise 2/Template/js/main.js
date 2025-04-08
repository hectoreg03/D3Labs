var svg = d3.select("#chart-area")
  .append("svg")
    .attr("width", 400)
    .attr("height", 400);

var data = [25, 20, 15, 10, 5];

svg.selectAll("rect")
  .data(data)
  .enter()
  .append("rect")
    .attr("x", (d, i) => i * 50)      
    .attr("y", d => 400 - d)          
    .attr("width", 40)
    .attr("height", d => d)
    .attr("fill", "steelblue");