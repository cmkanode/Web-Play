/*
Timer is meant to create a countdown
*/

function Timer(callback){
	this.StartTime = 100; // in seconds
	this.CurrentTime = this.StartTime; // defaults to StartTime
	this.IntervalID = setInterval(function(){ 
			this.CurrentTime--;
			if(this.CurrentTime == 0){
				clearInterval(this.IntervalID);
			}
			callback(); // callback method to update (something)
		}, 1000); // time in milliseconds
}

