// Game state
var tetris = {};
tetris.start = false;
tetris.pause = false;
tetris.speed = 0;
tetris.score;

var gravity, delay, bottom;
var mobile = false;

// Blocks and orientations
var I = [{row: 0, col: -1}, {row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}];
var I90 = [{row: -1, col: 0}, {row: 0, col: 0}, {row: 1, col:0}, {row: 2, col: 0}];

var J = [{row: -1, col: -1}, {row: 0, col: -1}, {row: 0, col: 0}, {row: 0, col: 1}];
var J90 = [{row: -1, col: 0}, {row: -1, col: 1}, {row: 0, col: 0}, {row: 1, col: 0}];
var J180 = [{row: 0, col: -1}, {row: 0, col: 0}, {row: 0, col: 1}, {row: 1, col: 1}];
var J270 = [{row: -1, col: 0}, {row: 0, col: 0}, {row: 1, col: -1}, {row: 1, col: 0}];

var L = [{row: -1, col: 1}, {row: 0, col: -1}, {row: 0, col: 0}, {row: 0, col: 1}];
var L90 = [{row: -1, col: 0}, {row: 0, col: 0}, {row: 1, col: 0}, {row: 1, col: 1}];
var L180 = [{row: 0, col: -1}, {row: 0, col: 0}, {row: 0, col: 1}, {row: 1, col: -1}];
var L270 = [{row: -1, col: -1}, {row: -1, col: 0}, {row: 0, col: 0}, {row: 1, col: 0}];

var O = [{row: -1, col: 0}, {row: -1, col: 1}, {row: 0, col: 0}, {row: 0, col: 1}];

var S = [{row: -1, col: 0}, {row: -1, col: 1}, {row: 0, col: -1}, {row: 0, col: 0}];
var S90 = [{row: -1, col: 0}, {row: 0, col: 0}, {row: 0, col: 1}, {row: 1, col: 1}];

var T = [{row: 0, col: -1}, {row: 0, col: 0}, {row: 0, col: 1}, {row: -1, col: 0}];
var T90 = [{row: -1, col: 0}, {row: 0, col: 0}, {row: 0, col: 1}, {row: 1, col: 0}];
var T180 = [{row: 0, col: -1}, {row: 0, col: 0}, {row: 0, col: 1}, {row: 1, col: 0}];
var T270 = [{row: -1, col: 0}, {row: 0, col: -1}, {row: 0, col: 0}, {row: 1, col: 0}];

var Z = [{row: -1, col: -1}, {row: -1, col: 0}, {row: 0, col: 0}, {row: 0, col: 1}];
var Z90 = [{row: -1, col: 1}, {row: 0, col: 0}, {row: 0, col: 1}, {row: 1, col: 0}];

// Default grid color and background
var defaultColor = "#3e3e3e";
var defaultBG;

tetris.initiateGrid = function() {
	for (var i = 0; i < 20; i++) {
		for (var j = 0; j < 10; j++) {
			var rowClass = "r" + i;
			document.getElementsByClassName(rowClass)[j].style.backgroundColor = defaultColor;
		}
	}

	defaultBG = String(document.getElementsByClassName("r0")[0].style.backgroundColor);
}

tetris.fillCells = function(array, color) {
	for (var i = 0; i < array.length; i++) {
		var row = array[i].row + this.row;
		if (row >= 0) {
			var rowClass = "r" + row;
			var col = array[i].col + this.col;
			var cell = document.getElementsByClassName(rowClass)[col];
			cell.style.backgroundColor = color;
		}
	}
}

tetris.isValidMove = function() {
	for (var i = 0; i < this.block.array.length; i++) {
		var row = this.block.array[i].row + this.row;
		var col = this.block.array[i].col + this.col;

		// Bounds check
		if (row > 19 || col < 0 || col > 9) {
			return false;
		}
		
		// Overlap check
		if (row >= 0) {
			var rowClass = "r" + row;
			var currentBG = document.getElementsByClassName(rowClass)[col].style.backgroundColor;
			if (currentBG != defaultBG) {
				return false;
			}
		}
	}

	return true;
}

tetris.findFullRows = function() {
	for (var i = 0; i < 20; i++) {
		var rowClass = "r" + i;
		var full = true;

		for (var j = 0; j < 10; j++) {
			if (document.getElementsByClassName(rowClass)[j].style.backgroundColor == defaultBG) {
				full = false;
			}
		}

		if (full == true) {
			tetris.updateScore();

			// Shift rows down
			for (var k = i; k > 0; k--) {
				var prevRow = k - 1;
				var prevRowClass = "r" + prevRow; 
				var newRowClass = "r" + k;

				for (var l = 0; l < 10; l++) {
					var prevColor = document.getElementsByClassName(prevRowClass)[l].style.backgroundColor;
					document.getElementsByClassName(newRowClass)[l].style.backgroundColor = prevColor;
				}
			}
		}

	}
}

tetris.updateScore = function() {
	this.score += 100; 
	var scoreString = "Score: " + this.score;
	document.getElementById("score").innerHTML = scoreString;

	// Speed increases for every 20 lines cleared
	if (this.score % 2000 == 0 && this.score != 0) {
		if (this.speed > 500) {
			this.speed -= 100;
		} else if (this.speed > 50 && this.speed <= 500) {
			this.speed -= 50;
		}

		// Reset gravity and delay 
		clearInterval(gravity);
		clearInterval(delay);
		gravity = setInterval(function() { 
			if (tetris.move("down") == false) {
				bottom = true;

				if (tetris.row == 0) {
					tetris.gameOver();
				}
			} 
		}, tetris.speed);

		delay = setInterval(function() {
			if (bottom == true) {
				tetris.playBlock(); 
				bottom = false;
			}
		}, Math.min(500, tetris.speed * 2));
	}
}

tetris.move = function(direction) {
	this.fillCells(this.block.array, defaultColor);

	if (direction == "left") {
		this.col--;
	} else if (direction == "right") {
		this.col++;
	} else if (direction == "down") {   
		this.row++;
	}

	// Reverse effects
	if (this.isValidMove() == false) {
		if (direction == "left") {
			this.col++;
		} else if (direction == "right") {
			this.col--;
		} else if (direction == "down") {
			this.row--;
		}

		this.fillCells(this.block.array, this.block.color);
		return false;
	}

	this.fillCells(this.block.array, this.block.color);
	return true;
}

tetris.chooseBlock = function(centerRow, centerCol) {
	var num = Math.floor((Math.random() * 7) + 1);
	this.row = centerRow;
	this.col = centerCol;
	this.block = {};

	// Randomly generate number for block 
	switch (num) {
		case 1:  // I block
			this.block.array = I;
			this.block.color = "#00ffff";
			this.block.name = "I";
  			break;
		case 2:  // J block
			this.block.array = J;
			this.block.color = "#0000cc";
			this.block.name = "J";
			break;
		case 3:  // L block
			this.block.array = L;
			this.block.color = "#ff9900";
			this.block.name = "L";
			break;
		case 4:  // O block
			this.block.array = O;
			this.block.color = "#ffff00";
			this.block.name = "O";
			break;
		case 5: // S block
			this.block.array = S;
			this.block.color = "#00ff00";
			this.block.name = "S";
			break;
		case 6: // T block
			this.block.array = T;
			this.block.color = "#9900cc";
			this.block.name = "T";
			break;
		case 7: // Z block
			this.block.array = Z;
			this.block.color = "#ff0000";
			this.block.name = "Z";
			break;
	}
}

tetris.rotate = function() {
	this.fillCells(this.block.array, defaultColor);
	var firstLetter = this.block.name.substring(0, 1);
	var prevBlock = this.block.array, prevName = this.block.name;

	if (firstLetter == "I") {
		if (this.block.name.length == 1) {
			this.block.array = I90;
			this.block.name = "I90";
		} else {
			this.block.array = I;
			this.block.name = "I";
		}
	} else if (firstLetter == "J") {
		if (this.block.name.length == 1) {
			this.block.array = J90;
			this.block.name = "J90";
		} else if (this.block.name == "J90") {
			this.block.array = J180;
			this.block.name = "J180";
		} else if (this.block.name == "J180") {
			this.block.array = J270;
			this.block.name = "J270";
		} else {
			this.block.array = J;
			this.block.name = "J";
		}
	} else if (firstLetter == "L") {
		if (this.block.name.length == 1) {
			this.block.array = L90;
			this.block.name = "L90";
		} else if (this.block.name == "L90") {
			this.block.array = L180;
			this.block.name = "L180";
		} else if (this.block.name == "L180") {
			this.block.array = L270;
			this.block.name = "L270";
		} else {
			this.block.array = L;
			this.block.name = "L";
		}
	} else if (firstLetter == "S") {
		if (this.block.name.length == 1) {
			this.block.array = S90;
			this.block.name = "S90";
		} else {
			this.block.array = S;
			this.block.name = "S";
		}
	} else if (firstLetter == "T") {
		if (this.block.name.length == 1) {
			this.block.array = T90;
			this.block.name = "T90";
		} else if (this.block.name == "T90") {
			this.block.array = T180;
			this.block.name = "T180";
		} else if (this.block.name == "T180") {
			this.block.array = T270;
			this.block.name = "T270";
		} else {
			this.block.array = T;
			this.block.name = "T";
		}
	} else if (firstLetter == "Z") {
		if (this.block.name.length == 1) {
			this.block.array = Z90;
			this.block.name = "Z90";
		} else {
			this.block.array = Z;
			this.block.name = "Z";
		}
	}

	// Reverse effects
	if (this.isValidMove() == false) {
		this.block.array = prevBlock;
		this.block.name = prevName;
	}

	this.fillCells(this.block.array, this.block.color);
}

tetris.playBlock = function() {
	this.findFullRows();
	this.chooseBlock(0, 4);
	this.fillCells(this.block.array, this.block.color);
}

tetris.playGame = function() {
	if (this.start == false) {
		this.start = true;
		this.score = 0;
		this.initiateGrid();
		this.playBlock();

		document.getElementById("score").innerHTML = "Score: 0";

		// Option for speed
		while (this.speed < 500 || this.speed > 1000 || isNaN(this.speed) == true) {
			this.speed = parseInt(window.prompt("Input a starting speed in milliseconds (500-1000): "));
		}

		bottom = false; 

		gravity = setInterval(function() { 
			if (tetris.move("down") == false) {
				bottom = true;

				if (tetris.row == 0) {
					tetris.gameOver();
				}
			} 
		}, tetris.speed);

		delay = setInterval(function() {
			if (bottom == true) {
				tetris.playBlock(); 
				bottom = false;
			}
		}, Math.min(500, tetris.speed * 2));
	}
}

tetris.pauseGame = function() {
	if (this.start == true) {
		if (this.pause == true) {
			this.pause = false;
			document.getElementById("pausebutton").innerHTML = "Pause";

			gravity = setInterval(function() { 
				if (tetris.move("down") == false) {
					bottom = true;

					if (tetris.row == 0) {
						tetris.gameOver();
					}
				} 
			}, tetris.speed);

			delay = setInterval(function() {
				if (bottom == true) {
					tetris.playBlock(); 
					bottom = false;
				}
			}, Math.min(500, tetris.speed * 2));
		} else {
			this.pause = true;
			document.getElementById("pausebutton").innerHTML = "Resume";
			clearInterval(gravity);
			clearInterval(delay);
		}
	}
}

tetris.gameOver = function() {
	clearInterval(gravity);
	clearInterval(delay);
	this.start = false;
	this.speed = 0;

	if (confirm("Game over! Would you like to play again?")) {
		tetris.playGame();
	} else {
		alert("Thanks for playing! :-)");
	}
}

document.onkeydown = function() {
	switch (window.event.keyCode) {
		case 32: // Space key
			if (tetris.pause == false && tetris.start == true) {
				window.event.preventDefault();
				tetris.fillCells(tetris.block.array, defaultColor);

				var prevRow, currentRow = tetris.row;
				while (currentRow != prevRow) {
					prevRow = currentRow;
					tetris.move("down");
					currentRow = tetris.row;
				}

				tetris.playBlock();
			}
			break;
		case 37: // Left key 
			if (tetris.pause == false && tetris.start == true) {
				window.event.preventDefault();
				tetris.move("left");
			}
			break;
		case 38: // Up key
			if (tetris.pause == false && tetris.start == true) {
				window.event.preventDefault();
				tetris.rotate();
			}
			break;
		case 39: // Right key
			if (tetris.pause == false && tetris.start == true) {
				window.event.preventDefault();
				tetris.move("right");
			}
			break;
		case 40: // Down key
			if (tetris.pause == false && tetris.start == true) {
				window.event.preventDefault();
				tetris.move("down");
			}
			break;
		case 80: // P key
			if (tetris.start == true) {
				tetris.pauseGame();
				break;
			}
		case 83: // S key
			tetris.playGame();
			break;
	}
}

// Responses to button clicks
function start() {
	tetris.playGame();
}

function pause() {
	tetris.pauseGame();
}

// Responses for mobile device buttons
function revealControls() {
	if (mobile == false) {
		document.getElementById("uparrow").style.visibility = "visible";
		document.getElementById("leftarrow").style.visibility = "visible";
		document.getElementById("rightarrow").style.visibility = "visible";
		document.getElementById("downarrow").style.visibility = "visible";
		document.getElementById("spacebar").style.visibility = "visible";

		mobile = true;
	} else {
		document.getElementById("uparrow").style.visibility = "hidden";
		document.getElementById("leftarrow").style.visibility = "hidden";
		document.getElementById("rightarrow").style.visibility = "hidden";
		document.getElementById("downarrow").style.visibility = "hidden";
		document.getElementById("spacebar").style.visibility = "hidden";

		mobile = false;
	}
}

function drop() {
	if (tetris.pause == false && tetris.start == true) {
		tetris.fillCells(tetris.block.array, defaultColor);

		var prevRow, currentRow = tetris.row;
		while (currentRow != prevRow) {
			prevRow = currentRow;
			tetris.move("down");
			currentRow = tetris.row;
		}

		tetris.playBlock();
	}
}

function rotate() {
	if (tetris.pause == false && tetris.start == true) {
		tetris.rotate();
	}
}

function moveRight() {
	if (tetris.pause == false && tetris.start == true) {
		tetris.move("right");
	}
}

function moveLeft() {
	if (tetris.pause == false && tetris.start == true) {
		tetris.move("left");
	}
}

function moveDown() {
	if (tetris.pause == false && tetris.start == true) {
		tetris.move("down");
	}
}