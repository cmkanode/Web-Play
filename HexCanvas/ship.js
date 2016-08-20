function Ship () {
	this.x = 0;
	this.y = 0;
	this.color = "#CCCCCC";
	this.rotation = 0;
}

Ship.prototype.draw = function(context) {
	context.save();
	context.translate(this.x, this.y);
	context.rotate(this.rotation);
	
	context.strokeStyle = "#333333";
	
	// wing
	context.lineWidth = 1;
	context.fillStyle = this.color;
	context.beginPath();
	context.moveTo(0, 10);
	context.lineTo(7.5, 2.5);
	context.lineTo(7.5, 0);
	context.lineTo(-7.5, 0);
	context.lineTo(-7.5, 2.5);
	context.lineTo(0, 10);
	context.closePath();
	context.fill();
	context.stroke();
	
	// body
	context.beginPath();
	context.moveTo(0, 10);
	context.lineTo(5, 5);
	context.lineTo(0, -10);
	context.lineTo(-5, 5);
	context.lineTo(0, 10);
	context.closePath();
	context.fill();
	context.stroke();
	
	// left engine
	context.beginPath();
	context.moveTo(-7.5, 5);
	context.lineTo(-10, 5);
	context.lineTo(-10, -5);
	context.lineTo(-7.5, -5);
	context.lineTo(-7.5, 5);
	context.closePath();
	context.fill();
	context.stroke();
	
	context.beginPath();
	context.moveTo(7.5, 5);
	context.lineTo(10, 5);
	context.lineTo(10, -5);
	context.lineTo(7.5, -5);
	context.lineTo(7.5, 5);
	context.closePath();
	context.fill();
	context.stroke();
	
	context.restore();
};