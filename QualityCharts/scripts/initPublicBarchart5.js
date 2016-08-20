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
*       - BarChart JavaScript Object (defined in barchart5.js)
*
*  Comments:  This file is for the public-facing chart pages.
* 
*******************************************************************************/
function initChart(oChart, chartDataID, chartAreaID) {
    // pull the data from a hidden field on the page.  It is JSON data.
    // The parentheses prevent ambiguity.  (without them, the page errors)

    // Load the JSON data.  The Hidden field is populated using StringBuilder, and
    // it encodes the single quotes, so we need to decode them.
    myString = $("#" + chartDataID).val();
    rExp = /&#39;/gi;
    results = myString.replace(rExp, "'")
    if (results.length > 0) {
        oChart.chartData = eval("(" + results + ")");
    }

    // Creates canvas 
    oChart.initPaper(chartAreaID);
    oChart.initSidebar();

    if (!oChart.isStacked) {
        // set color according to facilityID
        // stackColors = array(System/Carrollton, Villa Rica, Higgins)
        switch ($(facilityID).val()) {
            case "2":
                oChart.barColor = oChart.stackedColors[1];
                break;
            case "3":
                oChart.barColor = oChart.stackedColors[2];
                break;
        }
    }

    var chartIndex = $(chartIndexID).val(); // get value in the hidden field.  This would be the graphid passed in the querystring.
    if (chartIndex.length < 1) {
        chartIndex = oChart.chartID;
    } else {
        chartIndex = oChart.getChartID(chartIndex);
    }
    // methods located in barchart4.js
    oChart.createGrid(); // initializes the chart with the needed objects
    if (results.length > 0) {
        // TODO - pass the index of the chart
        oChart.createChart(chartIndex); // reads the json data and animates the chart to its proper position.
    } else {
        oChart.noChart();
    }
    oChart.setChartButtons();
    oChart.setTitle();
    oChart.setSidebar();
    oChart.setFooter();

    // We need to select another chart, if the graphid is passed.

}

