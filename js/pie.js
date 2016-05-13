// reference: https://bl.ocks.org/mbostock/3887235
// reference: http://jsfiddle.net/8huvuoj9/1/

var margin = {top: 80, right: 20, bottom: 80, left: 40},
		animationLength = 10;
		width = 960 - margin.left - margin.right,
		height = 600 - margin.top - margin.bottom,
		radius = Math.min(width, height) / 2 - animationLength;
// color pallette
var color = d3.scale.category20();
// svg arc shape generator
var arc = d3.svg.arc()
		.outerRadius(radius - animationLength)
		.innerRadius(100);
// final shape for the hover over shape
var arcOver = d3.svg.arc()
		.outerRadius(radius + animationLength)
		.innerRadius(100);
// where labels are placed
var labelArc = d3.svg.arc()
		.outerRadius(radius + animationLength)
		.innerRadius(radius);
// creates array of objects with start/end angles to pass shape generator
var pie = d3.layout.pie()
		.sort(null)
		.value(function(d) { return d.values; });
// svg canvas --- tried responsiveness but didnt quite work
var svg = d3.select("#container").append("svg")
		.attr("width", "100%")
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + width / 2 + "," + 380 +  ")"); //hardcoded to allow the labels to fit
//function to place labels based on their 
var getAngle = function (d) {
		return (180 / Math.PI * (d.startAngle + d.endAngle) / 2 - 90);
};

var pos = d3.svg.arc().innerRadius(radius).outerRadius(radius); //hardcoded for the labels
//load data and the invoke callback
d3.csv("data/mini-complaints.csv", function(csv_data){
	var total = 0;
	var nested_data = d3.nest()
		.key(function(d) {return d.Product;})
		.rollup(function(leaves){
			total = total + leaves.length;
			return leaves.length;
		})
		.entries(csv_data);
		var g = svg.selectAll(".arc")
			.data(pie(nested_data))
			.enter().append("g")
			.attr("class", "arc"); //group to translate so that the labels will fit

		g.append("path") //generate arcs with event listeners
				.attr("d", arc) //d property assigned by the shape generator
				.style("fill", function(d) { return color(d.data.key); })
				.on("click", function(d) {
						console.log("click: " + d.data.key);
						window.location.href = "./index.html?product=" + d.data.key; //click off to table
				})
				.on("mouseenter", function(d) {
						console.log(d.data.key);
						d3.select(this)
							.style("cursor", "pointer")
							.attr("stroke","white")
							.transition()
							.duration(1000)
							.attr("d", arcOver); //transition to arcOver path
				})
				.on("mouseleave", function(d) {
						console.log("exit");
						d3.select(this).transition()
							.attr("d", arc); //transition back to arc original path shape
				});

		g.append("text")
				.attr("transform", function(d) {
						return "translate(" + pos.centroid(d) + ") " +
											"rotate(" + getAngle(d) + ")"; })
				.attr("dy", ".15em")
				.classed("label", true)
				.style("text-anchor", "start")
				// .attr("visibility", "hidden")
				.text(function(d){ return d.data.key}); //text-anchor so that svg text begins at point radius + 10
});
