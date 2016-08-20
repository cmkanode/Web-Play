// JavaScript Document
function copyTile(szSrc){
	var oY = document.createElement("img");
	nCount = incCount();
	oY.id = ("tile" + nCount);
	oY.className = "tile";
	oY.src = szSrc;
	oY.onclick = new Function("clickAndDrag(this)");
	document.getElementById("container").appendChild(oY);
	clickAndDrag(oY);
}

function incCount(){
	o = document.getElementById("numberoftiles");
	var count = o.value;
	count++;
	o.value = count;
	return count;
}