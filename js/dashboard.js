var something;

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

var data = [];
// loading in complaints
var reload = function(productFilter, stateFilter) {
	d3.csv("data/mini-complaints.csv", function(csv_complaint) {
		if(productFilter)
		{
			csv_complaint = csv_complaint.filter(function(d) {
				return d.Product.includes(productFilter);
			});
		}
		if(stateFilter)
		{
			csv_complaint = csv_complaint.filter(function(d) {
				return d.State == stateFilter;
			});
		}		
		var complaint_data = d3.nest()
			.key(function(d) {return d.State;})
			.rollup(function(leaves){
				return leaves.length;
			})
			.entries(csv_complaint);
			data = complaint_data;
			redraw();
	});
};

var redraw = function() {
	x.domain(data.map(function(d) { return d.key; }));
	y.domain([0, d3.max(data, function(d) { return d.values; })]); //start at 0 -> max count
	svg.selectAll("g").remove();
	svg.selectAll(".bar").remove();
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

	var bar = svg.selectAll(".bar")
			.filter(function(d){console.log(d); return d.values >2; })
			.data(data)
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
	

};

reload();

	d3.select("#search").on("click", filter);
	// sorting function
	function filter() {
		var product = d3.select("#product-filter").property("value");
		var state = d3.select("#state-filter").property("value");
		var startTime = d3.select("#start-time").property("value");
		var endTime = d3.select("#end-time").property("value");
		// something = product;
		console.log(product + " " + state);
		// svg.remove();
		reload(product, state);
	}  //end filter