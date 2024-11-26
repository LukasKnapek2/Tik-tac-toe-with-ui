const newGameButton = document.querySelector(".newGame-button");
const boardContainer = document.querySelector(".board-container");
const cellElement = document.querySelectorAll(".cell");
const playerOneName = document.querySelector(".player-one");
const playerTwoName = document.querySelector(".player-two");
const informationField = document.querySelector(".information-field");
const footerText = document.querySelector(".footer-text");
const easyBot = document.querySelector(".easy-button");
const hardBot = document.querySelector(".hard-button");
const realPlayerButton = document.querySelector(".real-player-button");
function addPlayerNameListeners() {
  playerOneName.addEventListener("change", () =>
    game.changePlayerName("playerOne", playerOneName.value)
  );
  playerTwoName.addEventListener("change", () =>
    game.changePlayerName("playerTwo", playerTwoName.value)
  );
}

newGameButton.addEventListener("click", () => startGame());

easyBot.addEventListener("click", () => {
  botPlayerState.setBotMode(true, "easy");
  changeActivePlayerMode(easyBot);
  startGame()
  game.changePlayerName("playerTwo", "easy bot")
});
hardBot.addEventListener("click", () => {
  botPlayerState.setBotMode(true, "hard");
  changeActivePlayerMode(hardBot);
  startGame()
});
realPlayerButton.addEventListener("click", () => {
  botPlayerState.setBotMode(false);
  changeActivePlayerMode(realPlayerButton);
  startGame()
});

let game;
function changeActivePlayerMode(selectedButton) {
  realPlayerButton.classList.remove("is-active");
  hardBot.classList.remove("is-active");
  easyBot.classList.remove("is-active");
  selectedButton.classList.add("is-active");
}

addGlobalEventListener("click", ".cell", (e) => {
  const row = e.target.getAttribute("data-row");
  const column = e.target.getAttribute("data-column");
  game.playRound(row, column);
});

function addGlobalEventListener(type, selector, callback) {
  document.addEventListener(type, (e) => {
    if (e.target.matches(selector)) callback(e);
  });
}

const botPlayerState = (() => {
  let botActive = false;
  let difficulty = null;
  let botPlayed = false;

  const setBotMode = (isBot, level) => {
    botActive = isBot;
    difficulty = level;
    botPlayed = false;
  };

  const setBotPlayed = (played) => {
    botPlayed = played;
  };

  const getBotMode = () => ({ botActive, difficulty, botPlayed });

  return { setBotMode, getBotMode, setBotPlayed };
})();

const counter = () => {
  let value = 0;
  const count = () => value++;
  const getValue = () => value;
  return { count, getValue };
};
const gameCounter = counter();

const players = [
  { name: playerOneName, symbol: "X" },
  { name: playerTwoName, symbol: "O" },
];

function Gameboard() {
  const rows = 3;
  const columns = 3;

  function cell() {
    let value = 0;
    const addToken = (player) => {
      value = player;
    };
    const getValue = () => value;
    return { addToken, getValue };
  }

  const gamefield = [];
  for (let i = 0; i < rows; i++) {
    gamefield[i] = [];
    for (let j = 0; j < columns; j++) {
      gamefield[i].push(cell());
    }
  }

  const getGamefield = () => gamefield;

  return { getGamefield };
}

function GameController() {
  const board = Gameboard();
  const gamefield = board.getGamefield();

 
  const changePlayerName = (player, value) => {
    if (player === "playerOne") {
      players[0].name = value;
    } else if (player === "playerTwo") {
      players[1].name = value;
    }
    informationField.innerHTML = `It's ${activePlayer.name}'s turn `;
    console.log(players);
  };
  let activePlayer = players[0];

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const displayBoard = () => {
    const boardContainer = document.querySelector(".board-container");
    boardContainer.innerHTML = gamefield
      .map((row, rowIndex) => {
        return `<div class="row">${row
          .map(
            (cell, columnIndex) =>
              `<div class="cell" data-row="${rowIndex}" data-column="${columnIndex}">${
                cell.getValue() || "_"
              }</div>`
          )
          .join("")}</div>`;
      })
      .join("");
  };

  let winningCombination = []; // To store the winning combination

  const checkWin = (playerSymbol) => {
    const winningCombinations = [
      // Rows
      [
        [0, 0],
        [0, 1],
        [0, 2],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 2],
      ],
      [
        [2, 0],
        [2, 1],
        [2, 2],
      ],
      // Columns
      [
        [0, 0],
        [1, 0],
        [2, 0],
      ],
      [
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      [
        [0, 2],
        [1, 2],
        [2, 2],
      ],
      // Diagonals
      [
        [0, 0],
        [1, 1],
        [2, 2],
      ],
      [
        [0, 2],
        [1, 1],
        [2, 0],
      ],
    ];

    for (let combination of winningCombinations) {
      const [a, b, c] = combination;
      if (
        gamefield[a[0]][a[1]].getValue() ===
          (playerSymbol || activePlayer.symbol) &&
        gamefield[b[0]][b[1]].getValue() ===
          (playerSymbol || activePlayer.symbol) &&
        gamefield[c[0]][c[1]].getValue() ===
          (playerSymbol || activePlayer.symbol)
      ) {
        winningCombination = combination; // Save the winning combination
        return true; // Indicate that there's a winner
      }
    }

    return false; // No winner found
  };
  const gameStatus = (() => {
    let value = false;
    const isOver = () => {
      value = true;
    };
    const getValue = () => value;
    return { isOver, getValue };
  })();

  function isGameBoardFull() {
    for (let i = 0; i < gamefield.length; i++) {
      for (let j = 0; j < gamefield[i].length; j++) {
        if (gamefield[i][j].getValue() === 0) {
          return false;
        }
      }
    }
    return true;
  }

  function giveButtonNewLook(draw) {
    const cellElement = document.querySelectorAll(".cell");
    cellElement.forEach((cell) => {
      if (cell.innerHTML === "_" || draw) {
        cell.classList.add("disabled");
      }
      const rowIndex = cell.getAttribute("data-row");
      const columnIndex = cell.getAttribute("data-column");
      winningCombination.forEach((winnerCells) => {
        if (rowIndex == winnerCells[0] && columnIndex == winnerCells[1]) {
          cell.classList.add("winner");
        }
      });
    });
  }

  const dropToken = (row, column) => {
    row = parseInt(row);
    column = parseInt(column);
    //const selectedCell = gamefield[row][column];
    //console.log(selectedCell);
    if (gamefield[row][column].getValue() === 0) {
      gamefield[row][column].addToken(activePlayer.symbol);
      //displayBoardBot()
      displayBoard();
      if (checkWin()) {
        informationField.innerHTML = `${activePlayer.name} wins!`;
        //console.log(`${activePlayer.name} wins!`);
        gameStatus.isOver();
        giveButtonNewLook();
        return true;
      } else {
        if (isGameBoardFull()) {
          gameStatus.isOver();
          informationField.innerHTML = "It's a draw";
          return;
        }
        switchPlayerTurn();
        informationField.innerHTML = `It's ${activePlayer.name}'s turn `;

        const { botActive, difficulty, botPlayed } =
          botPlayerState.getBotMode();
        if (botActive && !botPlayed) {
          setTimeout(() => {
            console.log("Delayed for 1 second.");
            botPlayer(difficulty);
            botPlayerState.setBotMode(botActive, difficulty, true);
          }, "1000");
        }
      }
    } else {
      console.log("Cell already occupied. Try again.");
    }
    return false;
  };

  const playRound = (row, column) => {
    if (!gameStatus.getValue()) {
      dropToken(row, column);

      const { botActive, botPlayed } = botPlayerState.getBotMode();
      if (botActive && !botPlayed) {
        botPlayerState.setBotPlayed(false);
      }
    }
  };

  const displayBoardBot = () => {
    console.log("neues Spielfeld")
    console.log(gamefield
    .map((row) => { return row.map((cell) => {
      return cell.getValue() || "_"}).join("|")}));
  };
  const botPlayer = (difficulty) => {
    function getRandomInt(max) {
      return Math.floor(Math.random() * max);
    }
    let winner;
    let move;
    function miniMax(depth, isMaximizing, playerSymbol) {
      //displayBoardBot()
      winner = null;
      if (checkWin(playerSymbol)) winner = playerSymbol;
      if (winner === "O") return 1;
      if (winner === "X") return -1;
      if (isGameBoardFull()) return 0;

      if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < gamefield.length; i++) {
          for (let j = 0; j < gamefield[i].length; j++) {
            if (gamefield[i][j].getValue() === 0) {
              gamefield[i][j].addToken("O");
              let score = miniMax(depth + 1, false, "X");
              gamefield[i][j].addToken(0); // Reset the cell
              //console.log(score, gamefield[i][j]);
              if (score > bestScore) {
                bestScore = score;
                if (depth === 0) {
                  displayBoardBot()
                  console.log("depth = 0")
                  move = { row: i, column: j };
                  console.log(move, playerSymbol)
                  //console.log(move)
                  // Save the best move only at the top level
                }
              }
            }
          }
        }
        return bestScore;
      } else {
        let bestScore = Infinity;
        for (let i = 0; i < gamefield.length; i++) {
          for (let j = 0; j < gamefield[i].length; j++) {
            if (gamefield[i][j].getValue() === 0) {
              gamefield[i][j].addToken("X");
              let score = miniMax(depth + 1, true, "O");
              gamefield[i][j].addToken(0); // Reset the cell
              if (score < bestScore) {
                bestScore = score;
              }
            }
          }
        }
        return bestScore;
      }
    }

    const cellElement = Array.from(document.querySelectorAll(".cell"));
    if (difficulty == "easy") {
      let emptyCells = cellElement
        .map((cell) => {
          const rowIndex = cell.getAttribute("data-row");
          const columnIndex = cell.getAttribute("data-column");
          let value = gamefield[rowIndex][columnIndex].getValue();
          return [rowIndex, columnIndex, value];
        })
        .filter((arrayElement) => {
          return arrayElement[2] === 0;
        });
      let randomCell = emptyCells[getRandomInt(emptyCells.length)];
      let row = randomCell[0];
      let column = randomCell[1];
      botPlayerState.setBotPlayed(true);
      playRound(row, column);
    }
    if (difficulty == "hard") {
      move = null;
      miniMax(0, true, "O");
      botPlayerState.setBotPlayed(true);
      const row = parseInt(move.row);
      const column = parseInt(move.column);
      playRound(row, column);
    }
  };

  return { playRound, displayBoard, activePlayer, changePlayerName, botPlayer };
}

function startGame() {
  game = GameController();

  footerText.innerHTML = `times played ${gameCounter.getValue()}`;
  gameCounter.count();
  game.displayBoard();
  addPlayerNameListeners();
  informationField.innerHTML = `It's ${game.activePlayer.name}'s turn `;
}
startGame();
