$data 

var margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = actwidth,
    height = actheight;

d3.select("#maindiv${divnum}").selectAll("svg").remove();
	       
var canvas = d3.select("#maindiv${divnum}")
    .append("svg")
    .attr("width", actwidth)
    .attr("height", actheight)
    .attr('id', 'hd')

//canvas.append('div')
//   .innerhtml("Hallo")


/*
var dataSet1 = [{"legendLabel": "Pb - Cd", "magnitude": 18},
                {"legendLabel": "Pb - Zn", "magnitude": 21},
		{"legendLabel": "Pb - S", "magnitude": 20},
		{"legendLabel": "Cd - Zn", "magnitude": 4},
		{"legendLabel": "Cd - S", "magnitude": 18},
		{"legendLabel": "Zn - S", "magnitude": 14},
		];

*/

function drawHorizontalBarChart(chartID, dataSet, selectString, colors) {
    
    // chartID => A unique drawing identifier that has no spaces, 
    // no "." and no "#" characters.
    // dataSet => Input Data for the chart, itself.
    // selectString => String that allows you to pass in
    //           a D3 select string.
    // colors => String to set color scale.  Values can be...
    //           => "colorScale10"
    //           => "colorScale20"
    //           => "colorScale20b"
    //           => "colorScale20c"
    
    var canvasWidth = actwidth;
    var barsWidthTotal = actheight;
    var barHeight = 20;
    var barsHeightTotal = barHeight * dataSet.length;
    var canvasHeight = barHeight;
    // +10 puts a little space at bottom.
    //var canvasHeight = dataSet.length * barHeight + 10; 
    var legendOffset = barHeight/2;
    var legendBulletOffset = 30;
    var legendTextOffset = 20;
    
    var x = d3.scale.linear().domain([-1, d3.max(dataSet, function(d) { 
	return d.magnitude; })]).rangeRound([-1, barsWidthTotal]);
    var y = d3.scale.linear().domain([0, dataSet.length]).range([0, barsHeightTotal]);
    
    // Color Scale Handling...
    var colorScale = d3.scale.category20c();
    switch (colors)
    {
	case "colorScale10":
	colorScale = d3.scale.category10();
	break;
	case "colorScale20":
	colorScale = d3.scale.category20();
	break;
	case "colorScale20b":
	colorScale = d3.scale.category20b();
	break;
	case "colorScale20c":
	colorScale = d3.scale.category20c();
	break;
	default:
	colorScale = d3.scale.category20c();
    };
    
    var synchronizedMouseOver = function() {
	var bar = d3.select(this);
	var indexValue = bar.attr("index_value");
	
	var barSelector = "." + "bars-" + chartID + "-bar-" + indexValue;
	var selectedBar = d3.selectAll(barSelector);
	selectedBar.style("fill", "Maroon");
	
	var bulletSelector = "." + "bars-" + chartID + "-legendBullet-" + indexValue;
	var selectedLegendBullet = d3.selectAll(bulletSelector);
	selectedLegendBullet.style("fill", "Maroon");
	
	var textSelector = "." + "bars-" + chartID + "-legendText-" + indexValue;
	var selectedLegendText = d3.selectAll(textSelector);
	selectedLegendText.style("fill", "Maroon");
    };
    
    var synchronizedMouseOut = function() {
	var bar = d3.select(this);
	var indexValue = bar.attr("index_value");
	
	var barSelector = "." + "bars-" + chartID + "-bar-" + indexValue;
	var selectedBar = d3.selectAll(barSelector);
	var colorValue = selectedBar.attr("color_value");
	selectedBar.style("fill", colorValue);
	
	var bulletSelector = "." + "bars-" + chartID + "-legendBullet-" + indexValue;
	var selectedLegendBullet = d3.selectAll(bulletSelector);
	var colorValue = selectedLegendBullet.attr("color_value");
	selectedLegendBullet.style("fill", colorValue);
	
	var textSelector = "." + "bars-" + chartID + "-legendText-" + indexValue;
	var selectedLegendText = d3.selectAll(textSelector);
	selectedLegendText.style("fill", "Blue");
    };
    
    // Create the svg drawing canvas...
    //var canvas = d3.select(selectString)
    //	.append("svg:svg")
    //.style("background-color", "#EEE")
    //	.attr("width", canvasWidth)
    //	.attr("height", canvasHeight);
    
    // Draw individual hyper text enabled bars...
    canvas.selectAll("rect")
	.data(dataSet)
	.enter().append("svg:a")
	.attr("xlink:href", function(d) { return d.link; })
	.append("svg:rect")
    // NOTE: the 15 represents an offset to allow for space to place magnitude
    // at end of bars.  May have to address this better, possibly by placing the
    // magnitude within the bars.
    //.attr("x", function(d) { return barsWidthTotal - x(d.magnitude) + 15; }) // Left to right
	.attr("x", 0) // Right to left
	.attr("y", function(d, i) { return y(i); })
	.attr("height", barHeight)
	.on('mouseover', synchronizedMouseOver)
	.on("mouseout", synchronizedMouseOut)
	.style("fill", "White" )
	.style("stroke", "White" )
	.transition()
	.ease("bounce")
        .duration(1500)
        .delay(function(d, i) { return i * 100; })
	.attr("width", function(d) { return x(d.magnitude); })
	.style("fill", function(d, i) { colorVal = colorScale(i); return colorVal; } )
	.attr("index_value", function(d, i) { return "index-" + i; })
	.attr("class", function(d, i) { return "bars-" + chartID + "-bar-index-" + i; })
	.attr("color_value", function(d, i) { return colorScale(i); }) // Bar fill color...
        .style("stroke", "white"); // Bar border color...
    
    // Create text values that go at end of each bar...
    canvas.selectAll("text")
        .data(dataSet) // Bind dataSet to text elements
        .enter().append("svg:text") // Append text elements
        .attr("x", x)
        .attr("y", function(d, i) { return y(i); })
    //.attr("y", function(d) { return y(d) + y.rangeBand() / 2; })
        .attr("dx", function(d) { return x(d.magnitude) - 5; })
        .attr("dy", barHeight-5) // vertical-align: middle
        .attr("text-anchor", "end") // text-align: right
        .text(function(d) { return d.magnitude;})
        .attr("fill", "white");
    
    // Plot the bullet circles...
    canvas.selectAll("circle")
        .data(dataSet).enter().append("svg:circle") // Append circle elements
        .attr("cx", barsWidthTotal + legendBulletOffset)
        .attr("cy", function(d, i) { return legendOffset + i*barHeight; } )
        .attr("stroke-width", ".5")
        .style("fill", function(d, i) { return colorScale(i); }) // Bar fill color
        .attr("index_value", function(d, i) { return "index-" + i; })
        .attr("class", function(d, i) { return "bars-" + chartID + "-legendBullet-index-" + i; })
        .attr("r", 5)
        .attr("color_value", function(d, i) { return colorScale(i); }) // Bar fill color...
        .on('mouseover', synchronizedMouseOver)
        .on("mouseout", synchronizedMouseOut);
    
    // Create hyper linked text at right that acts as label key...
    canvas.selectAll("a.legend_link")
        .data(dataSet) // Instruct to bind dataSet to text elements
        .enter().append("svg:a") // Append legend elements
        .attr("xlink:href", function(d) { return d.link; })
        .append("text")
        .attr("text-anchor", "center")
        .attr("x", barsWidthTotal + legendBulletOffset + legendTextOffset)
    //.attr("y", function(d, i) { return legendOffset + i*20 - 10; })
        .attr("y", function(d, i) { return legendOffset + i*barHeight; } )
        .attr("dx", 0)
        .attr("dy", "5px") // Controls padding to place text above bars
        .text(function(d) { return d.legendLabel;})
        .style("fill", "Blue")
        .attr("index_value", function(d, i) { return "index-" + i; })
        .attr("class", function(d, i) { return "bars-" + chartID + "-legendText-index-" + i; })
        .on('mouseover', synchronizedMouseOver)
        .on("mouseout", synchronizedMouseOut);
    
};

drawHorizontalBarChart("Bars1", dataSet1, "#bar_chart_1 .chart", "colorScale10");
