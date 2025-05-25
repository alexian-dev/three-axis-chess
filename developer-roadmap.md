# 3D Voxel Chess - Developer Roadmap

## Introduction

This document outlines potential future development paths, improvements, and technical considerations for the single-page 3D Voxel Chess game. The current state provides a functional base with core gameplay, customizable setup, basic AI, and check/checkmate logic.
The long‑term vision is to transform this project into a polished three‑axis chess experience with rich interaction and accessibility.

## Core Architecture Overview

*   **Single File:** All HTML, CSS, and JavaScript are contained within one `.html` file. This simplifies distribution but hinders modularity and maintainability as complexity grows.
*   **Three.js:** Used for all 3D rendering, including scene management, geometry, materials, lighting, camera controls (`OrbitControls`), and raycasting for interaction. Loaded via CDN.
*   **JavaScript Structure:**
    *   Global variables store scene components, game state (`gameState`), board representation (`boardState`), piece meshes, etc.
    *   `init()`: Sets up the core Three.js environment and calls subsequent setup functions.
    *   `startGame()`: Handles UI interaction for setup options and triggers `init()`.
    *   `setup...()` functions: Initialize specific parts like the board state, piece meshes, visualization, audio, interaction listeners.
    *   `createPieceMesh()`: Generates the visual representation for pieces.
    *   `calculateLegalMoves()`, `_calculatePseudoLegalMoves()`: Core logic for determining valid moves, including check prevention.
    *   `isSquareAttacked()`, `isInCheck()`, `getAllLegalMoves()`, `updateGameStatusAndCheckEnd()`: Implement check and checkmate detection.
    *   `movePiece()`: Executes a move, updates state, handles captures/promotion, triggers AI.
    *   AI Functions (`maybeTriggerAiMove`, `calculateAiMove`, `getRandomMove`, `getGreedyMove`, `evaluatePosition`): Handle computer opponent turns.
    *   `animate()`: The main Three.js render loop.

## Proposed Roadmap

### Phase 1: UX & Visual Polish (High Priority)

1.  **Distinct Voxel Piece Models:**
    *   *Goal:* Improve piece recognition and visual appeal.
    *   *Tasks:* Redesign King, Queen, Rook, Bishop, Knight, Pawn using `THREE.Group` and multiple `THREE.BoxGeometry` instances to create unique, simple voxel shapes. Consider subtle height/width differences. Remove text labels if models become clear enough.
    *   *Resources:* Voxel art tools (MagicaVoxel) could help design shapes. See `docs/starship-theme-prompts.md` for example starship-themed concepts.
2.  **Smooth Piece Movement Animation:**
    *   *Goal:* Enhance game feel, provide visual path confirmation.
    *   *Tasks:* Implement tweening for piece movement in `movePiece`. Update piece `position` incrementally over time (e.g., 0.2-0.3 seconds) within the `animate` loop or using a library (like TWEEN.js - requires adding CDN). Manage animation state (e.g., `isMoving` flag in piece data).
    *   *Considerations:* Ensure animation doesn't interfere with turn logic or performance.
3.  **Improved Highlighting:**
    *   *Selection:* Explore outline effects (`THREE.OutlinePass` with `EffectComposer`, or simulated outline), stronger emissive glow, or slight vertical offset.
    *   *Valid Moves:* Replace spheres with semi-transparent voxel cubes or plane markers on the target square's "floor". Ensure capture highlights (if enabled) are distinct (color/shape). *(Basic distinct colors implemented)*
4.  **Refined UI:**
    *   *Goal:* Better presentation of game state.
    *   *Tasks:* Improve CSS for `#info` panel (layout, fonts, clarity). Visually distinguish current player more clearly. Enhance captured piece display area (e.g., align better, maybe add material value indicators).
5.  **Audio Polish:**
    *   *Goal:* More distinct and satisfying sounds.
    *   *Tasks:* Find/create better quality, short audio samples for move, capture, check, checkmate, select, invalid move. Load using Web Audio API `fetch` and `decodeAudioData`. Replace oscillator sounds. Add sound for promotion.
6.  **Move Log (DONE):**
    *   *Goal:* Track moves during play.
    *   *Status:* Implemented as a toggleable scrollable list.

### Phase 2: Gameplay Enhancements

1.  **More AI Levels:**
    *   *Goal:* Provide a greater challenge.
    *   *Tasks:* Implement Minimax search with Alpha-Beta Pruning. Start with depth 1 or 2. Improve `evaluatePosition` by adding factors like mobility (number of legal moves) and potentially simple positional heuristics (e.g., bonus for pieces at greater heights or near center - adapt based on UP axis).
    *   *Considerations:* Run AI calculations asynchronously (`setTimeout` or Web Workers if moving off single-file) to prevent UI freeze. Monitor performance closely.
2.  **Castling:**
    *   *Goal:* Implement this standard chess rule.
    *   *Tasks:* Add castling logic to `calculateLegalMoves` for the King. Requires checking: king/rook `hasMoved`, path is clear between them, squares King passes over are not attacked. Requires special handling in `movePiece` to move both King and Rook. Needs careful definition for 3D (likely restricted to the initial floor plane).
3.  **Game Reset / New Game Button:**
    *   *Goal:* Allow playing multiple games without refreshing.
    *   *Tasks:* Add a "New Game" button (perhaps after checkmate/stalemate). Implement a `resetGame` function that clears `boardState`, resets scores, captured pieces, `gameState`, removes all piece/highlight meshes, and potentially shows the setup overlay again or restarts with current settings.

### Phase 3: Visual Candy / Advanced Features

1.  **Environment:**
    *   *Goal:* Enhance immersion.
    *   *Tasks:* Implement a space skybox (`THREE.CubeTextureLoader`). Add a subtle `THREE.Points` particle field. Experiment with `THREE.Fog`.
2.  **Lighting & Shadows:**
    *   *Goal:* Improve realism and depth.
    *   *Tasks:* Enable shadow mapping on the renderer and lights (`castShadow`). Set `receiveShadow` on the floor plane and pieces. Set `castShadow` on pieces. Requires significant performance tuning (shadow map size, frustum culling).
3.  **Post-Processing:**
    *   *Goal:* Stylized visuals (glows, better anti-aliasing).
    *   *Tasks:* Implement `THREE.EffectComposer`. Add `UnrealBloomPass` for glow effects on highlights/emissive materials. Add `SMAAPass` or `FXAAPass` for anti-aliasing.
    *   *Considerations:* Adds complexity and significant performance overhead.
4.  **Hover Effects:**
    *   *Goal:* Pre-click feedback.
    *   *Tasks:* Implement `mousemove` listener with throttled raycasting. Apply subtle visual changes (color shift, slight scale) to hovered-over interactive objects (own pieces).

### Phase 4: Online Play & Community

1.  **Networked Multiplayer:**
    *   *Goal:* Allow remote players to compete in real time.
    *   *Tasks:* Implement a simple WebSocket protocol and lobby UI. Handle disconnections gracefully.
    *   *Considerations:* Start with a minimal Node server; keep the message format lightweight.
2.  **Spectator & Replay:**
    *   *Goal:* Share games with others and review past matches.
    *   *Tasks:* Stream board state to observers, log moves, and provide a playback interface.
3.  **User Profiles & Ranking:**
    *   *Goal:* Foster competition and track progress.
    *   *Tasks:* Store win/loss records and calculate a simple rating. Use local storage initially.

### Phase 5: Advanced Tools

1.  **Game Save & Load:**
    *   *Goal:* Resume unfinished games.
    *   *Tasks:* Serialize game state to JSON and allow import/export. Consider PGN support for notation.
2.  **Puzzle Mode:**
    *   *Goal:* Offer tactical challenges.
    *   *Tasks:* Provide predefined positions with hint and solution checking.
3.  **Customization Options:**
    *   *Goal:* Personalize the look and feel.
    *   *Tasks:* Themeable board and pieces, gridline toggle, and sound volume settings.

### Phase 6: Immersive Modes

1.  **VR/AR Support:**
    *   *Goal:* Experience the board in headsets or on mobile.
    *   *Tasks:* Integrate WebXR for VR controls and experiment with AR placement.
2.  **Multiple Camera Presets:**
    *   *Goal:* Provide different perspectives.
    *   *Tasks:* Quick switch between top-down, isometric, and first-person views.

### Phase 7: Accessibility & Mobile

1.  **Touch-First Controls:**
    *   *Goal:* Improve play on phones and tablets.
    *   *Tasks:* Larger UI elements and gesture handling.
2.  **Keyboard Navigation:**
    *   *Goal:* Allow full play with the keyboard.
    *   *Tasks:* Selection via arrow keys and dedicated move shortcuts.
3.  **Screen Reader Support:**
    *   *Goal:* Basic accessibility for visually impaired players.
    *   *Tasks:* Add ARIA labels and textual move announcements.

## Code Structure Notes

*   The single-file structure is reaching its limit. Consider breaking down JS into modules (e.g., `gameState.js`, `ui.js`, `ai.js`, `rendering.js`, `rules.js`) if further major features are added. This would require a build step or changing the distribution method.
*   Continue adding comments to explain complex logic (especially rules, AI, axis mapping).
*   Refactor large functions like `movePiece` or `createPieceMesh` if they become too unwieldy.

## Performance Considerations

*   **Draw Calls:** Creating unique meshes for every piece/marker can be expensive. Instancing (`THREE.InstancedMesh`) could be used for pieces if performance becomes an issue, but complicates individual selection/highlighting.
*   **AI Calculation:** Minimax/Alpha-Beta can be slow, especially at higher depths. Keep evaluation simple and run asynchronously.
*   **Shadows & Post-Processing:** These are computationally expensive. Use sparingly or provide options to disable them.
*   **Raycasting:** Frequent raycasting (e.g., for hover effects) needs to be throttled.
