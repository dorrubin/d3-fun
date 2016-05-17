var something;

// ----- TEMPLATE -----
var data_state = [];
var data_product = [];
var data_table = [];
var margin = {top: 20, right: 20, bottom: 30, left: 40},
		width = 480 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

var click_counter = 0;

var comparison = function (a, b) {
	if (a.values < b.values) {
		return 1;
	}
	if (a.values > b.values) {
		return -1;
	}
	// a must be equal to b
	return 0;
};

// ----- BAR ----- 
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
var barGraph = d3.select("#bar-graph").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// ----- PIE -----
var	animationLength = 10;
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

//function to place labels based on their 
var getAngle = function (d) {
		var angle = 180 / Math.PI * (d.startAngle + d.endAngle) / 2 - 90;
		if(Math.abs(angle) < 90) {
			return angle;
		}
		else {
			return angle - 180;
		}
		return (180 / Math.PI * (d.startAngle + d.endAngle) / 2 - 90);
};

var getAnchor = function(d) {
	if((d.endAngle + d.startAngle)/2 >= Math.PI) {
		return "end";
	} 
	else {
		return "start"
	}
}
var pos = d3.svg.arc().innerRadius(radius).outerRadius(radius); //

// creates array of objects with start/end angles to pass shape generator
var pie = d3.layout.pie()
		.sort(null)
		.value(function(d) { return d.values; });
// svg canvas --- tried responsiveness but didnt quite work
var pieChart = d3.select("#pie-chart").append("svg")
		.attr("width", width + 120)
		.attr("height", 700)
		.append("g")
		.attr("transform", "translate(" + 310 + "," + 365 +  ")"); //hardcoded to allow the labels to fit

// ----- TABLE -----
var table = d3.select('#full-table')
	.append('table')
	.classed('table', true);

var thead = table.append('thead').append('tr').classed("header", true);

var tbody = table.append('tbody');

var reorder = function() {
	click_counter++;
	var sortBy = this.textContent;
	data_table.sort(function(a,b) {
	if(click_counter%2 === 0) {
		if (a[sortBy] < b[sortBy]) {
			return 1;
		}
		if (a[sortBy] > b[sortBy]) {
			return -1;
		}
		// a must be equal to b
		return 0;		
	}
	else {
		if (a[sortBy] > b[sortBy]) {
			return 1;
		}
		if (a[sortBy] < b[sortBy]) {
			return -1;
		}
		// a must be equal to b
		return 0;				
	}
	})
	redraw();
};

// loading in complaints
var reload = function(productFilter, stateFilter, startTimeFilter, endTimeFilter) {
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
		if(startTimeFilter)
		{
			csv_complaint = csv_complaint.filter(function(d) {
				return moment(new Date(d["date_received"])).isSameOrAfter(moment(new Date(startTimeFilter)));
			});
		}
		if(endTimeFilter)
		{
			csv_complaint = csv_complaint.filter(function(d) {
				return moment(new Date(d["date_received"])).isSameOrBefore(moment(new Date(endTimeFilter)));
			});
		}		
		data_table = csv_complaint;
		data_state = d3.nest()
			.key(function(d) {return d.State;})
			.rollup(function(leaves){
				return leaves.length;
			})
			.entries(csv_complaint)
			.sort(comparison);
			// data_state = complaint_data;
		data_product = d3.nest()
			.key(function(d) {return d.Product;})
			.rollup(function(leaves){
				return leaves.length;
			})
			.entries(csv_complaint)
			.sort(comparison);
			redraw();
	});
};

var redraw = function() {
	// BAR GRAPH
	x.domain(data_state.map(function(d) { return d.key; }));
	y.domain([0, d3.max(data_state, function(d) { return d.values; })]); //start at 0 -> max count
	barGraph.selectAll("g").remove();
	barGraph.selectAll(".bar").remove();
	barGraph.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

	barGraph.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Count");

	var bar = barGraph.selectAll(".bar")
			.filter(function(d){console.log(d); return d.values >2; })
			.data(data_state)
			.enter()
				.append("rect")
				.attr("class", "bar")
				.on("mouseenter", function(d) {
							d3.select(this)
								.style("cursor", "pointer");
					})
				.on("click", function(d) {
						console.log("click: " + d.key);
						d3.select("#state-filter").property("value", d.key);
						filter();
					})
				.attr("x", function(d) { return x(d.key); })
				.attr("width", x.rangeBand())
				.attr("y", function(d) { return y(d.values); })
				.attr("height", function(d) { return height - y(d.values); });
	
	// PIE CHART
	pieChart.selectAll(".arc").remove();
	pieChart.selectAll(".label").remove();
	var g = pieChart.selectAll(".arc")
		.data(pie(data_product))
		.enter().append("g")
		.attr("class", "arc"); //group to translate so that the labels will fit
	
	g.append("path") //generate arcs with event listeners
			.attr("d", arc) //d property assigned by the shape generator
			.style("fill", function(d) { return color(d.data.key); })
			.on("click", function(d) {
					console.log("click: " + d.data.key);
					d3.select("#product-filter").attr("value", d.data.key);
					filter();
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
					d3.select(this).transition()
						.attr("d", arc); //transition back to arc original path shape
			});

	g.append("text")
			.attr("transform", function(d) {
					return "translate(" + pos.centroid(d) + ") " +
										"rotate(" + getAngle(d) + ")"; })
			.attr("dy", ".15em")
			.classed("label", true)
			// .style("text-anchor", "start")
			.style("text-anchor", function(d) {
				return getAnchor(d);
			})
			// .attr("visibility", "hidden")
			.text(function(d){ return d.data.key}); //text-anchor so that svg text begins at point radius + 10

	// TABLE
		thead.selectAll("th")
			.data(d3.map(data_table[0]).keys().slice(0,9))
			.enter()
			.append("th")
			.on("click", reorder)
			.text(function(d) { return d; });

		var rows = tbody.selectAll("tr")
			.data(data_table);

		rows.enter().append("tr");
		rows.classed("results-row", true);
		rows.exit().remove();

		var cells = rows.selectAll("td")
			.data(function(row) { return d3.map(row).values().slice(0,9); });
		
		cells.enter().append("td");
		cells.text(function(d) {

			return d;
		});
};

reload();

	d3.select("#search").on("click", filter);
	// sorting function
	function filter() {
		var product = d3.select("#product-filter").property("value");
		var state = d3.select("#state-filter").property("value");
		var startTime = d3.select("#start-time").property("value");
		var endTime = d3.select("#end-time").property("value");
		// console.log(product + " " + state);
		// barGraph.remove();
		reload(product, state, startTime, endTime);
	}  //end filter