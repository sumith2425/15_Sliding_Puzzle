
(
	function(){
		const timeDisplay = document.querySelector("#time");
		const movesDisplay = document.querySelector("#moves");
		let startTime = 0;
		let elapsedTime = 0;
		let pause=false;
		let intervalId;
		let hrs = 0;
		let mins = 0;
		let secs = 0;
		let moves=0
		movesDisplay.textContent=moves;
		// localStorage.removeItem("bestTime");
		function startTimer(){
			if(!pause){
				startTime = Date.now();
				intervalId = setInterval(updateTime, 1000);
			};
		}

		function updateTime(){
			elapsedTime = Date.now() - startTime;
			displaytime();
			timeDisplay.textContent = `${hrs}:${mins}:${secs}`;
		}

		function displaytime(){
			secs = Math.floor((elapsedTime / 1000) % 60);
			mins = Math.floor((elapsedTime / (1000 * 60)) % 60);
			hrs = Math.floor((elapsedTime / (1000 * 60 * 60)) % 60);

			secs = pad(secs);
			mins = pad(mins);
			hrs = pad(hrs);


			function pad(unit){
				return (("0") + unit).length > 2 ? unit : "0" + unit;
			}
		}

		var state = 1;
		var game = document.getElementById('game');
		// Creates solved game
		solve();
		scramble();
		
		// Listens for click on game cells
		game.addEventListener('click', function(e){
			if(state == 1){
				// Enables sliding animation
				game.className = 'animate';
				shiftCell(e.target);
			}
		});
		
		// Listens for click on control buttons
		document.getElementById('scramble').addEventListener('click',  function(){
			state=1;
			scramble();
		});

		function abs(a){
			if(a<0)return -a;
			return a;
		}
		/**
		 * Creates solved game
		 *
		 */
		function solve(){
			
			if(state == 0){
				return;
			}
			
			game.innerHTML = '';
			
			var n = 1;
			for(var i = 0; i <= 3; i++){
				for(var j = 0; j <= 3; j++){
					var cell = document.createElement('span');
					cell.id = 'cell-'+i+'-'+j;
					cell.row=i;
					cell.column=j;
					cell.style.left = (81*j+1)+'px';
					cell.style.top = (81*i+1)+'px';
					
					if(n <= 15){
						cell.classList.add('number');
						cell.classList.add('light');
						cell.innerHTML = (n++).toString();
					} else {
						cell.className = 'empty';
					}
					
					game.appendChild(cell);
				}
			}
			
		}

		/**
		 * Shifts number cell to the empty cell
		 * 
		 */
		function shiftadjCell(cell){
			
			// Checks if selected cell has number
			if(cell.className != 'empty'){
				
				// Tries to get empty adjacent cell
				var emptyCell = getEmptyAdjacentCell(cell);
				
				if(emptyCell){
					// Temporary data
					var tmp = {style: cell.style.cssText, id: cell.id,row: cell.row,col: cell.column};
					
					// Exchanges id and style values
					cell.style.cssText = emptyCell.style.cssText;
					cell.id = emptyCell.id;
					cell.row=emptyCell.row;
					cell.column=emptyCell.column;
					emptyCell.style.cssText = tmp.style;
					emptyCell.id = tmp.id;
					emptyCell.row=tmp.row;
					emptyCell.column=tmp.col;
					
					if(state == 1){
						// Checks the order of numbers
						if(checkOrder()){
							var isbest=(!localStorage.getItem("bestTime"))||(elapsedTime<localStorage.getItem("bestTime"));
							var isbestmoves=(!localStorage.getItem("bestMoves"))||(moves<localStorage.getItem("bestMoves"));
							pause=true;
							clearInterval(intervalId);
							state=0;
							var text = `
								<div>
								You have Solved the Puzzle! 🎉<br>
								Time: ${hrs}:${mins}:${secs}<br>
								Moves: ${moves}
								</div>
								`;
							if(isbest){
								text = `
								<div>
								You have Solved the Puzzle! 🎉<br>
								New Best Time: ${hrs}:${mins}:${secs}<br>
								Moves: ${moves}
								</div>
								`;
								console.log(elapsedTime);
								localStorage.setItem("bestTime",elapsedTime);
							}
							if(isbestmoves){
								localStorage.setItem("bestMoves",moves);
							}
							// console.log(checkOrder())
							Swal.fire({
								background: '',
								icon: "success",
								title: "Congrats!",
								html: text,
								confirmButtonText: "New Game",
								confirmButtonColor: "#3085d6",
								// cancelButtonColor: "#d33",
								// showCancelButton: true,
							}).then((result) => {
								/* Read more about isConfirmed, isDenied below */
								if (result.isConfirmed) {
									state=1;
									scramble();
								} 
							});
						}
					}
				}
			}
			
		}
		console.log(elapsedTime);
		function shiftCell(cell){
			
			// Checks if selected cell has number
			if(cell.className != 'empty'){
				var EmptyCell = getEmptyCell();
				
				if(EmptyCell.row==cell.row||EmptyCell.column==cell.column){
					moves++;
					movesDisplay.textContent=`${moves}`;
					if(EmptyCell.row==cell.row){
						var a=EmptyCell.column-cell.column;
						for(var i=abs(a);i>0;i--){
							var emptyCell = getEmptyCell();
							if(a<0){
								var need = getCell(cell.row,emptyCell.column+1);
							}
							else{
								var need = getCell(cell.row,emptyCell.column-1);
							}
							shiftadjCell(need);
						}
					}
					else if(EmptyCell.column==cell.column){
						var a=EmptyCell.row-cell.row;
						for(var i=abs(a);i>0;i--){
							var emptyCell = getEmptyCell();
							if(a<0){
								var need = getCell(emptyCell.row+1,cell.column);
							}
							else{
								var need = getCell(emptyCell.row-1,cell.column);

							}
							shiftadjCell(need);
						}
					}
				}
				
			}
			
		}

		/**
		 * Gets specific cell by row and column
		 *
		 */
		function getCell(row, col){
		
			return document.getElementById('cell-'+row+'-'+col);
			
		}

		/**
		 * Gets empty cell
		 *
		 */
		function getEmptyCell(){
		
			return game.querySelector('.empty');
				
		}
		
		/**
		 * Gets empty adjacent cell if it exists
		 *
		 */
		function getEmptyAdjacentCell(cell){
			
			// Gets all adjacent cells
			var adjacent = getAdjacentCells(cell);
			
			// Searches for empty cell
			for(var i = 0; i < adjacent.length; i++){
				if(adjacent[i].className == 'empty'){
					return adjacent[i];
				}
			}
			
			// Empty adjacent cell was not found
			return false;
			
		}

		/**
		 * Gets all adjacent cells
		 *
		 */
		function getAdjacentCells(cell){
			
			var id = cell.id.split('-');
			
			// Gets cell position indexes
			var row = parseInt(id[1]);
			var col = parseInt(id[2]);
			
			var adjacent = [];
			
			// Gets all possible adjacent cells
			if(row < 3){adjacent.push(getCell(row+1, col));}			
			if(row > 0){adjacent.push(getCell(row-1, col));}
			if(col < 3){adjacent.push(getCell(row, col+1));}
			if(col > 0){adjacent.push(getCell(row, col-1));}
			
			return adjacent;
			
		}
		
		/**
		 * Chechs if the order of numbers is correct
		 *
		 */
		function checkOrder(){
			
			// Checks if the empty cell is in correct position
			if(getCell(3, 3).className != 'empty'){
				return false;
			}
		
			var n = 1;
			// Goes through all cells and checks numbers
			for(var i = 0; i <= 3; i++){
				for(var j = 0; j <= 3; j++){
					if(n <= 15 && getCell(i, j).innerHTML != n.toString()){
						// Order is not correct
						return false;
					}
					n++;
				}
			}
			return true;
			// game is solved, offers to scramble it
			// if(confirm('Congrats, You did it! \nScramble the game?')){
			// 	scramble();
			// }
		
		}

		/**
		 * Scrambles game
		 *
		 */
		function scramble(){
		
			if(state == 0){
				return;
			}
			
			game.removeAttribute('class');
			state = 0;
			
			var previousCell;
			var i = 1;
			var interval = setInterval(function(){
				if(i <= 1){
					var adjacent = getAdjacentCells(getEmptyCell());
					if(previousCell){
						for(var j = adjacent.length-1; j >= 0; j--){
							if(adjacent[j].innerHTML == previousCell.innerHTML){
								adjacent.splice(j, 1);
							}
						}
					}
					// Gets random adjacent cell and memorizes it for the next iteration
					previousCell = adjacent[rand(0, adjacent.length-1)];
					shiftadjCell(previousCell);
					i++;
				} else {
					clearInterval(interval);
					moves=0;
					clearInterval(intervalId);
					startTime=Date.now();
					updateTime();
					movesDisplay.textContent=moves;
					pause=false;
					startTimer();
					state = 1;
				}
			}, 5);

		}
		
		/**
		 * Generates random number
		 *
		 */
		function rand(from, to){

			return Math.floor(Math.random() * (to - from + 1)) + from;

		}

}());
