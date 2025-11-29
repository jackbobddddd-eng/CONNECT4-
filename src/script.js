const ROWS = 6;
const COLS = 7;

let board = [];
let currentPlayer = 1; // 1 = Yellow, 2 = Red
let gameOver = false;
let aiMode = false;

const boardDiv = document.getElementById("board");
const turnIndicator = document.getElementById("turn-indicator");
const switchBtn = document.getElementById("switchBtn");

function initBoard() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  boardDiv.innerHTML = "";

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", handlePlayerMove);
      boardDiv.appendChild(cell);
    }
  }
  updateTurnText();
}

function updateTurnText() {
  if (gameOver) {
    turnIndicator.textContent = "🔥 GAME OVER 🔥";
    return;
  }
  turnIndicator.textContent =
    currentPlayer === 1
      ? "Yellow's Turn"
      : aiMode
      ? "AI Thinking..."
      : "Red's Turn";
}

function handlePlayerMove(e) {
  if (gameOver) return;
  if (aiMode && currentPlayer === 2) return;
  const col = parseInt(e.target.dataset.col);
  makeMove(col);
}

function makeMove(col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      board[r][col] = currentPlayer;
      placePiece(r, col);

      if (checkWin(r, col)) {
        endGame();
        return;
      }

      currentPlayer = 3 - currentPlayer;
      updateTurnText();

      if (aiMode && currentPlayer === 2) {
        setTimeout(aiMove, 300);
      }
      return;
    }
  }
}

function placePiece(r, col) {
  const index = r * COLS + col;
  const cell = boardDiv.children[index];
  const piece = document.createElement("div");
  piece.classList.add("piece", currentPlayer === 1 ? "p1" : "p2");
  cell.appendChild(piece);
}

// ----------------- SMART AI -----------------
function aiMove() {
  if (gameOver) return;
  const col = bestMove();
  makeMove(col);
}

// Minimax with depth 3 + simple scoring
function bestMove() {
  let bestScore = -Infinity;
  let bestCol = null;

  for (let c = 0; c < COLS; c++) {
    const r = getNextRow(c);
    if (r === null) continue;
    board[r][c] = 2; // AI temporarily
    const score = minimax(board, 3, false);
    board[r][c] = 0;
    if (score > bestScore) {
      bestScore = score;
      bestCol = c;
    }
  }
  return bestCol ?? 3;
}

function getNextRow(col) {
  for (let r = ROWS - 1; r >= 0; r--) if (board[r][col] === 0) return r;
  return null;
}

function minimax(boardState, depth, isMax) {
  if (depth === 0) return evaluate(boardState);

  if (isMax) {
    let maxEval = -Infinity;
    for (let c = 0; c < COLS; c++) {
      const r = getNextRowCol(boardState, c);
      if (r === null) continue;
      boardState[r][c] = 2;
      if (checkWinBoard(boardState, r, c, 2)) { boardState[r][c] = 0; return 1000; }
      const score = minimax(boardState, depth - 1, false);
      boardState[r][c] = 0;
      maxEval = Math.max(maxEval, score);
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let c = 0; c < COLS; c++) {
      const r = getNextRowCol(boardState, c);
      if (r === null) continue;
      boardState[r][c] = 1;
      if (checkWinBoard(boardState, r, c, 1)) { boardState[r][c] = 0; return -1000; }
      const score = minimax(boardState, depth - 1, true);
      boardState[r][c] = 0;
      minEval = Math.min(minEval, score);
    }
    return minEval;
  }
}

function getNextRowCol(boardState, col) {
  for (let r = ROWS - 1; r >= 0; r--) if (boardState[r][col] === 0) return r;
  return null;
}

function evaluate(boardState) {
  let score = 0;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (boardState[r][c] === 2) score += 3;
      else if (boardState[r][c] === 1) score -= 2;
  return score;
}

function checkWinBoard(boardState, r, c, player) {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (const [dr,dc] of dirs) {
    let count = 1;
    for (let i=1;i<4;i++) { const nr=r+dr*i, nc=c+dc*i; if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&boardState[nr][nc]===player) count++; }
    for (let i=1;i<4;i++) { const nr=r-dr*i, nc=c-dc*i; if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&boardState[nr][nc]===player) count++; }
    if(count>=4) return true;
  }
  return false;
}

// ----------------- WIN / PIECE -----------------
function checkWin(r, c) {
  const player = board[r][c];
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (const [dr,dc] of dirs) {
    let chain=[[r,c]];
    for(let i=1;i<4;i++){const nr=r+dr*i,nc=c+dc*i;if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&board[nr][nc]===player)chain.push([nr,nc]);else break;}
    for(let i=1;i<4;i++){const nr=r-dr*i,nc=c-dc*i;if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&board[nr][nc]===player)chain.push([nr,nc]);else break;}
    if(chain.length>=4){highlightWin(chain);return true;}
  }
  return false;
}

function highlightWin(chain) {
  chain.forEach(([r,c])=>{
    const index=r*COLS+c;
    const piece=boardDiv.children[index].querySelector(".piece");
    piece.classList.add("win");
  });
}

function endGame(){gameOver=true;updateTurnText();}

// ----------------- SWITCH MODE -----------------
switchBtn.addEventListener("click",()=>{
  aiMode=!aiMode;
  switchBtn.textContent=aiMode?"Switch to 2-Player Mode":"Switch to AI Mode";
  resetGame();
});

function resetGame(){gameOver=false;currentPlayer=1;initBoard();}

// ----------------- START -----------------
initBoard();
