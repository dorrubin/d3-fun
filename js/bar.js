// reference: http://bl.ocks.org/mbostock/3885705

var margin = {top: 20, right: 20, bottom: 30, left: 40},
		width = 960 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;
 
var numberFormat = d3.format("d");
//rangeRoundBands to include padding
var x = d3.scale.ordinal()
		.rangeRoundBands([0, width], 0.1, 1);

var y = d3.scale.linear()
		.range([height, 0]);
// create x axis
var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");
// create y axis
var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.tickFormat(numberFormat);
// create canvas
var svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
// loading in both complaints and data poopulation but only using complaints at the moment
d3.csv("data/mini-complaints.csv", function(csv_complaint) {
	d3.csv("data/population.csv", function(csv_pop) {
		var complaint_data = d3.nest()
			.key(function(d) {return d.State;})
			.rollup(function(leaves){
				return leaves.length;
			})
			.entries(csv_complaint);

		//Per Capita Calculation-- WIP 
		// var population_data = d3.nest()
		// 	.key(function(d) {return d.State;})
		// 	.entries(csv_pop);
		//range of data coming in
		x.domain(complaint_data.map(function(d) { return d.key; }));
		y.domain([0, d3.max(complaint_data, function(d) { return d.values; })]); //start at 0 -> max count

		svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis);

		svg.append("g")
				.attr("class", "y axis")
				.call(yAxis)
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.text("Count");

		svg.selectAll(".bar")
				.data(complaint_data)
				.enter()
					.append("rect")
					.attr("class", "bar")
					.on("mouseenter", function(d) {
								d3.select(this)
									.style("cursor", "pointer");
						})
					.on("click", function(d) {
							console.log("click: " + d.key);
							window.location.href = "./index.html?state=" + d.key;
						})
					.attr("x", function(d) { return x(d.key); })
					.attr("width", x.rangeBand())
					.attr("y", function(d) { return y(d.values); })
					.attr("height", function(d) { return height - y(d.values); });

		d3.select("input").on("change", change);
		// sorting function
		function change() {
			// Copy-on-write since tweens are evaluated after a delay.
			var x0 = x.domain(complaint_data.sort(this.checked ?
					function(a, b) { return b.values - a.values; }
					: function(a, b) { return d3.ascending(a.key, b.key); })
					.map(function(d) { return d.key; }))
					.copy();

			svg.selectAll(".bar")
					.sort(function(a, b) { return x0(a.key) - x0(b.key); });
			// declare both the transition and delay
			var transition = svg.transition().duration(750);
			var	delay = function(d, i) { return i * 50; };

			transition.selectAll(".bar")
					.delay(delay)
					.attr("x", function(d) { return x0(d.key); });
			//call(xAxis) calls 
			transition.select(".x.axis")
					.call(xAxis)
					.selectAll("g")
					.delay(delay);
		}  //end change
	});
});