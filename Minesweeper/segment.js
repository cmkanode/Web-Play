// JavaScript Document
/*
7-segment display
Very simple.  Each segment is a rectangle
-1- 
7-2 
-3-
6-4
-5-
*/
function SevenSegment () {
	this.x = 0;
	this.y = 0;
	this.color = "#000";
	this.backcolor = "#CCC";
	this.lineWidth = 2;
	this.scaleX = 1;
	this.scaleY = 1;
	this.rotation = 0;
	this.width = 22;
	this.height = 40;
	this.number = 0; // default
	this.segments = [{x: 1, y: 1, w: 22, h: 40},
		{x: 6, y: 5, w: 12, h: 4},
		{x: 18, y: 8, w: 4, h: 12},
		{x: 6, y: 19, w: 12, h: 4},
		{x: 18, y: 22, w: 4, h: 12},
		{x: 6, y: 33, w: 12, h: 4},
		{x: 2, y: 22, w: 4, h: 12},
		{x: 2, y: 8, w: 4, h: 12}];
	this.numbers = [
		[1, 2, 4, 5, 6, 7], // 0
		[2, 4], // 1
		[1, 2, 3, 5, 6], // 2
		[1, 2, 3, 4, 5], // 3
		[2, 3, 4, 7], // 4
		[1, 3, 4, 5, 7], // 5
		[1, 3, 4, 5, 6, 7], // 6
		[1, 2, 4], // 7
		[1, 2, 3, 4, 5, 6, 7], // 8
		[1, 2, 3, 4, 5, 7] // 9
	];
}
// 20 diameter circle
SevenSegment.prototype.draw = function (context) {
	context.save();
	context.translate(this.x, this.y);
	context.rotate(this.rotation);
	context.scale(this.scaleX, this.scaleY);
	context.lineWidth = this.lineWidth;
	context.fillStyle = this.backcolor;
	context.fillRect(1, 1, this.width, this.height);
	
	context.fillStyle = this.color;
	var i = 0;
	// get each segment for the number
	for(i = 0; i < this.numbers[this.number].length; i++){
		// draw the segment
		//console.log(this.numbers[this.number][i]);
		context.fillRect(this.segments[this.numbers[this.number][i]].x, this.segments[this.numbers[this.number][i]].y, this.segments[this.numbers[this.number][i]].w, this.segments[this.numbers[this.number][i]].h);
		/*console.log(
			this.segments[this.numbers[this.number][i]].x, 
			this.segments[this.numbers[this.number][i]].y, 
			this.segments[this.numbers[this.number][i]].w, 
			this.segments[this.numbers[this.number][i]].h
		);*/
	}
	
	context.restore();
};
