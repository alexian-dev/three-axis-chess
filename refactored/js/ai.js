function maybeTriggerAiMove() {
  if (
    gameState.opponentType !== "human" &&
    gameState.currentPlayer === gameState.aiColor &&
    gameState.gameStatus !== "checkmate" &&
    gameState.gameStatus !== "stalemate"
  ) {
    gameState.isAiTurn = true;
    deselectPiece();
    updateInfoPanel();
    setTimeout(() => {
      calculateAiMove(gameState.aiColor);
    }, AI_DELAY);
  } else {
    gameState.isAiTurn = false;
  }
}
function calculateAiMove(aiColor) {
  let cM = null;
  if (gameState.opponentType === "random") {
    cM = getRandomMove(aiColor);
  } else if (gameState.opponentType === "greedy") {
    cM = getGreedyMove(aiColor);
  }
  if (cM) {
    const sP = getPieceAt(cM.from.x, cM.from.y, cM.from.z);
    if (sP) {
      movePiece(
        cM.from.x,
        cM.from.y,
        cM.from.z,
        cM.to.x,
        cM.to.y,
        cM.to.z,
        cM.isEnPassant,
      );
    } else {
      console.error("AI No piece", cM.from);
      gameState.isAiTurn = false;
    }
  } else {
    console.log("AI no moves");
    gameState.isAiTurn = false;
  }
}
function getRandomMove(aiColor) {
  const allMoves = [];
  for (let x_iter = 0; x_iter < BOARD_SIZE; x_iter++) {
    for (let y_iter = 0; y_iter < BOARD_SIZE; y_iter++) {
      for (let z_iter = 0; z_iter < gameState.maxHeight; z_iter++) {
        const pieceInfo = getPieceAt(x_iter, y_iter, z_iter);
        if (pieceInfo && pieceInfo.color === aiColor) {
          const legalMoves = calculateLegalMoves(
            pieceInfo,
            x_iter,
            y_iter,
            z_iter,
          );
          legalMoves.forEach((move) => {
            allMoves.push({
              from: { x: x_iter, y: y_iter, z: z_iter },
              to: { x: move.x, y: move.y, z: move.z },
              isEnPassant: move.isEnPassant,
            });
          });
        }
      }
    }
  }
  if (allMoves.length === 0) return null;
  return allMoves[Math.floor(Math.random() * allMoves.length)];
}
function getGreedyMove(aiColor) {
  let bestScore = -Infinity;
  let bestMoves = [];
  for (let x_iter = 0; x_iter < BOARD_SIZE; x_iter++) {
    for (let y_iter = 0; y_iter < BOARD_SIZE; y_iter++) {
      for (let z_iter = 0; z_iter < gameState.maxHeight; z_iter++) {
        const pieceInfo = getPieceAt(x_iter, y_iter, z_iter);
        if (pieceInfo && pieceInfo.color === aiColor) {
          const legalMoves = calculateLegalMoves(
            pieceInfo,
            x_iter,
            y_iter,
            z_iter,
          );
          for (const move of legalMoves) {
            const tempBoard = copyBoardState(boardState);
            const tempPiece = tempBoard[x_iter]?.[y_iter]?.[z_iter];
            if (!tempPiece) continue;
            if (move.isEnPassant) {
              const last = gameState.lastMove;
              if (
                last?.skipped &&
                last.skipped.x === move.x &&
                last.skipped.y === move.y &&
                last.skipped.z === move.z &&
                last.to
              ) {
                if (tempBoard[last.to.x]?.[last.to.y])
                  tempBoard[last.to.x][last.to.y][last.to.z] = null;
              }
            } else {
              if (tempBoard[move.x]?.[move.y])
                tempBoard[move.x][move.y][move.z] = null;
            }
            if (tempBoard[move.x]?.[move.y])
              tempBoard[move.x][move.y][move.z] = tempPiece;
            if (tempBoard[x_iter]?.[y_iter])
              tempBoard[x_iter][y_iter][z_iter] = null;
            const currentScore = evaluatePosition(tempBoard, aiColor);
            const currentMoveData = {
              from: { x: x_iter, y: y_iter, z: z_iter },
              to: { x: move.x, y: move.y, z: move.z },
              isEnPassant: move.isEnPassant,
            };
            if (currentScore > bestScore) {
              bestScore = currentScore;
              bestMoves = [currentMoveData];
            } else if (currentScore === bestScore) {
              bestMoves.push(currentMoveData);
            }
          }
        }
      }
    }
  }
  if (bestMoves.length === 0) return null;
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}
function evaluatePosition(currentBoard, colorToEvaluate) {
  let myMaterial = 0;
  let opponentMaterial = 0;
  for (let x_iter = 0; x_iter < BOARD_SIZE; x_iter++) {
    for (let y_iter = 0; y_iter < BOARD_SIZE; y_iter++) {
      for (let z_iter = 0; z_iter < gameState.maxHeight; z_iter++) {
        const piece = currentBoard[x_iter]?.[y_iter]?.[z_iter];
        if (piece) {
          const value = PIECE_VALUES[piece.type] || 0;
          if (piece.color === colorToEvaluate) {
            myMaterial += value;
          } else {
            opponentMaterial += value;
          }
        }
      }
    }
  }
  return myMaterial - opponentMaterial;
}
