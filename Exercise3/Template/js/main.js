
d3.json("data/ages.json").then((data) => {
  
  data.forEach((d) => {
    d.age = +d.age;
  });

  console.log(data);
  var svg = d3.select("#chart-area")
    .append("svg")
      .attr("width", 400)
      .attr("height", 400);

  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", (d, i) => (i * 50) + 25) // position in x
      .attr("cy", 200)                     // center vertically
      .attr("r", d => d.age * 2)           // size by age
      .attr("fill", d => d.age > 10 ? "orange" : "steelblue"); // color

}).catch((error) => {
  console.log("Error loading the data:", error);
});

d3.csv("data/ages.csv").then((data) => {
  console.log("CSV Data:", data);
});

d3.tsv("data/ages.tsv").then((data) => {
  console.log("TSV Data:", data);
});
