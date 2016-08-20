var ie = false;
if(navigator.appName == "Microsoft Internet Explorer"){ie = true;}
var szMOVE;
nZ = 3;
function bringToFront(szX){
	//change Zindex to highest one.
	var oX, nZ;
	oX = document.getElementById(szX);
	nZ = oX.style.zIndex;
	//alert(nZ);
	
	//go through ALL div tags and find the top most one.
	var nIndex, oItem, oTarget;
	nIndex = 0;
	var oDivs = document.getElementsByTagName("div");
	//alert(oDivs.length);
	for(i=0; i<oDivs.length;i++){
		//alert(oDivs[i].style.zIndex);
		if(oDivs[i].style.zIndex){
			if(Math.abs(oDivs[i].style.zIndex) > Math.abs(nIndex)){
				nIndex = oDivs[i].style.zIndex;
				oTarget = oDivs[i];
			}
		}
	}
	//switch places between selected note and the highest note
	oX.style.zIndex = nIndex;
	oTarget.style.zIndex = nZ;
	
}
function clickAndDrag(oX){
	//oX = document.getElementById(szX);
	//alert(nZ + "\n" + oX.zIndex);
	//if(Math.abs(oX.zIndex) < Math.abs(nZ)){
	//	nZ++;
	//	oX.zIndex = nZ;
	//}
	nZ = getHighestZIndex();
	oX.style.zIndex = nZ;
	//alert(mouse.x);
	if(szMOVE==oX.id){
		szMOVE = "";
		//oX = document.getElementById(szX);
		// check for TODO
		//alert(szX.substring(0,5));
		if(oX.id.substring(0,4) == "tile"){
			// snap to grid on release.
			snapToGrid(oX);
			
		//	nX = oX.id.substring(5,oX.id.length);
		//	updateLocation(oX.style.top, oX.style.left, nX, nZ);
		}
	}else{
		szMOVE = oX.id;
	}
}

function snapToGrid(oX){
	var currentTop = parseInt(oX.style.top);
	var currentLeft = parseInt(oX.style.left);
	var topInterval = 24;
	var leftInterval = 42;
	var newTop = 0;
	var newLeft = 0;
	/* The hex grid's coordinates are like a diamond grid.
	This will be the first iteration of the algorithm to decide on the position to snap to.
	*/
	
	var diffTop = currentTop % topInterval; // get remainder from division of currentTop by topInterval (0 - 23)
	var diffLeft = currentLeft % leftInterval; // get remainder
	var point = {top: currentTop, left: currentLeft}; // set current point
	
	// this one is working better.
	rowNumber = Math.round(currentTop / topInterval);
	colNumber = Math.round(currentLeft / leftInterval);
	if(rowNumber % 2 != colNumber % 2){
		// shift rowNumber down by one.  row and column numbers should be even/even or odd/odd pairs.
		rowNumber--;
	}
	newTop = rowNumber * topInterval;  //Math.round((rowNumber / 2) * (topInterval * 2)); //
	newLeft = Math.round((colNumber / 2) * ((leftInterval * 2) + 1));
	
	
	// calculate closest row
	/*
	if(diffTop <= topInterval / 2){
		newTop = currentTop - diffTop;
		if((newTop / (topInterval * 2)) % 2 == 1){
			newTop += topInterval;
		}
	}else{
		newTop = currentTop + (topInterval - diffTop);
		if((newTop / (topInterval * 2)) % 2 == 1){
			newTop -= topInterval;
		}
	}
	
	// calculate closest column
	if(diffLeft <= leftInterval / 2){
		newLeft = currentLeft - diffLeft;
		if((newLeft / (leftInterval * 2)) % 2 == 1){
			newLeft += leftInterval;
		}
	}else{
		newLeft = currentLeft + (leftInterval - diffLeft);
		if((newLeft / (leftInterval * 2)) % 2 == 1){
			newLeft -= leftInterval;
		}
	}
	// need to add half pixel per column to correct for image size.
	newLeft += (newLeft / leftInterval) / 2;
	*/
	
	oX.style.top = newTop + "px";
	oX.style.left = newLeft + "px";
	
	/*
	var top1, top2, left1, left2;
	top1 = currentTop - diffTop;
	top2 = currentTop + (topInterval - diffTop);
	left1 = currentLeft - diffLeft;
	left2 = currentLeft + (leftInterval - diffLeft);
	
	var arrPoints = new Array({top: top1, left: left1}, {top: top1, left: left2}, {top: top2, left: left1}, {top: top2, left: left2});
	var newPoint = getNewPoint(point, arrPoints);
	
	oX.style.top = newPoint.top + "px";
	oX.style.left = newPoint.left + "px";
	*/
}
/* 
function getNewPoint(point, arrPoints){
	// figure out which set of points are the closest to the main point
	// look for lowest difference in the top value first.
	var targetPoint;
	var currentDiff, newDiff;
	var arrDiff = new Array();
	for(var i = 0; i < arrPoints.length; i++){
		arrDiff.push((Math.abs(point.top - arrPoints[i].top))+(Math.abs(point.left - arrPoints[i].left)));
	}
	for(var i = 0; i < arrDiff.length; i++){
		if(i == 0){
			targetPoint = arrPoints[0];
			currentDiff = arrDiff[i];
		}else{
			newDiff = arrDiff[i];
			if(newDiff < currentDiff){
				currentDiff = newDiff;
				targetPoint = arrPoints[i];
			}else if(newDiff == currentDiff){
				// check difference in top values (have priority over left value)
				if(Math.abs(point.top - arrPoints[i].top) < Math.abs(point.top - targetPoint.top)){
					targetPoint = arrPoints[i];
				}
				//break;
			}
		}
	}
	return targetPoint;
}
*/

function getHighestZIndex(){
	var nZ = 1;
	var arrDiv = document.getElementsByTagName("img");
	for(i = 0; i < arrDiv.length; i++){
		var oItem = arrDiv[i];
		//alert(arrDiv[i].id);
		if(oItem.id.indexOf("tile") > -1){
			if(oItem.style.zIndex > nZ){ nZ = oItem.style.zIndex; }
		}
	}
	nZ++;
	//alert(nZ);
	return nZ;
}

/*
Simple Image Trail script- By JavaScriptKit.com
Visit http://www.javascriptkit.com for this script and more
This notice must stay intact
*/
var offsetfrommouse = [-16,-16]; //image x,y offsets from cursor position in pixels. Enter 0,0 for no offset
var displayduration = 0; //duration in seconds image should remain visible. 0 for always.

//if (document.getElementById || document.all)
//document.write('<div id="trailimageid" style="position:absolute;visibility:visible;left:0px;top:0px;width:1px;height:1px"><img src="../../'+trailimage[0]+'" border="0" width="'+trailimage[1]+'px" height="'+trailimage[2]+'px"></div>')

function gettrailobj(){
	if(szMOVE != ""){
		if(oMOVE = document.getElementById(szMOVE)){
			return oMOVE.style;
		}else{
			return false;
		}
	}else{
		return false;
	}
}

function truebody(){
	return (!window.opera && document.compatMode && document.compatMode!="BackCompat")? document.documentElement : document.body
}

function followmouse(e){
	var xcoord=offsetfrommouse[0]
	var ycoord=offsetfrommouse[1]
	
	if (typeof e != "undefined"){
		xcoord+=e.pageX
		ycoord+=e.pageY
	}else if (typeof window.event !="undefined"){
		xcoord+=truebody().scrollLeft+event.clientX
		ycoord+=truebody().scrollTop+event.clientY
	}
	var docwidth=document.all? truebody().scrollLeft+truebody().clientWidth : pageXOffset+window.innerWidth-15
	var docheight=document.all? Math.max(truebody().scrollHeight, truebody().clientHeight) : Math.max(document.body.offsetHeight, window.innerHeight)

	gettrailobj().left=xcoord+"px"
	gettrailobj().top=ycoord+"px"
	if(ie){
		if(szMOVE != ""){
			if(oX = document.getElementById("under_"+szMOVE)){
				oX.style.left = xcoord+"px";
				oX.style.top = ycoord+"px";
			}
		}
	}
}

document.onmousemove=followmouse
