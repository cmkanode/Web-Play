//
/*
Author: Christopher Kanode
License: MIT
Purpose:  Just having some fun with JavaScript to see if I could write a
    version of Minesweeper.
*/
window.onload = function () {
/******************************************************************************/
	document.getElementById("easy").onclick = function(){ start(1); };
	document.getElementById("medium").onclick = function(){ start(2); };
	document.getElementById("hard").onclick = function(){ start(3); };
	
	var grid = [];
	var gridRows = 16;
	var gridColumns = 30;
	var numberOfMines = 99;
	
	var square = { x1: 0, x2: 39, y1: 0, y2: 39, state: "C" };
	var x = 0; // column position
	var y = 0; // row position
	var hw = 40; // height and width of the square
	var unmarkedMines = numberOfMines;
	var totalCovered = gridRows * gridColumns;
	
	var oCounter = document.getElementById("minecounter");
	var oToolbar = document.getElementById("toolbar");
	var oTimer = document.getElementById("timer");
	
	var IntervalID;
	var elapsedTime = 0;
	var timeStarted = false;
	var hasBoom = false;
	var doDig = true;
	
	var oDig = document.getElementById("dig");
	var oFlag = document.getElementById("flag");
	var oReset = document.getElementById("reset");
	
	function start(nDifficulty){
		document.getElementById("gameChoices").className = "hide";
		document.getElementById("gameArea").className = "";
		if(nDifficulty == 2){
			gridRows = 16;
			gridColumns = 16;
			numberOfMines = 40;
		}else if(nDifficulty == 3){
			gridRows = 16;
			gridColumns = 30;
			numberOfMines = 99;
		}else{
			gridRows = 9;
			gridColumns = 9;
			numberOfMines = 10;
		}
		unmarkedMines = numberOfMines;
		
		oToolbar.setAttribute("colspan", gridColumns);
		
		initGrid(); // initialize the grid
		setMines(); // seed the mine field
		initDisplay(); // create the view
	}
	
	function resetGame(){
		grid = []; // reset the grid
		initGrid(); // initialize it
		setMines(); // seed mines
		unmarkedMines = numberOfMines;
		clearInterval(IntervalID);
		timeStarted = false;
		elapsedTime = 0;
		hasBoom = false;
		doDig = true;
		oDig.className = "activeButton";
		oFlag.className = "";
		oCounter.innerHTML = unmarkedMines;
		totalCovered = gridRows * gridColumns;
		oTimer.innerHTML = 0;
		// reset display
		for(r = 0; r < gridRows; r++){
			for(c = 0; c < gridColumns; c++){
				var oT = document.getElementById(r + "x" + c);
				oT.className = "";
				oT.innerHTML = "&nbsp;";
			}
		}
	}
	
	function initGrid(){
		for(r = 0; r < gridRows; r++){
			// rows
			x = 0; // column position resets after each row is created
			var row = []; // create new row
			for(c = 0; c < gridColumns; c++){
				// columns
				// square: {x1, x2, y1, y2, state}
				var s = {
					x1: x,
					x2: x + (hw-1), // zero-based, so take away one.
					y1: y,
					y2: y + (hw-1), // zero-based
					hasMine: false,
					neighborMines: 0, 
					isRevealed: false,
					isFlagged: false,
				};
				row.push(s);
				x += hw; // increment to the next column position
			}
			grid.push(row);
			y += hw; // increment to the next row position
		}
	}
	
	function setMines(){
		var tempMines = numberOfMines;
		while(tempMines > 0){
			var nRow = Math.floor(Math.random() * gridRows);
			var nCol = Math.floor(Math.random() * gridColumns);
			//num = Math.floor(Math.random() * (this.width * this.height)); // returns number between 0 and 1
			if(!grid[nRow][nCol].hasMine){
				grid[nRow][nCol].hasMine = true;
				// update neighbours
				/*
					***  [-1,-1][-1, 0][-1, 1]
					*X*  [ 0,-1][ 0, 0][ 0, 1]
					***  [ 1,-1][ 1, 0][ 1, 1]
				*/
				// New section: see if this works
				// Previous Row
				if((nRow-1) >= 0){
					if((nCol-1) >= 0){ grid[nRow-1][nCol-1].neighborMines++; }
					grid[nRow-1][nCol].neighborMines++;
					if((nCol+1) < gridColumns){ grid[nRow-1][nCol+1].neighborMines++; }
				}
				// Current Row
				if((nCol-1) >= 0){ grid[nRow][nCol-1].neighborMines++; }
				if((nCol+1) < gridColumns){ grid[nRow][nCol+1].neighborMines++; }
				// Next Row
				if((nRow+1) < gridRows){
					if((nCol-1) >= 0){ grid[nRow+1][nCol-1].neighborMines++; }
					grid[nRow+1][nCol].neighborMines++;
					if((nCol+1) < gridColumns){ grid[nRow+1][nCol+1].neighborMines++; }
				}
				// decrement mine count
				tempMines--;
			}
		}
	}
	
	function initDisplay(){
		// Let's output the grid to a table and see what we've got.
		var oTable = document.getElementById("tableGrid");
		for(r = 0; r < gridRows; r++){
		var oTR = document.createElement("tr");
		for(c = 0; c < gridColumns; c++){
			var oTD = document.createElement("td");
			oTD.id = r + "x" + c;
			oTD.setAttribute("row", r);
			oTD.setAttribute("column", c);
			oTD.onclick = function(){
				discover(this);
			}
			oTD.innerHTML = "&nbsp;";

			oTR.appendChild(oTD);
		}
		oTable.appendChild(oTR);
		
		oCounter.innerHTML = unmarkedMines;
		oDig.className = "activeButton";
		oDig.onclick = function(){
			if(!doDig){
				toggleButtons();
			}
		}
		oFlag.onclick = function(){
			if(doDig){
				toggleButtons();
			}
		}
		oReset.onclick = function(){
			resetGame();
		}
	}
	
	
	function toggleButtons(){
		if(hasBoom){ return; }
		if(doDig){
			doDig = false;
			oDig.className = "";
			oFlag.className = "activeButton";
		}else{
			doDig = true;
			oDig.className = "activeButton";
			oFlag.className = "";
		}
	}
	
	function discover(oT){
		if(hasBoom){ return; }
		if(!timeStarted){
			timeStarted = true;
			startTimer();
		}
		//if(oT == null || typeof oT == "undefined"){ return; }
		// Uncover the square.  This is part of the discoverNeighbors procedure
		s = grid[oT.getAttribute("row")][oT.getAttribute("column")];
		if(!doDig && !s.isRevealed){
			// flag the square (or unflag it).
			// TODO: Increment/decrement mine count
			if(oT.innerHTML == "f"){
				oT.innerHTML = "";
				s.isFlagged = false;
				unmarkedMines++;
			}else{
				oT.innerHTML = "f";
				s.isFlagged = true;
				unmarkedMines--;
			}
			oCounter.innerHTML = unmarkedMines;
			if(unmarkedMines == 0){
				validateFlags();
			}
			return;
		}else if(!s.isRevealed && !s.isFlagged){
			// square has just be revealed
			s.isRevealed = true;
			oT.className = "uncovered";
			if(s.hasMine){
				// BOOM!
				oT.innerHTML = "*";
				oT.className += " boom";
				Boom();
			}else{
				if(s.neighborMines > 0){
					oT.innerHTML = s.neighborMines;
					oT.className += " " + getColor(s.neighborMines);
				}else{
					// no mines, not adjacent to a mine
					discoverNeighbors(oT);
				}
				totalCovered--; // decrement the count
				if(totalCovered == numberOfMines){
					youWin();
				}
			}
		}
	}
	
	function discoverNeighbors(oX){
		var row = Math.abs(oX.getAttribute("row"));
		var col = Math.abs(oX.getAttribute("column"));
		var pR = row - 1; 
		var nR = row + 1;
		var pC = col - 1;
		var nC = col + 1;
		
		//msg(row + "x" + col + "; " + gridRows + " x " + gridColumns + "; next Row: " + nR);
		// previous row
		if(pR >= 0){  
			discover(document.getElementById(pR + "x" + col));
			if(pC >= 0){ discover(document.getElementById(pR + "x" + pC)); } 
			if(nC < gridColumns){ discover(document.getElementById(pR + "x" + nC)); } 
		}
		// next row 
		if(nR < gridRows){ 
			discover(document.getElementById(nR + "x" + col)); 
			if(pC >= 0){ discover(document.getElementById(nR + "x" + pC)); } 
			if(nC < gridColumns){ discover(document.getElementById(nR + "x" + nC)); } 
		}
		// current row
		if(pC >= 0){ // previous column 
			discover(document.getElementById(row + "x" + pC)); 
		}
		if(nC < gridColumns){ // next column
			discover(document.getElementById(row + "x" + nC)); 
		}
	} 
	
	function Boom(){
		hasBoom = true;
		clearInterval(IntervalID);
		oDig.className = "";
		oFlag.className = "";
		
		// uncover all hidden mines
		for(r = 0; r < gridRows; r++){
			for(c = 0; c < gridColumns; c++){
				if(grid[r][c].hasMine && !grid[r][c].isRevealed){
					var s = document.getElementById(r + "x" + c);
					s.className = "uncovered";
					s.innerHTML = "*";
				}
			}
		}
	}
	
	function validateFlags(){
		// TODO:
		// - Check all squares to see if marked mines are correct.
		// if correct, end the game.
		//* Disabling this.  We shouldn't end the game until all squares are either all non-mine-bearing squares are cleared.
		var r, c, ckMines, s;
		ckMines = 0;
		for(r = 0; r < gridRows; r++){
			for(c = 0; c < gridColumns; c++){
				s = grid[r][c];
				if(s.isFlagged && !s.hasMine){
					return;
				}else if(s.isFlagged && s.hasMine){
					ckMines++; // count the number of marked mines
				}
			}
		}
		youWin();
		//*/
	}
	
	function youWin(){
		clearInterval(IntervalID);
		oDig.className = "";
		oFlag.className = "";
		alert("You Win!");
	}
	
	function msg(m){
		console.log(m);
	}
	
	function getColor(nC){
		var color = "";
		switch(nC){
			case 1:
				color = "green";
				break;
			case 2: 
				color = "blue";
				break;
			case 3:
				color = "yellow";
				break;
			case 4:
				color = "orange";
				break;
			default:
				color = "red";
				break;	
		}
		return color;
	}
	
	function startTimer(){
		IntervalID = setInterval(function(){ 
			elapsedTime++;
			oTimer.innerHTML = elapsedTime;
		}, 1000); // time in milliseconds
	}
}

/******************************************************************************/
}