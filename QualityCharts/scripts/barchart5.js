/*******************************************************************************
*	Custom Animated Barchart Using JSON Data
*	May 2012
*   
* 	Author:	Christopher Kanode
*			ckanode@tanner.org
*
*	Dependencies: 
*       - jquery-1.7.1.min.js
*		- raphael-min.js
*		- JSON data (generated on backend, and stored in a hidden field)
*
*  Comments:  The BarChart has been prototyped to include all necessary functions
*   within it.  There are still a couple of places with a hard-coded value that
*   should be addressed in the future.
*       The BarChart object contains functions for both the public-facing website
*   and the private management site.  They could be separated if needed for size
*   issues.
* 
*  Warnings:  Hard-coded instance name used (oBarChart).  This will need to be
*       addressed in the future.
*******************************************************************************/

function BarChart() {
    // declare all the variables that we'll need.
    //Future Change: this.objectInstanceName; // This holds the named instance of the BarChart object.  We'll need it for the onClick events.
    this.paper; // the Raphael object
    this.Height = 280; // 320; // Height of the total area.
    this.Width = 450; // width of the total area.
    // Changed the padding.  In the future, I'd like to integrate the sidebar directly into the main chart.
    // Having padding set for each specific side will help with flexibility in the future.
    this.padding = {TOP: 40, RIGHT: 40, BOTTOM: 40, LEFT: 40}; // padding on all sides.

    this.speedCollapse = 250; // in milliseconds(ms).  Time it takes to drop the bars to the bottom of the chart.
    this.speedRise = 750; // (ms).  Time it takes for the bars to reposition themselves.

    this.gridColor = "#000"; // color of the lines for the X and Y Axises.
    this.baseColor = "#CCC"; // transition color when reseting the bars to a value.
    this.barColor = "#a6bc66"; // The color for the first bar
    this.stackedColors = new Array("#a6bc66", "#669dc7", "#944554"); // System/Carrollton, Villa Rica, Higgins
    this.textColor = "#000"; // Color for all the text

    this.chartAreaWidth = this.Width - this.padding.LEFT - this.padding.RIGHT;//(this.padding * 2); // width of the chart
    this.chartAreaHeight = this.Height - this.padding.TOP - this.padding.BOTTOM;//(this.padding * 2); // height of the chart

    this.maxValue = 0; // Maximum value of the chart
    this.minValue = 0; // Minimum value of the chart
    this.maxText; // Raphael text object for Max Value
    this.minText; // Raphael text object for Min Value

    this.avgLine; // the Raphael line object for the Benchmark
    this.avgBox; // the Raphael rounded box for framing the Benchmark value
    this.avgValue; // the Rapahel text object displaying the Benchmark value
    this.avgColor = "#d57500"; // default color of the line for the Benchmark
    this.avgBGColor = "#f9ebd9"; // default background color for the framing rounded rectangle

    this.isStacked = false; // default; standard, non-stacked chart.
    this.barCount = 4; // default; standard, non-stacked chart.
    this.stackedCount = 0; // default; Primarily for stacked charts to identify the number of grouped bars.
    this.barWidth = 50; // default; standard, non-stacked chart.
    this.barBasePoints = []; // array for holding pre-calculated values
    this.bars = []; // Array of Raphael lines representing the bars.
    this.barText = []; // Array of Raphael text objects displaying the bar titles.
    this.barValues = []; // Array of Raphael text objects displaying the bar values.

    this.chartID = 0; // default.  Get first chart in the JSON data

    // For the public-facing page
    this.sidebarPaper; // Raphael object for the sidebar

    // We could load this from a web service or construct it from a datasource in the Page_Load event
    this.chartData; // = eval(document.getElementById("chartData").value);
}

// Create the main Raphael object
BarChart.prototype.initPaper = function(chartAreaID) {
    this.paper = Raphael(chartAreaID); // sets the work area to be in the target DIV tag.
    this.paper.setSize(this.Width, this.Height); // set width, height of the chart
}

BarChart.prototype.createGrid = function () {
    /* path description
    M = move to point
    V = vertical line to point on the Y axis
    H = horizontal line to point on the X axis
    L = line to points x,y (not used in the chart)
    The grids coordinates start in the upper left corner. (4th quadrant of a 2d Cartesian coordinate system, if you care...)
    */
    var adjHeight = (this.Height - this.padding.TOP); // lower starting point
    // path(MoveTo x, y VerticalLineTo y) 
    var yAxisGridLine = this.paper.path("M" + this.padding.LEFT + " " + adjHeight + "V" + this.padding.TOP).attr({ stroke: this.gridColor });
    var xAxisGridLine = this.paper.path("M" + this.padding.LEFT + " " + adjHeight + "H" + (this.Width - this.padding.RIGHT)).attr({ stroke: this.gridColor });
    var maxTopMark = this.paper.path("M" + (this.padding.LEFT * .9) + " " + this.padding.TOP + "H" + this.padding.LEFT).attr({ stroke: this.gridColor });

    // the grid is going to be stable.  The only things that will change are the max/min values.
    this.minText = this.paper.text((this.padding.LEFT * .75), adjHeight, this.minValue).attr({ "text-anchor": "end" }); //.attr({opacity: "0"});
    this.maxText = this.paper.text((this.padding.LEFT * .75), (this.padding.TOP), this.maxValue).attr({ "text-anchor": "end" }); //.attr({opacity: "0"});

    this.calculateBasePoints(); // calculates the positions for each bar.
    // calling the benchmark bar before the bars makes it appear BELOW the bars.
    //createBenchmarkBar();
    if (this.isStacked) {
        this.createDefaultStackedBars();
    } else {
        this.createDefaultBars(); // constructs the bar objects and the benchmark object.
    }
    // calling the benchmark bar after the bars makes it appear ON TOP of the bars.
    this.createBenchmarkBar();
}

// base points are the x,y coordinates for the lowest point on the graph for each bar.
BarChart.prototype.calculateBasePoints = function() {
    // divide up the space evenly for all bars.  This acts as the incremental value between the bars.
    var incrementValue = this.chartAreaWidth / this.barCount;
    var adjHeight = (this.Height - this.padding.TOP - 1);
    // starting point of the first bar.
    var currentX = this.padding.LEFT + (incrementValue / 2);
    for (var i = 0; i < this.barCount; i++) {
        // we subtracted one, so that the bars would start above the X axis.
        this.barBasePoints.push({ x: currentX, y: adjHeight });
        currentX += incrementValue;
    }
}

// Should probably call this "initializeBars", since we're creating the bar objects to use throughout this object.
BarChart.prototype.createDefaultBars = function () {
    var x, y;
    for (i = 0; i < this.barCount; i++) {
        x = this.barBasePoints[i].x;
        y = this.barBasePoints[i].y;
        this.bars.push(this.paper.path("M" + x + " " + y + "V" + (y - 2)).attr({ stroke: this.baseColor, "stroke-width": this.barWidth }));
        this.barText.push(this.paper.text(x, (y + (this.padding.BOTTOM / 2)), "Q").attr({ "font-weight": "bold", "font-size": "18" }));
        this.barValues.push(this.paper.text(x, y - (this.padding.BOTTOM / 4), "0"));
    }
}
// initialize the bar objects for the stacked charts.
BarChart.prototype.createDefaultStackedBars = function () {
    // we need to get the bar count from the chart, in order to create the proper number of bars.
    if (typeof this.chartData != "undefined") {
        var chart = this.chartData.charts[this.chartID].chart;
        this.stackedCount = chart.bars.length; // get the number of groups. (2 or 3)
    } else {
        this.stackedCount = 3;
    }
    var barX = 0;
    var yAxis = 0;
    // This IF statement was meant for a basic validation, but did not work.  It's possible that
    //  by checking for the existance of bars.bars that I was, in fact, creating it.  Darn prototyping...
    // I should probably use typeof.
    //if (!chart.bars.bars) {
    //    // this is not a stacked chart.
    //    this.isStacked = false;
    //    this.createDefaultBars();
    //} else {
        this.barWidth = 25; // default width for stacked bars.
        // Outer loop iterates through the groups.
        c = 0;
        for (var a = 0; a < this.stackedCount; a++) {
            // inner loop sets the bars for each group
            for (var b = 0; b < this.barCount; b++) {
                barX = this.barBasePoints[b].x;
                barX = this.getAdjustedX(this.stackedCount, barX, a);
                yAxis = this.barBasePoints[b].y;
                this.bars.push(this.paper.path("M" + barX + " " + yAxis + "V"
                    + (yAxis - 2)).attr({ stroke: this.baseColor, "stroke-width": this.barWidth }));
                this.barValues.push(this.paper.text(barX, yAxis - (this.padding.BOTTOM / 4), "0"));
                if (a == 0) {
                    // output text
                    this.barText.push(this.paper.text(this.barBasePoints[b].x, (yAxis + (this.padding.BOTTOM / 2)), "Q")
                        .attr({ "font-weight": "bold", "font-size": "18" }));
                }
                c++;
            }
        }
    //}
}

// create the benchmark bar width placeholder values
BarChart.prototype.createBenchmarkBar = function() {
    var x = this.padding.LEFT;
    var y = this.Height - this.padding.TOP - this.padding.BOTTOM;
    this.avgLine = this.paper.path("M" + (this.padding.LEFT) + " " + y + "H" + (this.chartAreaWidth + this.padding.LEFT))
        .attr({ stroke: this.avgColor, "stroke-width": "2" });
    this.avgBox = this.paper.rect((this.chartAreaWidth + this.padding.LEFT), (y - 7), 30, 14, 5)
        .attr({ fill: this.avgBGColor, stroke: this.avgColor, "stroke-width": "2" });
    this.avgValue = this.paper.text((this.chartAreaWidth + this.padding.LEFT + 15), y, "<?")
        .attr({ "text-anchor": "middle" });
}

// use the JSON data and animate the chart.  "createChart" is bad wording, since we're
//  not creating it, but setting and animating the chart to go to a chosen data set.
//  Originally, I was recreating the chart, so at that time, the name made sense.
BarChart.prototype.createChart = function (nID) {
    // Due to jumping in and out of functions within functions within...,
    //  we were losing reference to the values in the object.  By setting them
    //  to variables, we're able to maintain the correct values.
    this.chartID = nID;
    var chart = this.chartData.charts[nID].chart;
    var nMax = chart.max;
    var nMin = chart.min;
    var nAvg = chart.avg;
    var currentColor = this.barColor;
    var avgLabel = chart.pre + nAvg + chart.post;
    this.maxText.attr("text", nMax);
    this.minText.attr("text", nMin);

    var oBarchart = this;
    // call the method to move the benchmark
    this.moveAvgBar(nMax, nMin, nAvg, avgLabel);

    var nVal, nPercent, nBar, oBar, oValue, baseX, baseY;
    if (this.isStacked == true) {
        this.SetStackedBars();
    } else {
        this.setBars();
    }
}

BarChart.prototype.SetStackedBars = function () {
    var chart = this.chartData.charts[this.chartID].chart;
    var nMax = chart.max;
    var nMin = chart.min;
    var nVal, nPercent, nBar, oBar, oValue, baseX, baseY;
    var currentColor = this.barColor;
    // double array.  Outer bars is an array of bars.
    barIndex = 0;
    // The outer loop (a) is for the groups of bars.
    // bars[0] = {bar[0], bar[1], bar[2], bar[3]}
    // bars[1] = {bar[0], bar[1], bar[2], bar[3]}
    for (var a = 0; a < this.stackedCount; a++) {
        // inner loop (b) iterates through the individual bars in each group
        for (var b = 0; b < this.barCount; b++) {
            // we've declared the following variables inside the loop because we were losing the values during the animation process.
            nVal = chart.bars[a].bars[b].value; //var 
            //nPercent; //var 
            if (isNaN(nVal)) {
                nPercent = 0;
            } else {
                nPercent = (nVal - nMin) / (nMax - nMin);
            }
            nBar = this.chartAreaHeight - (this.chartAreaHeight * nPercent) + this.padding.TOP; //var 
            oBar = this.bars[barIndex]; //var 
            oValue = this.barValues[barIndex]; //var 
            baseX = this.barBasePoints[b].x; //var 
            baseY = this.barBasePoints[b].y; //var 

            // baseX represents the middle x-axis of the bar area.  We need to shift
            //  it to the left or right depending on the nubmer of bars and which bar it is.
            baseX = this.getAdjustedX(this.stackedCount, baseX, a);

            // calling a separate method to help keep the values.
            this.animateBar(oBar, oValue, baseX, baseY, nBar, nVal, this.stackedColors[a]);
            // we only need to change the text for each group once, so we'll do it
            //  for the first bar grouping, hence only for the first group of bars (a == 0)
            if (a == 0) {
                this.barText[b].attr("text", chart.bars[a].bars[b].label);
            }
            barIndex++;
        }
    }
}

BarChart.prototype.setBars = function () {
    var chart = this.chartData.charts[this.chartID].chart;
    var nMax = chart.max;
    var nMin = chart.min;
    var nVal, nPercent, nBar, oBar, oValue, baseX, baseY;
    var currentColor = this.barColor;
    // most charts are for system/Carrollton.  A few are Villa Rica or Higgins, so let's check the FacilityID
    for (i = 0; i < chart.bars.length; i++) {
        this.barText[i].attr("text", chart.bars[i].label);
        switch (chart.bars[i].facilityid) {
            case "2": // Villa Rica
            case "4": // Willowbrooke
                currentColor = this.stackedColors[1];
                break;
            case "3": // Higgins
                currentColor = this.stackedColors[2];
                break;
            default:
                currentColor = this.barColor;
        }
        // we've declared the following variables inside the loop because we were losing the values during the animation process.
        nVal = chart.bars[i].value; //var 
        nPercent = (nVal - nMin) / (nMax - nMin); //var 
        nBar = this.chartAreaHeight - (this.chartAreaHeight * nPercent) + this.padding.TOP; //var 
        oBar = this.bars[i]; //var 
        oValue = this.barValues[i]; //var 
        baseX = this.barBasePoints[i].x; //var 
        baseY = this.barBasePoints[i].y; //var 
        // calling a separate method to help keep the values.
        this.animateBar(oBar, oValue, baseX, baseY, nBar, nVal, currentColor);
    }
}

// This is for the stacked bars only.  We need to shift the X-Axis left or right
//  depending on the number of stacked bars
BarChart.prototype.getAdjustedX = function(chartType, baseX, groupID) {
    switch (chartType) {
        case 3:
            if (groupID == 0) {
                baseX -= this.barWidth;
            } else if (groupID == 2) {
                baseX += this.barWidth;
            }
            break;
        case 2:
            if (groupID == 0) {
                baseX -= this.barWidth / 2;
            } else {
                baseX += this.barWidth / 2;
            }
            break;
    }
    return baseX;
}

// This method is for the chart management section.  We may want to separate it into another file
//  so that it is only loaded where needed.
BarChart.prototype.previewData = function(newMax, newMin, newBenchmark, newPrefix, newLabel, newValue) {
    // take the chartData object and alter its values with the preview information.
    var chart = this.chartData.charts[0].chart; // for this page, it will always be zero
    chart.max = newMax;
    chart.min = newMin;
    chart.avg = newBenchmark;
    if (typeof newPrefix != "undefined") {
        chart.pre = newPrefix;
    }
    if (newValue.length > 0) {
        // For the bars, we need to alter the arrays.
        if (chart.isstacked == "false") {
            // push new information.
            // standard barchart.
            chart.bars.reverse(); // reverse the array
            chart.bars.pop(); // remove the last item (which is actually the first)
            chart.bars.reverse(); // reverse to put back in original order
            // add the new data point to the end.
            chart.bars.push({ "label": newLabel, "value": newValue });
        } else {
            // Okay, for stacked bar charts:
            // first bars object is an array of bars objects (2-3 objects).
            // we'll use the "hasData" hidden fields to determine what data to use.
            // other info.  The bars are ordered as Carrollton, Villa Rica, Higgins.
            // The order is based off of the facilityID in the database.
            var bar = []; // array to store the potential values.  This will match the bars collection.
            if ($(hdnCarrolltonHasDataID).val() == "true") {
                bar.push({ "label": newLabel, "value": (($(txtCarrolltonID).val().length < 1) ? "n/a" : $(txtCarrolltonID).val()) });
            }
            if ($(hdnVillaRicaHasDataID).val() == "true") {
                bar.push({ "label": newLabel, "value": (($(txtVillaRicaID).val().length < 1) ? "n/a" : $(txtVillaRicaID).val()) });
            }
            if ($(hdnHigginsHasDataID).val() == "true") {
                bar.push({ "label": newLabel, "value": (($(txtHigginsID).val().length < 1) ? "n/a" : $(txtHigginsID).val()) });
            }
            for (var i = 0; i < chart.bars.length; i++) {
                // iterate through the bars collection and add the new information
                chart.bars[i].bars.reverse(); // reverse the array
                chart.bars[i].bars.pop(); // remove the last item (which is actually the first)
                chart.bars[i].bars.reverse(); // reverse to put back in original order
                // add the new data point to the end.
                chart.bars[i].bars.push(bar[i]);
            }
        }
    }
    this.createChart(0);
}

// For the chart management pages.
BarChart.prototype.resetData = function (chartDataID) {
    try {
        var myString = document.getElementById(chartDataID).value;
        var rExp = /&#39;/gi;
        var results = myString.replace(rExp, "'")
        this.chartData = eval("(" + results + ")");
    } catch (err) {
        // ignore
    }
}

// If no JSON data is present, then we'll add some text to the graph.
BarChart.prototype.noChart = function() {
    this.paper.text((this.Width / 2), (this.Height / 2), "No Data").attr({ "font-size": 60, "font-weight": "bold" });
}


BarChart.prototype.moveAvgBar = function (nMax, nMin, nAvg, avgLabel) {
    // calculate the bar position.
    var avgY = this.chartAreaHeight - (this.chartAreaHeight * ((nAvg - nMin) / (nMax - nMin))) + this.padding.TOP;
    this.avgValue.attr("text", avgLabel); // set text
    // animate the movement.  x.animate({attributes: values}, time, [easing], [callback])
    this.avgBox.animate({ y: avgY - 7, stroke: this.avgColor, fill: this.avgBGColor }, this.speedRise);
    this.avgValue.animate({ y: avgY }, this.speedRise); // the text object has a point associated with it, so we only have to move it along the y axis.
    this.avgLine.animate({ path: "M" + (this.padding.LEFT) + " " + avgY + "H" + (this.Width - this.padding.RIGHT), stroke: this.avgColor }, this.speedRise);
}


BarChart.prototype.animateBar = function (oBar, oValue, baseX, baseY, nBar, nVal, szColor) {
    // we set the animation to go to the bottom of the chart, once complete, the callback function executes which moves the bar to its final position.
    // element.animate({attribute: value}, time, [easing], [callback]);
    if (isNaN(nVal) || nVal == 0) {
        nBar = baseY - 2;
    }
    var nPadding = this.padding.BOTTOM;
    var nSpeed = this.speedRise;
    oBar.animate({ path: "M" + baseX + " " + baseY + "V" + (baseY - 2), stroke: this.baseColor }, this.speedCollapse,
		function () { oBar.animate({ path: "M" + baseX + " " + baseY + "V" + nBar, stroke: szColor }, nSpeed); });
    oValue.attr("text", nVal); // set the text.  Not doing any extra animation on the text.
    oValue.animate({ y: (baseY - (nPadding / 4)) }, 250,
		function () { oValue.animate({ y: nBar - (nPadding / 4) }, nSpeed); });
}


//******************************************************************************
//******************************************************************************
// BEGIN Public/Presentation pages.

BarChart.prototype.initSidebar = function () {
    this.sidebarPaper = Raphael("chartSidebar");
    this.sidebarPaper.setSize(47, 280); // set width, height of the chart
}

// If chartTitle element exists, set its text
BarChart.prototype.setTitle = function() {
    var oTitle;
    try {
        oTitle = document.getElementById("chartTitle");
        oTitle.innerHTML = this.chartData.charts[this.chartID].chart.title;
    } catch (err) {
        // ignore
    }
}
BarChart.prototype.setFooter = function() {
    var oFooter;
    try {
        oFooter = document.getElementById("chartFooter");
        oFooter.innerHTML = this.chartData.charts[this.chartID].chart.footer;
    } catch (err) {
        // ignore
    }
}
// If chartNavContainer exists, then create the buttons, if chart count is greater than 1
BarChart.prototype.setChartButtons = function() {
    var oNav;
    var oLink;
    var activeClass = "";
    var onClick = "";
    if (this.chartData.charts.length < 2) {
        try {
            oNav = document.getElementById("chartNavContainer");
            oNav.style.display = "none";
        } catch (err) {
            // ignore
        }
        return;
    }
    try {
        oNav = document.getElementById("chartNavContainer");
        oNav.innerHTML = "";
        for (var i = 0; i < this.chartData.charts.length; i++) {
            if (this.chartData.charts[i].chart.button.length > 0) {
                oLink = document.createElement("a");
                oLink.setAttribute("id", "link" + i);
                oLink.setAttribute("href", "#");
                oLink.innerHTML = this.chartData.charts[i].chart.button;
                activeClass = "";
                onClick = "oBarChart.changeChart(" + i + ")";
                if (this.chartID == i) {
                    activeClass = "Active";
                    onClick = "";
                }
                oLink.setAttribute("onclick", onClick);
                oLink.setAttribute("class", "Nav" + this.chartData.charts.length + "LinkButton" + activeClass);
                oNav.appendChild(oLink);
            }
        }
    } catch (err) {
        // ignore
    }
}

// Locate the index number of the chart based on its graphid
BarChart.prototype.getChartID = function (graphID) {
    var nIndex = 0; // default
    for (var i = 0; i < this.chartData.charts.length; i++) {
        if (this.chartData.charts[i].chart.graphid == graphID) {
            nIndex = i;
            break;
        }
    }
    return nIndex;
}

// if chartSiderbar exists, set the text and arrow
BarChart.prototype.setSidebar = function () {
    var text, arrowBody, arrowHead;
    var oSidebar;
    try {
        oSidebar = document.getElementById("chartSidebar");
        // clear any objects from the sidebar.  We will redraw every time!
        this.sidebarPaper.clear();
        // check to see if we need to do anything.
        if (this.chartData.charts[this.chartID].chart.sidebartext.length < 1) {
            return;
        }
        // Else, let's add and animate!
        text = this.sidebarPaper.text(15, 140, this.chartData.charts[this.chartID].chart.sidebartext).attr({ "font-weight": "bold", "font-size": "14" });
        //text = sidebarPaper.
        text.transform("r270");
        if (this.chartData.charts[this.chartID].chart.arrow == "U") {
            this.upArrow();
        } else if (this.chartData.charts[this.chartID].chart.arrow == "D") {
            this.downArrow();
        }
    } catch (err) {
        // ignore
        //console.log(err);
    }
}

// sidebarPaper(47, 280)
BarChart.prototype.upArrow = function() {
    var areaHeight = this.Height;
    var rectX = 30;
    var rectY = 240;
    var rectWidth = 10;
    var rectHeight = 10;
    var c = this.sidebarPaper.rect(rectX, rectY, rectWidth, rectHeight).attr({ fill: "270-" + this.barColor + "-#fff", "stroke": this.barColor });
    var arrowPath = "M" + (rectX - (rectWidth / 2)) + " " + (rectY)
		+ "H" + (rectX + rectWidth + (rectWidth / 2))
		+ "L" + (rectX + (rectWidth / 2)) + " " + (rectY - (rectWidth * 1.5))
		+ "L" + (rectX - (rectWidth / 2)) + " " + (rectY) + "Z";
    var a = this.sidebarPaper.path(arrowPath).attr({ fill: this.barColor, "stroke": this.barColor });
    var newY = rectY + rectHeight;
    rectHeight = 220;
    c.animate({ height: rectHeight, x: rectX, y: (newY - rectHeight) }, this.speedRise);
    arrowPath = "M" + (rectX - (rectWidth / 2)) + " " + (newY - rectHeight)
		+ "H" + (rectX + rectWidth + (rectWidth / 2))
		+ "L" + (rectX + (rectWidth / 2)) + " " + (newY - rectHeight - (rectWidth * 1.5))
		+ "L" + (rectX - (rectWidth / 2)) + " " + (newY - rectHeight) + "Z";
    a.animate({ path: arrowPath }, this.speedRise);
}

BarChart.prototype.downArrow = function() {
    var rectX = 30;
    var rectY = 20;
    var rectWidth = 10;
    var rectHeight = 10;
    var c = this.sidebarPaper.rect(rectX, rectY, rectWidth, rectHeight).attr({ fill: "270-#fff-" + this.barColor, "stroke": this.barColor });
    var arrowPath = "M" + (rectX - (rectWidth / 2)) + " " + (rectHeight + rectY)
            + "H" + (rectX + rectWidth + (rectWidth / 2))
            + "L" + (rectX + (rectWidth / 2)) + " " + (rectHeight + rectY + (rectWidth * 1.5))
            + "L" + (rectX - (rectWidth / 2)) + " " + (rectHeight + rectY) + "Z";
    var a = this.sidebarPaper.path(arrowPath).attr({ fill: this.barColor, "stroke": this.barColor });
    rectHeight = 240; // change height for animation
    c.animate({ height: rectHeight }, this.speedRise);
    arrowPath = "M" + (rectX - (rectWidth / 2)) + " " + (rectHeight + rectY)
            + "H" + (rectX + rectWidth + (rectWidth / 2))
            + "L" + (rectX + (rectWidth / 2)) + " " + (rectHeight + rectY + (rectWidth * 1.5))
            + "L" + (rectX - (rectWidth / 2)) + " " + (rectHeight + rectY) + "Z";
    a.animate({ path: arrowPath }, this.speedRise);
}

// WARNING: The BarChart object instance name(oBarChart) is hard-coded.  I'll need
//  to change that in the future.  I have some ideas.
BarChart.prototype.changeChart = function (nID) {
    var activeClass;
    var onClick;
    var oLink;
    for (var i = 0; i < this.chartData.charts.length; i++) {
        activeClass = "";
        onClick = "oBarChart.changeChart(" + i + ")";
        if (nID == i) {
            activeClass = "Active";
            onClick = "";
        }
        oLink = document.getElementById("link" + i);
        oLink.setAttribute("class", "Nav" + this.chartData.charts.length + "LinkButton" + activeClass);
        oLink.setAttribute("onclick", onClick);

    }
    this.createChart(nID);
    this.setTitle();
    this.setSidebar();
    this.setFooter();
}
// END Public/Presentation Pages
//******************************************************************************
//******************************************************************************



