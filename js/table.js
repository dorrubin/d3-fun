var getUrlParameter = function getUrlParameter(sParam) {
		var sPageURL = decodeURIComponent(window.location.search.substring(1)),
				sURLVariables = sPageURL.split('&'),
				sParameterName,
				i;

		for (i = 0; i < sURLVariables.length; i++) {
				sParameterName = sURLVariables[i].split('=');

				if (sParameterName[0] === sParam) {
						return sParameterName[1] === undefined ? true : sParameterName[1];
				}
		}
};

var product_params = getUrlParameter('product');
var state_params = getUrlParameter('state');

var data = [];
var table = d3.select('#container')
	.append('table')
	.classed('table', true);

	var thead = table.append('thead').append('tr').classed("header", true);

	var tbody = table.append('tbody');

	var reload = function() {
		d3.csv("data/mini-complaints.csv", function(rows) {
			data = rows;
			redraw();
		});
	};

	var redraw = function() {
		thead.selectAll("th")
			.data(d3.map(data[0]).keys().slice(0,9))
			.enter()
			.append("th")
			.text(function(d) { return d; });

		var rows = tbody.selectAll("tr")
			.data(data);

		rows.enter().append("tr");
		rows.classed("results-row", true);
		rows.exit().remove();

		var cells = rows.selectAll("td")
			.data(function(row) { return d3.map(row).values().slice(0,9); });
		
		cells.enter().append("td");
		cells.text(function(d) {

			return d;
		});
		$("#search").trigger("click");
	};

	reload();




$(document).ready(function(){
	$("#product-filter").val(product_params);
	$( "#state-filter" ).val( state_params);
	$('#search').on("click", function() {
			var $rows = $('.results-row');
			var product = $('#product-filter').val();
			var state = $('#state-filter').val();
			var startDate = $('#start-time').val();
			var endDate = $('#end-time').val();
			var combined =  product + " " + state + " " + startDate + " " + endDate;
			console.log(combined);
			
			var val1 = $.trim(product).replace(/ +/g, ' ');
			var val2 = $.trim(state).replace(/ +/g, ' ');


			
			$rows.show().filter(function() {
					var row = $(this).text();
					var statecol = $(this).text().slice(-2);
					var datecol = $(this).children().first().text();
					// console.log(datecol);	
					var bool1 = false; //false if in
					var bool2 = false;
					var bool3 = false;
					if(product !== "")
					{
						bool1 = !~(row.indexOf(val1));
					}

					if(state !== "")
					{
						bool2 = state == statecol ? false : true;
					}
					
					if(startDate !== "" && endDate !== "")
					{
						bool3 = !moment(new Date(datecol)).isBetween(new Date(startDate), new Date(endDate), null, []);
					}
					else if(startDate !== "")
					{
						bool3 = !moment(new Date(startDate)).isBefore(new Date(datecol));
					}
					else if(endDate !== "")
					{
						bool3 = !moment(new Date(endDate)).isAfter(new Date(datecol));
					}

					// console.log(bool1);
					console.log("row index " + bool1);
					console.log("state match " + bool2);
					console.log("date match " + bool3);

					return (bool1 || bool2 || bool3); //only returns when all 3 are false
			}).hide();

	});
});
