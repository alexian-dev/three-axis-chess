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
  } else if (gameState.opponentType === "minimax") {
    cM = getMinimaxMove(aiColor, 2);
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
  let myMobility = 0;
  let oppMobility = 0;
  const saveLast = gameState.lastMove;
  gameState.lastMove = null;
  for (let x_iter = 0; x_iter < BOARD_SIZE; x_iter++) {
    for (let y_iter = 0; y_iter < BOARD_SIZE; y_iter++) {
      for (let z_iter = 0; z_iter < gameState.maxHeight; z_iter++) {
        const piece = currentBoard[x_iter]?.[y_iter]?.[z_iter];
        if (piece) {
          const value = PIECE_VALUES[piece.type] || 0;
          const moves = _calculatePseudoLegalMoves(
            piece,
            x_iter,
            y_iter,
            z_iter,
            currentBoard,
          );
          if (piece.color === colorToEvaluate) {
            myMaterial += value;
            myMobility += moves.length;
          } else {
            opponentMaterial += value;
            oppMobility += moves.length;
          }
        }
      }
    }
  }
  gameState.lastMove = saveLast;
  return (
    myMaterial - opponentMaterial + 0.1 * (myMobility - oppMobility)
  );
}

function isInCheckForBoard(pC, board, kingPos) {
  const kp = kingPos[pC];
  if (!kp) return false;
  const oC = pC === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
  return isSquareAttacked(kp.x, kp.y, kp.z, oC, board);
}

function applyMoveToBoard(board, move, lastMove, kingPos) {
  const nb = copyBoardState(board);
  const kp = {
    [COLORS.WHITE]: kingPos[COLORS.WHITE]
      ? { ...kingPos[COLORS.WHITE] }
      : null,
    [COLORS.BLACK]: kingPos[COLORS.BLACK]
      ? { ...kingPos[COLORS.BLACK] }
      : null,
  };
  const piece = nb[move.from.x]?.[move.from.y]?.[move.from.z];
  if (!piece) return { board: nb, lastMove, kingPositions: kp };
  const wasFirst = !piece.hasMoved;
  if (
    move.isEnPassant &&
    piece.type === PIECE_TYPES.PAWN &&
    lastMove?.skipped &&
    lastMove.skipped.x === move.to.x &&
    lastMove.skipped.y === move.to.y &&
    lastMove.skipped.z === move.to.z &&
    lastMove.to
  ) {
    nb[lastMove.to.x][lastMove.to.y][lastMove.to.z] = null;
  } else if (nb[move.to.x]?.[move.to.y]) {
    nb[move.to.x][move.to.y][move.to.z] = null;
  }
  nb[move.to.x][move.to.y][move.to.z] = piece;
  nb[move.from.x][move.from.y][move.from.z] = null;
  piece.hasMoved = true;
  if (piece.type === PIECE_TYPES.KING) {
    kp[piece.color] = { x: move.to.x, y: move.to.y, z: move.to.z };
  }
  let nLM = {
    pieceType: piece.type,
    color: piece.color,
    from: { ...move.from },
    to: { ...move.to },
    skipped: null,
  };
  if (
    piece.type === PIECE_TYPES.PAWN &&
    wasFirst &&
    ["x", "y", "z"].some((axis) =>
      Math.abs(move.to[axis] - move.from[axis]) === 2 &&
      ["x", "y", "z"].filter((a) => a !== axis).every((a) => move.to[a] === move.from[a]),
    )
  ) {
    const axis = ["x", "y", "z"].find(
      (a) =>
        Math.abs(move.to[a] - move.from[a]) === 2 &&
        ["x", "y", "z"].filter((b) => b !== a).every((b) => move.to[b] === move.from[b]),
    );
    if (axis) {
      const sS = { x: move.from.x, y: move.from.y, z: move.from.z };
      sS[axis] = move.from[axis] + (move.to[axis] > move.from[axis] ? 1 : -1);
      nLM.skipped = sS;
    }
  }
  return { board: nb, lastMove: nLM, kingPositions: kp };
}

function generateLegalMovesForBoard(board, playerColor, lastMove, kingPos) {
  const moves = [];
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let z = 0; z < gameState.maxHeight; z++) {
        const piece = board[x]?.[y]?.[z];
        if (piece && piece.color === playerColor) {
          const saved = gameState.lastMove;
          gameState.lastMove = lastMove;
          const ps = _calculatePseudoLegalMoves(piece, x, y, z, board);
          gameState.lastMove = saved;
          for (const mv of ps) {
            const result = applyMoveToBoard(
              board,
              { from: { x, y, z }, to: { x: mv.x, y: mv.y, z: mv.z }, isEnPassant: mv.isEnPassant },
              lastMove,
              kingPos,
            );
            if (!isInCheckForBoard(playerColor, result.board, result.kingPositions)) {
              moves.push({
                from: { x, y, z },
                to: { x: mv.x, y: mv.y, z: mv.z },
                isEnPassant: mv.isEnPassant,
              });
            }
          }
        }
      }
    }
  }
  return moves;
}

function minimax(board, depth, maximizing, aiColor, lastMove, kingPos, alpha, beta) {
  if (depth === 0) {
    return evaluatePosition(board, aiColor);
  }
  const currentColor = maximizing ? aiColor : aiColor === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
  const moves = generateLegalMovesForBoard(board, currentColor, lastMove, kingPos);
  if (moves.length === 0) {
    if (isInCheckForBoard(currentColor, board, kingPos)) {
      return maximizing ? -Infinity : Infinity;
    }
    return 0;
  }
  if (maximizing) {
    let maxEval = -Infinity;
    for (const mv of moves) {
      const res = applyMoveToBoard(board, mv, lastMove, kingPos);
      const evalScore = minimax(
        res.board,
        depth - 1,
        false,
        aiColor,
        res.lastMove,
        res.kingPositions,
        alpha,
        beta,
      );
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const mv of moves) {
      const res = applyMoveToBoard(board, mv, lastMove, kingPos);
      const evalScore = minimax(
        res.board,
        depth - 1,
        true,
        aiColor,
        res.lastMove,
        res.kingPositions,
        alpha,
        beta,
      );
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getMinimaxMove(aiColor, depth) {
  const board = copyBoardState(boardState);
  const kP = {
    [COLORS.WHITE]: gameState.kingPositions[COLORS.WHITE]
      ? { ...gameState.kingPositions[COLORS.WHITE] }
      : null,
    [COLORS.BLACK]: gameState.kingPositions[COLORS.BLACK]
      ? { ...gameState.kingPositions[COLORS.BLACK] }
      : null,
  };
  const moves = generateLegalMovesForBoard(
    board,
    aiColor,
    gameState.lastMove,
    kP,
  );
  let bestScore = -Infinity;
  let bestMoves = [];
  for (const mv of moves) {
    const res = applyMoveToBoard(board, mv, gameState.lastMove, kP);
    const score = minimax(
      res.board,
      depth - 1,
      false,
      aiColor,
      res.lastMove,
      res.kingPositions,
      -Infinity,
      Infinity,
    );
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [mv];
    } else if (score === bestScore) {
      bestMoves.push(mv);
    }
  }
  if (bestMoves.length === 0) return null;
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}
