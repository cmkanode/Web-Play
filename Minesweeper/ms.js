/*
Beginner: 8 × 8 or 9 × 9 field with 10 mines
Intermediate: 16 × 16 field with 40 mines
Expert: 30 × 16 field with 99 mines
*/
function Board(){
	// TODO
	this.width = 9;
	this.height = 9;
	this.squareDimension = 40;
	this.mineCount = 10;
	this.grid; // dimensional array
	this.colors = new Array("", "green", "blue", "yellow", "orange", "red", "red", "red", "red");
	this.context;
	this.boardWidth = this.width * this.squareDimension;
	this.boardHeight = (this.height * this.squareDimension) + this.squareDimension;
	this.action = "reveal"; // default action.  Actions: reveal, mark
	this.hasStarted = false; // indicates whether the timer should run.
	this.hasBoom = false; // has a mine been set off?
	//this.Difficulty(nDifficulty);
}
Board.prototype.Width = function(nWidth) { this.width = nWidth; }
Board.prototype.Height = function(nHeight) { this.height = nHeight; }
Board.prototype.MineCount = function(nMineCount) { this.mineCount = nMineCount; }
Board.prototype.Difficulty = function(nDifficulty) {
	if(nDifficulty == 2){
		this.width = 16;
		this.height = 16;
		this.mineCount = 40;
	}else if(nDifficulty == 3){
		this.width = 30;
		this.height = 16;
		this.mineCount = 99;
	}else{
		this.width = 9;
		this.height = 9;
		this.mineCount = 10;
	}
	this.boardWidth = this.width * this.squareDimension;
	this.boardHeight = (this.height * this.squareDimension) + this.squareDimension;
}
Board.prototype.Custom = function(nWidth, nHeight, nMineCount) {
	this.width = nWidth;
	this.height = nHeight;
	this.mineCount = nMineCount;
}

Board.prototype.init = function(context){
	this.context = context;
	
	this.initMenuBar();
	this.initGrid();
}

Board.prototype.initMenuBar = function(){
	// TODO - set up menu bar at the top
	// timer
	// mine counter subtracts one from total mines for each "marked" square
	// "action" button (shovel or flag)
	// test
	var totalMines = "000" + this.mineCount;
	var arrMines = totalMines.split("");
	arrMines.reverse(); // reverse the order
	
	var segment1 = new SevenSegment();
	segment1.number = arrMines[2];
	segment1.draw(this.context);
	// draw a second one
	var segment2 = new SevenSegment();
	segment2.number = arrMines[1];
	segment2.x = segment1.width;
	segment2.draw(this.context);
	// draw a third one
	var segment3 = new SevenSegment();
	segment3.number = arrMines[0];
	segment3.x = segment2.x + segment2.width;
	segment3.draw(this.context);
	
	// 
}

Board.prototype.initGrid = function(){
	this.grid = new Array(this.height * this.width);
	var rows, cols, i;
	var nX, nY;
	nY = this.squareDimension + (this.squareDimension / 2);
	i = 0;
	for(rows = 0; rows < this.height; rows++){
		nX = 20;
		//this.grid[rows] = new Array();
		for(cols = 0; cols < this.width; cols++){
			this.grid[i] = {x: nX, y: nY, hasMine: false, neighborMines: 0, isRevealed: false };
			//this.grid[rows][cols] = {x: nX, y: nY, hasMine: false, neighborMines: 0};
			var square = new Square();
			square.draw(nX, nY, this.context, true);
			nX += this.squareDimension;
			i++;
		}
		nY += this.squareDimension;
	}
	
	this.setMines();
}

Board.prototype.setMines = function(){
	//alert(this.getRandom());
	//*
	var numOfMines = 0;
	var target = 0;
	//var arrSquares = new Array(this.width * this.height);
	//for(i = 0; i < this.grid.length; i++){ this.grid[i] = 0; }
	// we need to randomly assign mines
	while(numOfMines < this.mineCount){
		target = this.getRandom();
		if(this.grid[target].hasMine == false){
			this.grid[target].hasMine = true;
			numOfMines++;
			//var mine = new Mine();
			//mine.draw(this.grid[target].x, this.grid[target].y, context);
			this.updateNeighbors(target)
		}
	}
	//*/
	//this.outputLabels(context);
}

Board.prototype.updateNeighbors = function(nMine){
	if(nMine >= 0 && nMine < this.grid.length){
		// update mine count for the 8 neighbors
		// mines on edges will have less neighbors.
		var mod = nMine % this.width; 
		
		if(nMine < this.width){
			// on first row
			this.grid[nMine+this.width].neighborMines++;
			if(nMine > 0){ 
				this.grid[nMine-1].neighborMines++;
				this.grid[nMine+this.width-1].neighborMines++; 
			}
			if(nMine < (this.width - 1)){ 
				this.grid[nMine+1].neighborMines++;
				this.grid[nMine+this.width+1].neighborMines++; 
			}
		}
		else if(nMine >= (this.grid.length - this.width)){
			// on last row
			this.grid[nMine-this.width].neighborMines++;
			if(nMine > (this.grid.length - this.width)){ 
				this.grid[nMine-1].neighborMines++;
				this.grid[nMine-this.width-1].neighborMines++; 
			}
			if(nMine < (this.grid.length - 1)){ 
				this.grid[nMine+1].neighborMines++;
				this.grid[nMine-this.width+1].neighborMines++; 
			}
		}
		else {
			// all others
			//*
			this.grid[nMine-this.width].neighborMines++;
			this.grid[nMine+this.width].neighborMines++;
			if((mod) > 0){
				this.grid[nMine-1].neighborMines++;
				this.grid[nMine-this.width-1].neighborMines++;
				this.grid[nMine+this.width-1].neighborMines++;
			}
			if(mod < (this.width-1)){
				this.grid[nMine+1].neighborMines++;
				this.grid[nMine-this.width+1].neighborMines++;
				this.grid[nMine+this.width+1].neighborMines++;
			}
			//*/
		}
	}
}

Board.prototype.outputLabels = function(){
	for(i = 0; i < this.grid.length; i++){
		if(this.grid[i].neighborMines > 0 && !this.grid[i].hasMine){
			this.context.font = "12pt Arial";
			// textAlign aligns text horizontally relative to placement
			this.context.textAlign = "center";
			// textBaseline aligns text vertically relative to font style
			this.context.textBaseline = "middle";
			this.context.fillStyle = "blue";
			this.context.fillText(this.grid[i].neighborMines, this.grid[i].x, this.grid[i].y);
		}
	}
}

Board.prototype.getRandom = function(){
	return num = Math.floor(Math.random() * (this.width * this.height)); // returns number between 0 and 1
}

Board.prototype.revealSquare = function(nX, nY){
	// TODO
	// I still need to handle a couple of other buttons,
	// but for the moment, I'll stop this function if a mine is set off.
	if(this.hasBoom){ return; }
	//console.log(nX + " x " + nY);
	var foundSquare = false;
	var target = -1;
	var xMin, xMax, yMin, yMax;
	var modifier = this.squareDimension / 2;
	for(i = 0; i < this.grid.length; i++){
		//console.log("grid[" + i + "]: " + this.grid[i].x + " x " + this.grid[i].y);
		xMin = this.grid[i].x - modifier;
		xMax = this.grid[i].x + modifier;
		if(nX > xMin && nX < xMax){
			//console.log("grid[" + i + "]: " + this.grid[i].x + " x " + this.grid[i].y);
			yMin = this.grid[i].y - modifier;
			yMax = this.grid[i].y + modifier;
			if(nY > yMin && nY < yMax){
				foundSquare = true;
				target = i;
				break;
			}
		}
	}
	if(foundSquare && !this.grid[i].isRevealed){
		this.discover(i);
	}
}

Board.prototype.discover = function(target){
	if(!this.hasStarted){
		// start timer
		this.hasStarted = true;
	}
	if(!this.grid[target].isRevealed){
		var square = new Square();
		square.draw(this.grid[target].x, this.grid[target].y, this.context, false);
		this.grid[target].isRevealed = true;
		if(this.grid[target].hasMine){
			var mine = new Mine();
			mine.x = this.grid[target].x;
			mine.y = this.grid[target].y;
			mine.draw(this.context);
			this.hasBoom = true; // explode that sucker!
		}else if(this.grid[target].neighborMines > 0){
			this.context.font = "12pt Arial";
			// textAlign aligns text horizontally relative to placement
			this.context.textAlign = "center";
			// textBaseline aligns text vertically relative to font style
			this.context.textBaseline = "middle";
			this.context.fillStyle = this.colors[this.grid[target].neighborMines];
			this.context.fillText(this.grid[target].neighborMines, this.grid[target].x, this.grid[target].y);
		}else{
			// not a mine, and no neighboring mines
			this.discoverNeighbors(target);
		}
	}
}

Board.prototype.discoverNeighbors = function(target){
	var mod = target % this.width; 
	
	if(target < this.width){
		// on first row
		if(!this.grid[target+this.width].isRevealed) { this.discover(target+this.width); }
		if(target > 0){ 
			if(!this.grid[target-1].isRevealed) { this.discover(target-1); }
			if(!this.grid[target+this.width-1].isRevealed) { this.discover(target+this.width-1);}
		}
		if(target < (this.width - 1)){ 
			if(!this.grid[target+1].isRevealed) { this.discover(target+1); }
			if(!this.grid[target+this.width+1].isRevealed) { this.discover(target+this.width+1); }
		}
	}
	else if(target >= (this.grid.length - this.width)){
		// on last row
		if(!this.grid[target-this.width].isRevealed) { this.discover(target-this.width); }
		if(target > (this.grid.length - this.width)){ 
			if(!this.grid[target-1].isRevealed) { this.discover(target-1); }
			if(!this.grid[target-this.width-1].isRevealed) { this.discover(target-this.width-1); }
		}
		if(target < (this.grid.length - 1)){ 
			if(!this.grid[target+1].isRevealed) { this.discover(target+1); }
			if(!this.grid[target-this.width+1].isRevealed) { this.discover(target-this.width+1); }
		}
	}
	else {
		// all others
		//*
		if(!this.grid[target-this.width].isRevealed) { this.discover(target-this.width); }
		if(!this.grid[target+this.width].isRevealed) { this.discover(target+this.width); }
		if((mod) > 0){
			if(!this.grid[target-1].isRevealed) { this.discover(target-1); }
			if(!this.grid[target-this.width-1].isRevealed) { this.discover(target-this.width-1); }
			if(!this.grid[target+this.width-1].isRevealed) { this.discover(target+this.width-1); }
		}
		if(mod < (this.width-1)){
			if(!this.grid[target+1].isRevealed) { this.discover(target+1); }
			if(!this.grid[target-this.width+1].isRevealed) { this.discover(target-this.width+1); }
			if(!this.grid[target+this.width+1].isRevealed) { this.discover(target+this.width+1); }
		}
		//*/
	}
}







