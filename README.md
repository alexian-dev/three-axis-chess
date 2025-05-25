# three-axis-chess
A 3D 3-axis Chess game

# 3D Voxel Chess

A unique, single-page HTML/JavaScript 3D chess variant played within a voxel cube, utilizing the Three.js library for rendering. This game explores chess-like strategy in three dimensions with customizable board setups and AI opponents.

This project implements a chess variant played on an 8x8xN grid within a 3D cube. Pieces move according to rules inspired by traditional chess but adapted for three-dimensional space ("Any Axis" movement). The game features selectable starting configurations, board height, UP axis orientation, and basic AI opponents. The original implementation was a single HTML file; a modular version is available in the `refactored/` directory.

*   **Single HTML File:** Original monolithic version. A modular refactor exists in the `refactored/` folder.
*   **3D Voxel Graphics:** Board and pieces rendered with a voxel aesthetic using Three.js (WebGL).
*   **Customizable Board:**
    *   Selectable "UP" Axis (X, Y, or Z).
    *   Selectable Board Height (Max coordinate on UP axis, 2-8).
    *   Selectable Starting Height Configurations (Floor, Classic, Middle, High, Random).
*   **Unique 3D Movement:** Standard chess piece movements adapted for full 3D space.
    *   Pawns move 1 step orthogonally (any axis), capture 1 step diagonally (any plane).
    *   Pawns have an optional initial 2-step move (any axis, first move only).
    *   En Passant implemented (triggered *only* by opponent's 2-step Z-axis move, captured diagonally forward relative to Z).
    *   Promotion occurs when a pawn reaches the opponent's starting rank plane.
*   **Check & Checkmate:** Basic check detection and notification. Checkmate detection is implemented (game ends). Stalemate detection included.
*   **AI Opponents:**
    *   Random Mover: Picks any legal move randomly.
    *   Greedy Mover: Picks the move leading to the best immediate material score.
    *   Minimax (Depth 2): Searches one move ahead for both sides using a simple evaluation.
*   **Gameplay Features:**
    *   Turn-based play.
    *   Piece selection and valid move highlighting.
    *   Optional highlighting for capture moves.
    *   Capture tracking and material score display.
    *   Visual display of captured pieces.
    *   Optional move history log.
    *   Attack line, support line, and conflict ray visualization modes.
    *   Basic audio feedback for actions.
*   **User Interface:**
    *   Setup overlay to choose game options.
    *   In-game panel showing turn, material score, and game status.
    *   Axis labels (A-H, 1-8, I-VIII) for orientation.

## How to Play / Run

1.  Open `3dchess20.html` (single file) or `refactored/index.html` in a modern
    web browser with WebGL support (Chrome, Firefox, Edge, Safari).
2.  Ensure you have an internet connection to load Three.js and other libraries
    from the CDN.
3.  Choose your desired setup options on the initial screen.
4.  Click **Start Game**.

## Controls

*   **Left Mouse Button + Drag:** Rotate the camera around the center.
*   **Right Mouse Button + Drag:** Pan the camera.
*   **Mouse Wheel / Scroll:** Zoom in and out.
*   **Click:**
    *   Click one of your pieces (matching the current turn) to select it. Valid move destinations will be highlighted.
    *   Click a highlighted destination marker to move the selected piece.
    *   Click the selected piece again or empty space to deselect.

## Setup Options Explained

*   **Starting Height:** Determines the initial coordinate along the chosen "UP" axis for the pieces.
    *   *Floor (0):* All pieces start at height 0.
    *   *Classic (W:0, B:Max):* White starts at height 0, Black starts at the maximum height (`maxHeight - 1`).
    *   *Middle:* Both players start near the middle height coordinate (`floor((maxHeight-1)/2)`).
    *   *High (Max):* Both players start at the maximum height (`maxHeight - 1`).
    *   *Random:* Each piece gets a random starting height.
*   **"UP" Axis:** Defines which axis (X, Y, or Z) acts as the vertical direction for setup and camera controls. The other two axes form the "floor" plane.
*   **Board Height:** Sets the maximum coordinate value (exclusive) along the chosen "UP" axis (range 2-8). An 8x8x4 board would have `maxHeight = 4`.
*   **Opponent:** Choose between playing against another human or a basic AI (Random or Greedy). AI currently plays Black.
*   **Highlight Captures:** If checked, squares where a capture is possible will use a distinct red highlight marker.

## Rules Summary (Variant)

This is a chess *variant*. While inspired by standard chess, the 3D movement changes strategy significantly. Key points:
*   Movement generally follows standard patterns (Rook orthogonal, Bishop planar diagonal, Knight L-shape) but applies across all 3 axes.
*   Pawn movement and capture rules are specific to this variant (see Features list).
*   Check and Checkmate are implemented. King capture also ends the game.
*   Castling is not implemented.

## Technology

*   HTML5
*   CSS3
*   JavaScript (ES6+)
*   Three.js (r128 via CDN) + OrbitControls + FontLoader/TextGeometry

## Known Issues / Limitations

*   AI is very basic (Random/Greedy).
*   Performance may degrade with complex AI or very large numbers of visual elements in future development.
*   Limited mobile optimization (tap interaction improved).
*   Random piece placement might occasionally fail if board height is very low and density is high.

## Additional Resources

* Starship-themed piece model prompts are provided in [docs/starship-theme-prompts.md](docs/starship-theme-prompts.md).
