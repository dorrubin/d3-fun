// reference: https://bl.ocks.org/mbostock/3887235
// reference: http://jsfiddle.net/8huvuoj9/1/

var margin = {top: 20, right: 20, bottom: 30, left: 40},
		animationLength = 10;
		width = 960 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom,
		radius = Math.min(width, height) / 2 - animationLength;

var color = d3.scale.category20();

var arc = d3.svg.arc()
		.outerRadius(radius - animationLength)
		.innerRadius(100);

var arcOver = d3.svg.arc()
		.outerRadius(radius + animationLength)
		.innerRadius(100);

var labelArc = d3.svg.arc()
		.outerRadius(radius + 10)
		.innerRadius(radius);

var pie = d3.layout.pie()
		.sort(null)
		.value(function(d) { return d.values; });

var svg = d3.select("#container").append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var something;

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
			.attr("class", "arc");
		
		// g.append("a")
		// 	.attr("xlink:href", function(d) {return "./index?id=" + d.data.key});

		g.append("path")
				.attr("d", arc)
				.style("fill", function(d) { return color(d.data.key); })
				.on("click", function(d) {
						console.log("click: " + d.data.key);
						window.location.href = "./index.html?product=" + d.data.key;
				})				
				.on("mouseenter", function(d) {
						console.log(d.data.key);
						d3.select(this)
							.attr("stroke","white")
							.transition()
							.duration(1000)
							.attr("d", arcOver);
				})
				.on("mouseleave", function(d) {
						console.log("exit");
						d3.select(this).transition()
							.attr("d", arc);
				});

		g.append("text")
				.attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
				.attr("dy", ".35em")
				.classed("label", true)
				// .attr("visibility", "hidden")
				// .text(function(d){ return d.data.key});
				.text(function(d) {
					if(d.data.values/total > 0.1)
					{
						return (d.data.key); 
					}
					else
						return "";
				});

		product_data = nested_data;
});
