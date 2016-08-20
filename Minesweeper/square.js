function Square () {
	this.x = 0;
	this.y = 0;
	this.color = "#CCCCCC";
	this.rotation = 0;
}
// 40 x 40 square
Square.prototype.draw = function (nX, nY, context, isCovered) {
	context.save();
	context.translate(nX, nY);
	
	context.lineWidth = 0;
	
	//context.fillStyle = "rgb(150,29,28)";
	//context.fillRect(x,y,width,height);
	if(isCovered){
		// 3 rectangles
		// light edge - top and right
		context.fillStyle = "#EEE";
		context.fillRect(-20, -20, 40, 40);
		// dark edge - left and bottom
		context.fillStyle = "#666";
		context.fillRect(-20, -18, 38, 38);
		// inner square
		context.fillStyle = "#CCC";
		context.fillRect(-18, -18, 36, 36);
	}else{
		context.lineWidth = 1;
		context.strokeStyle = "#999";
		context.fillStyle = "#CCC";
		context.fillRect(-20, -20, 40, 40);
	}
	context.restore();
};