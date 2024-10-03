const startButton = document.querySelector(".start-button");
const boardContainer = document.querySelector(".board-container");
const cellElement = document.querySelectorAll(".cell");


startButton.addEventListener("click", () => startGame());
let game;

addGlobalEventListener("click", ".cell", (e) => {
  const row = e.target.getAttribute("data-row"); 
  const column = e.target.getAttribute("data-column")
  game.playRound(row, column);
});


function addGlobalEventListener(type, selector, callback) {
  document.addEventListener(type, e => {
    if (e.target.matches(selector)) callback(e);
  });
}




// Factory function to create the Gameboard
function Gameboard() {
  const rows = 3;
  const columns = 3;

  // Factory function to create each cell of the board
  function cell() {
    let value = 0; // 0 means empty, "X" or "O" means occupied by a player
    const addToken = (player) => {
      value = player; // Sets the value to the player's symbol
    };
    const getValue = () => value; // Gets the current value of the cell
    return { addToken, getValue }; // Expose addToken and getValue methods
  }

  // Create the 3x3 game board with cells
  const gamefield = [];
  for (let i = 0; i < rows; i++) {
    gamefield[i] = [];
    for (let j = 0; j < columns; j++) {
      gamefield[i].push(cell()); // Each cell is created by the cell factory function
    }
  }

  const getGamefield = () => gamefield; // Method to retrieve the gamefield

  return { getGamefield }; // Expose getGamefield method
}

// Factory function to create the Game Controller
function GameController(playerOneName = "Player One", playerTwoName = "Player Two") {
  const board = Gameboard(); // Create a game board
  const gamefield = board.getGamefield(); // Retrieve the game board

  // Define the two players
  const players = [
    { name: playerOneName, symbol: "X" },
    { name: playerTwoName, symbol: "O" },
  ];

  let activePlayer = players[0]; // Start with the first player

  // Switch active player between Player One and Player Two
  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  // Display the current state of the game board in the console
  const displayBoard = () => {
    const boardContainer = document.querySelector('.board-container')
   boardContainer.innerHTML =  gamefield.map((row, rowIndex ) => {
      return `<div class="row">${row.map((cell, columnIndex) => `<div class="cell" data-row="${rowIndex}" data-column="${columnIndex}">${cell.getValue() || "_"}</div>`).join("")}</div>`;
  }).join("");
    
};


  // Check if the current player has won
  const checkWin = () => {
    const winningCombinations = [
      // Rows
      [[0, 0], [0, 1], [0, 2]],
      [[1, 0], [1, 1], [1, 2]],
      [[2, 0], [2, 1], [2, 2]],
      // Columns
      [[0, 0], [1, 0], [2, 0]],
      [[0, 1], [1, 1], [2, 1]],
      [[0, 2], [1, 2], [2, 2]],
      // Diagonals
      [[0, 0], [1, 1], [2, 2]],
      [[0, 2], [1, 1], [2, 0]],
    ];

    return winningCombinations.some(combination => {
      const [a, b, c] = combination;
      return (
        gamefield[a[0]][a[1]].getValue() === activePlayer.symbol &&
        gamefield[b[0]][b[1]].getValue() === activePlayer.symbol &&
        gamefield[c[0]][c[1]].getValue() === activePlayer.symbol
      );
    });
  };

  // Drop a token on the board at the specified location
  const dropToken = (row, column) => {
    const selectedCell = gamefield[row][column];
    if (selectedCell.getValue() === 0) { // Check if the cell is empty
      selectedCell.addToken(activePlayer.symbol); // Place the active player's symbol
      displayBoard(); 
      if (checkWin()) {
        console.log(`${activePlayer.name} wins!`);
        return true; // Return true if the player has won
      } else {
        switchPlayerTurn(); // Switch turns if no one has won
      }
    } else {
      console.log("Cell already occupied. Try again.");
    }
    return false; // Return false if the game is not over
  };

  // Method to handle a round of play
  const playRound = (row, column) => {
    return dropToken(row, column); // Drop the token and check for game over
  };

  return { playRound, displayBoard, activePlayer }; // Expose playRound, displayBoard, and activePlayer
}

// Function to start the game
function startGame(e) {
  game = GameController(); // Initialize the game controller
  let gameOver = false; 
  game.displayBoard();
  
}

 // Ui starts here
 
