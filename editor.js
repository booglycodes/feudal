require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' }});
require(["vs/editor/editor.main"], function () {
    // Adding extra libraries (types for IntelliSense)
    monaco.languages.typescript.javascriptDefaults.addExtraLib(`/**
         * @typedef {Object} State
         * @property {string} turn - The current player's turn.
         * @property {Piece[]} pieces - The current game state.
         */
        
        /**
         * @typedef {Object} Piece
         * @property {number} id - The unique ID of the piece.
         * @property {string} name - The name of the piece.
         * @property {[number, number]} loc - The location of the piece on the board.
         * @property {string} color - The color of the piece ('white'/'black')
         * @property {boolean} captured - Whether the piece has been captured or not.
         */
        
        /**
         * @typedef {Object} Move
         * @property {string} name - The name of the move.
         * @property {boolean} cursed - Whether the move is allowed or not.
         * @property {[number, number]} loc - The target location of the move.
         * @property {State} state - The resulting state after the move.
         * @property {number} pieceId - The ID of the moving piece.
         */`, 'types.js')
    monaco.languages.typescript.javascriptDefaults.addExtraLib(library.toString(), 'lib.js')

    // Initialize Monaco editor
    window.editor = monaco.editor.create(document.getElementById("editor"), {
        value: `const lib = library()

/**
* @function moves
* @param {number} pieceId - The ID of the piece.
* @param {State} state - The current state of the board.
* @returns {Move[]} - A list of possible moves.
*/
function moves(pieceId, state) {
    return [{ name: "move1", cursed: false, loc: [0, 0], state, pieceId }]
}

/**
* @function rules
* @param {State} state - The game state.
* @param {Move[]} moves - The list of moves.
* @returns {Move[]} updated moves (use 'cursed' field to mark a move as disallowed).
*/
function rules(state, moves) {
    return moves
}

return { moves, rules }`,
        language: "javascript",
        theme: "vs-dark",
        automaticLayout: true
    })

})

window.addEventListener('resize', () => window.editor.layout())