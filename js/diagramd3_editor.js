function hdHelp() {
  alert("=======================\n" +
    "Navigation for Hasse diagram\n" +
    "=======================\n" +
    "\n" +
    "Useage:\n"+
    "\n" +
    "- zoom (smooth) -- *Mouse-Wheel* \n" +
    "- zoom in (one step) -- *Double-Click* \n" +
    "- zoom out (one step) -- *Shift+Double-Click* \n" +
    "- move the diagram -- *Click+Drag* \n" +
    "- select one node -- *Click* \n" +
    "- toggle a node's selection or select multiple nodes --  *Ctrl+Click* ");
}
var actwidth = 850;
var actheight = 500;

var margin = {top: 30, right: 20, bottom: 30, left: 50},
  width = actwidth,
  height = actheight;

//import * as d3 from 'd3'
// Settings
var preselected = []
var arrowShow = 1
var unselectedHide = 0
var edgeHighlight = 1
var arrowWidth = 20;
var arrowSideRight = 1;
var unselectedNodeColor = "#ff0000"
var selectedNodeColor = "#8abfff"
var arrowColor = "#ff0000"
var textColor = "#000000"
var lineColor = "#000000"
var shortLength = 4
var hNodeDist = 2
var vNodeDist = 2
var r = 20
var bkgR = r + 15
var frameHeight = 800;

// Data
var mx_obj_red;
var lst_obj_red;
var int_levels;
var fd_levels;
var mx_eq_classses;
var lst_connections;
var dmred;
var lst_downsets;
var lst_upsets;
var lst_incomparables;


$data

var nodeData;
var svg;
var hd;
var selectedBkg;
var arrowLength;
var arrow;

var zoom = 0
var zoomFactor = 4;
var lastScale = 1;

var transX = 0;
var transY = 0;
var newX = 0;
var minX = 10000;
var nodeDragging = false;


function zoomHandler(d, i) {
  if (d3.event.defaultPrevented || nodeDragging) {
    zoom.translate([transX, transY]);
    return true;
  }
  d3.event.sourceEvent.stopPropagation();
  if (lastScale === d3.event.scale) {
    if (!isNaN(d3.event.translate[0])) {
      transX = d3.event.translate[0];
      transY = d3.event.translate[1];
    }
    hd.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
  }
  else {
    lastScale = d3.event.scale;
    if (!isNaN(d3.event.translate[0])) {
      transX = d3.event.translate[0];
      transY = d3.event.translate[1];
    }
    hd.transition().attr("transform", "translate(" + transX + "," + transY + ") scale(" + d3.event.scale + ")");
  }
}

function nodeDragHandler(d, i) {
  d3.event.sourceEvent.stopPropagation();
  d3.event.sourceEvent.preventDefault();
  moveNode(this, d, parseInt(d3.event.dx));
}

function moveNode(node, data, dx) {
  var tagName = node.tagName;
  node = d3.select(node);
  if (tagName.toLowerCase() === "text") {
    node = d3.selectAll("#hd > circle")
      .filter(function(d) {return d.text == data.text});
  }
  newX = parseInt(node.attr("cx")) + parseInt(dx);
  hd.selectAll("#hd > text")
    .filter(function(d, i) {
      if (d === undefined) return false;
      return d.text == data.text;
    })
    .attr("x", newX);
  hd.selectAll("#hd > line")
    .filter(function() {return d3.select(this).attr("class") != "arrow"})
    .each(function(d, i) {
      var line = d3.select(this);
      if (d.x1 == data.x && d.y1 == data.y) {
        line.attr("x1", newX);
      }
      else if (d.x2 == data.x && d.y2 == data.y) {
        line.attr("x2", newX);
      }
    });
  node.attr("cx", newX);
  encircle();
}

function setArrowSideLeft() {
  arrow.attr("transform", "translate(" + -margin.left + ", -15)")
  hd.select("line.arrow")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", arrowLength);
  hd.select("polyline.arrow")
    .attr("points", "" + ((-arrowWidth / 2)) + " " +
      20 + ", 0 0, " + (arrowWidth / 2) + " " + 20);
  hd.selectAll("text.arrow")
    .attr("x", -40);
}

function setArrowSideRight() {
  arrow.attr("transform", "translate(" + margin.left + ", -15)")
  hd.select("line.arrow")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", arrowLength);
  hd.select("polyline.arrow")
    .attr("points", "" + ((-arrowWidth / 2)) + " " +
      20 + ", 0 0, " + (arrowWidth / 2) + " " + 20);
  hd.selectAll("text.arrow")
    .attr("x", 40);
}

function hideArrow() {
  hd.select("line.arrow")
    .style("stroke", "transparent");
  hd.select("polyline.arrow")
    .style("stroke", "transparent");
  hd.selectAll("text.arrow")
    .style("fill", "transparent");
}

function showArrow() {
  hd.select("line.arrow")
    .style("stroke", arrowColor);
  hd.select("polyline.arrow")
    .style("stroke", arrowColor);
  hd.selectAll("text.arrow")
    .style("fill", "black");
}

function encircle() {
  selectedBkg.selectAll("circle,line").remove();
  if (!edgeHighlight) return;
  hd.selectAll("#hd > circle")
    .filter(function() {return d3.select(this).attr("class") == "selected"})
    .each(function(d, i) {
      selectedBkg.append("circle")
        .attr("r", bkgR)
        .attr("cx", d3.select(this).attr("cx"))
        .attr("cy", d.y, d3.select(this).attr("cy"))
        .datum(d);
    });
  var edges = [];
  selectedBkg.selectAll("circle")
    .each(function(datum, i) {
      var curThis = this;
      selectedBkg.selectAll("circle")
        .filter(function() {
          return curThis != this;
        })
        .each(function (d, i) {
          var curEdge = getEdge(datum, d);
          if (curEdge != undefined && edges.indexOf(curEdge) < 0) edges[edges.length] = curEdge;
        })
    });
  for (var i=0;i<edges.length;i++) {
    var eObj = d3.select(edges[i]);
    selectedBkg.append("line")
      .attr("x1", eObj.attr("x1"))
      .attr("x2", eObj.attr("x2"))
      .attr("y1", eObj.attr("y1"))
      .attr("y2", eObj.attr("y2"))
      .style("stroke-width", bkgR * 2);
  }
}
function hideUnselected() {
  hd.selectAll("#hd > circle")
    .filter(function() {return d3.select(this).attr("class") == "unselected"})
    .attr("fill", "transparent")
    .style("pointer-events", "none")
    .each(function(datum, i) {
      var curThis = this;
      hd.selectAll("#hd > text")
        .filter(function(data) {
          if (data == undefined) return false;
          return data.text == datum.text;
        })
        .style("pointer-events", "none")
        .style("fill", "transparent");
      hd.selectAll("#hd > circle")
        .filter(function() {
          return curThis != this;
        })
        .each(function (d, i) {
          var curEdge = getEdge(datum, d);
          if (curEdge != undefined) {
            d3.select(curEdge).style("stroke", "transparent");
          }
        })
    });
  if (!edgeHighlight) {
    hd.selectAll("#hd > line")
      .filter(function(d) {return d!= undefined;})
      .style("stroke", "transparent");
  }
}
function showUnselected() {
  hd.selectAll("#hd > circle")
    .filter(function() {return d3.select(this).attr("class") == "unselected"})
    .attr("fill", unselectedNodeColor)
    .style("pointer-events", "auto");
  d3.selectAll("#hd > text")
    .style("fill", textColor)
    .style("pointer-events", "auto");
  d3.selectAll("#hd > line")
    .filter(function(d) {return d != undefined;})
    .style("stroke", lineColor);
}
function processVisibility() {
  if (unselectedHide) {
    hideUnselected();
  }
  else {
    showUnselected();
  }
  processArrowVisibility();
}
function processArrowVisibility() {
  if (arrowShow) {
    showArrow();
  }
  else {
    hideArrow();
  }
}
function processArrowSide() {
  if (arrowSideRight) {
    setArrowSideRight();
  } else {
    setArrowSideLeft();
  }
}
function toggleSelected(node) {
  if (node.attr("class") == "selected") node.attr("class", "unselected").attr("fill", unselectedNodeColor);
  else node.attr("class", "selected").attr("fill", selectedNodeColor);
}
function zoomToNode(node) {
  var transX = (-node.data()[0].x) * zoomFactor + actwidth / 2;
  var transY = (-node.data()[0].y) * zoomFactor + actheight / 2;
  zoom.translate([transX, transY]);
  zoom.scale(zoomFactor);
  hd.transition().attr("transform", "translate(" +
    transX + "," +
    transY + ") scale(" + zoomFactor + ")");
}
function getEdge(d1, d2) {
  if (d1 == undefined || d2 == undefined) return;
  var edge = undefined;
  hd.selectAll("line")
    .each(function(d, i) {
      if (d == undefined) return;
      if ((d.x1 == d1.x && d.y1 == d1.y
        && d.x2 == d2.x && d.y2 == d2.y)
        || (d.x1 == d2.x && d.y1 == d2.y
          && d.x2 == d1.x && d.y2 == d1.y)) {
        edge = this;
      }
    });
  return edge;
}
function nodeClicked(data) {
  d3.select("[name=object]").attr('value', data.text);
  d3.select("[name=object]").property('value', data.text);
}
function drawHD() {
  if (lst_obj_red.length <= 1)
    arrowShow = false;
  zoom = d3.behavior.zoom()
    .scaleExtent([.001, 10])
    .on("zoom", zoomHandler);
  var dragNodes = d3.behavior.drag()
    .on("dragstart", function(d, i) {
      nodeDragging = true;
      d3.event.sourceEvent.stopPropagation();
      d3.event.sourceEvent.preventDefault();
    })
    .on("drag", nodeDragHandler)
    .on("dragend", function(d, i) {
      nodeDragging = false;
      d3.event.sourceEvent.stopPropagation();
      d3.event.sourceEvent.preventDefault();});
  // the basic svg from the HTML file
  svg = d3.select("svg")
    .attr('id',"backgroundGradient")
    .attr("width", "100%")
    .attr("height", "" + frameHeight + "px");
  hd = svg.append("svg:svg").append("g")
    .attr("id", "hd")
    .attr("width", actwidth)
    .attr("height", actheight);

  selectedBkg = hd.append("svg:svg")
    .attr("id", "selectedBkg")
    .attr("width", "100%")
    .attr("height", "100%");

  nodeData = {};
  data = [];
  for (var i = 0; i < lst_obj_red.length; i++) {
    var name = lst_obj_red[i];
    nodeData[name] = {
      x: 0,
      y: 0,
      text: name,
      textShort: name.length > shortLength
        ? name.substring(0, shortLength) + '.' : name,
      tooltip: name +
        '\nEquivalence class: ' + mx_eq_classses[name] +
        '\nProfile: ' + mx_obj_red[i] + '',
      selected: false,
      downset: lst_downsets[i],
      upset: lst_upsets[i],
      incomp: lst_incomparables[i]
    };
    data[data.length] = nodeData[name];
  }

  margin.left = 0;
  margin.top = r + 30;
  arrowLength = (int_levels - 1) * 60 * vNodeDist + 2 * r;
  for (var level = 0; level < int_levels; level++) {
    var middle = fd_levels[level].length / 2
    var newMargin = middle * hNodeDist * 60 + 50
    if (newMargin > this.margin.left) {
      margin.left = newMargin
    }

    for (var i = 0; i < fd_levels[level].length; i++) {
      var name = lst_obj_red[fd_levels[level][i]]
      nodeData[name].x = hNodeDist * 60 * (i - middle)
      nodeData[name].y = level * vNodeDist * 60
    }
  }
  var lineData = [];
  // draw the lines behind the circles
  for (var i=0; i<lst_connections.length; i++) {
    lineData[lineData.length] = {
      x1: nodeData[lst_connections[i][0]].x,
      y1: nodeData[lst_connections[i][0]].y,
      x2: nodeData[lst_connections[i][1]].x,
      y2: nodeData[lst_connections[i][1]].y,
    }
  }
  // draw the edges
  hd.selectAll("line")
    .data(lineData)
    .enter()
    .append("line")
    .attr("x1", function(d) {return d.x1;})
    .attr("y1", function(d) {return d.y1;})
    .attr("x2", function(d) {return d.x2;})
    .attr("y2", function(d) {return d.y2;});
  // draw the nodes with labels
  hd.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", function(d) {if (preselected.indexOf(d.text) > -1) return "selected"; else return "unselected";})
    .attr("fill", function(d) {if (preselected.indexOf(d.text) > -1) return selectedNodeColor; else return unselectedNodeColor;})
    .attr("r", r)
    .attr("cx", function(d) {return d.x;})
    .attr("cy", function(d) {return d.y;})
    .on("click", function(d) {
      if (d3.event.defaultPrevented) return;
      nodeClicked(d);
      if (d3.event.shiftKey) {
        toggleSelected(d3.select(this));
      }
      else {
        d3.selectAll("circle")
          .attr("class", "unselected")
          .attr("fill", unselectedNodeColor);
        d3.select(this)
          .attr("class", "selected")
          .attr("fill", selectedNodeColor);
      }
      encircle();
      processVisibility();
    })
    .on("contextmenu", function(d) {
      if (d3.event.defaultPrevented) return;
      nodeClicked(d);
      if (d3.event.shiftKey) {
        toggleSelected(d3.select(this));
      }
      else {
        d3.selectAll("circle")
          .attr("class", "unselected")
          .attr("fill", unselectedNodeColor);
        d3.select(this)
          .attr("class", "selected")
          .attr("fill", selectedNodeColor);
      }
      zoomToNode(d3.select(this));
      d3.event.preventDefault();
      encircle();
      processVisibility();
    })
    .call(dragNodes)
    .append("svg:title")
    .text(function(d) {return d.tooltip;});

  hd.selectAll("text")
    .data(data)
    .enter()
    .append("text")
    .attr("x", function(d) {return d.x;})
    .attr("y", function(d) {return d.y + r / 3;})
    .attr("text-anchor", "middle")
    .style("fill", textColor)
    .text(function(d) {return d.textShort;})
    .on("click", function(d) {
      if (d3.event.defaultPrevented) return;
      nodeClicked(d);
      if (d3.event.shiftlKey) {
        toggleSelected(
          d3.selectAll("#hd > circle")
            .filter(function(da) {return da == d})
        );
      }
      else {
        d3.selectAll("circle")
          .attr("class", "unselected")
          .attr("fill", unselectedNodeColor);
        d3.selectAll("circle")
          .filter(function(da) {return da == d})
          .attr("class", "selected")
          .attr("fill", selectedNodeColor);
      }
      encircle();
      processVisibility();
    })
    .on("contextmenu", function(d) { // handle rightclick
      if (d3.event.defaultPrevented) return;
      nodeClicked(d);
      if (d3.event.shiftKey) {
        toggleSelected(
          d3.selectAll("circle")
            .filter(function(da) {return da == d})
        );
      }
      else {
        d3.selectAll("circle")
          .attr("class", "unselected")
          .attr("fill", unselectedNodeColor);
        d3.selectAll("circle")
          .filter(function(da) {return da == d})
          .attr("class", "selected")
          .attr("fill", selectedNodeColor);
      }
      zoomToNode(d3.select(this));
      d3.event.preventDefault();
      encircle();
      processVisibility();
    })
    .call(dragNodes)
    .append("svg:title")
    .text(function(d) {return d.tooltip;});
  arrow = hd.append("g");
  arrow.append("line")
    .attr("class", "arrow")
    .style("stroke", arrowColor)
    .attr("stroke-width", 1);
  arrow.append("polyline")
    .attr("class", "arrow")
    .attr("stroke-width", 1)
    .style("stroke", arrowColor)
    .style("stroke-linejoin", "miter")
    .style("fill", "transparent");
  // the text for the arrow
  arrow.append("text")
    .attr("y", arrowLength)
    .attr("class", "arrow")
    .text("Low");
  arrow.append("text")
    .attr("y", 0)
    .attr("class", "arrow")
    .text("High");
  setArrowSideRight();

  // zoom
  svg.call(zoom);
  svg.call(zoom).on("dblclick.zoom", null);
  hd.selectAll("circle").call(zoom);
  hd.selectAll("circle").call(zoom).on("dblclick.zoom", null);
  encircle();
  processVisibility();
  processArrowVisibility();
  processArrowSide();


  transX = arrowSideRight ? margin.left : margin.left + 40 + arrowWidth / 2;
  transY = margin.top;
  zoom.translate([transX, transY]);
  hd.attr("transform", "translate(" + [transX, transY] + ") scale(" + lastScale + ")");
}

drawHD();

