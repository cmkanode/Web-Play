function Mine () {
	this.x = 0;
	this.y = 0;
	this.color = "#000";
	this.radius = 10;
	this.lineWidth = 2;
	this.scaleX = 1;
	this.scaleY = 1;
	this.rotation = 0;
	this.spikes = 1.4;
}
// 20 diameter circle
Mine.prototype.draw = function (context) {
	context.save();
	context.translate(this.x, this.y);
	context.rotate(this.rotation);
	context.scale(this.scaleX, this.scaleY);
	context.lineWidth = this.lineWidth;
	context.fillStyle = this.color;
	context.beginPath();
	// x, y, radius, start_angle, end_angle, anti-clockwise
	context.arc(0, 0, this.radius, 0, (Math.PI * 2), true);
	context.closePath();
	context.fill();
	//if(this.lineWidth > 0){
	//	context.stroke();
	//}
	context.lineWidth = this.lineWidth;
	
	for(i = 0; i < 6; i++){
		context.rotate(45);
		//context.moveTo(0, (0 - this.radius * this.spikes));
		context.moveTo((0 - (this.radius * this.spikes)/2), 0);
		context.lineTo(0, (0 + this.radius * this.spikes));
		context.lineTo((0 + (this.radius * this.spikes)/2), 0);
		//context.lineTo(0, (0 - this.radius * this.spikes));
		context.stroke();
	}

	context.restore();
};