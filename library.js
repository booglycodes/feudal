function library() {
    /**
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
     */

    /**
    * @function addLoc
    * @param {[number, number]} a - loc
    * @param {[number, number]} b - loc
    * @returns {[number, number]} loc
    */
    function addLoc(a, b) {
        return [a[0] + b[0], a[1] + b[1]]
    }

    /**
    * @function subLoc
    * @param {[number, number]} a - loc
    * @param {[number, number]} b - loc
    * @returns {[number, number]} loc
    */
    function subLoc(a, b) {
        return [a[0] - b[0], a[1] - b[1]]
    }

    /**
    * @function chessDist
    * @param {[number, number]} a - loc
    * @param {[number, number]} b - loc
    * @returns {number} chess distance between the provided locations
    */
    function chessDist(a, b) {
        let xdist = Math.abs(a[0] - b[0])
        let ydist = Math.abs(a[1] - b[1])
        return xdist.max(ydist)
    }

    /**
    * @function isValidLoc
    * @param {[number, number]} loc - loc
    * @returns {boolean} is the provided location valid (on the board)
    */
    function isValidLoc(loc) {
        return loc[0] >= 0 && loc[0] < 8 && loc[1] >= 0 && loc[1] < 8
    }   

    /**
     * @function cardinals
     * @returns {[number, number][]}
     */
    function cardinals() {
        return [[1, 0], [-1, 0], [0, 1], [0, -1]]
    }

    /**
     * @function diagonals
     * @returns {[number, number][]}
     */
    function diagonals() {
        return [[1, 1], [1, -1], [-1, 1], [-1, -1]]
    }

    /**
     * @function knightDirs
     * @returns {[number, number][]}
     */
    function knightDirs() {
        return [[2, -1], [2, 1], [-2, -1], [-2, 1], [1, 2], [-1, 2], [1, -2], [-1, -2]]
    }

    /**
     * @function createMove
     * @param {number} pieceId 
     * @param {State} state
     * @param {string} name
     * @param {[number, number]} loc
     * @returns {Move}
     */
    function createMove(pieceId, state, name, loc) {
        return {pieceId, state, name, loc, 'cursed' : false}
    }

    /**
     * @function createMove
     * @param {number} pieceId
     * @param {State} initialState
     * @param {Move} move
     * @returns {[number, number]} displacement
     */
    function getMoveDisplacement(pieceId, initialState, move) {
        let startingLoc = initialState.pieces[pieceId].loc
        let endingLoc = move.state.pieces[pieceId].loc
        return subLoc(endingLoc, startingLoc)
    }

    
    /**
     * @function getPiece
     * @param {[number,number]} loc
     * @param {State} state
     * @return {Piece[]} move
     */
    function getPieces(loc, state) {
        return state.pieces.filter(piece => loc[0] == piece.loc[0] && loc[1] == piece.loc[1]).filter(piece => !piece.captured)
    }

    /**
     * @function displacementMoves
     * @param {number} pieceId
     * @param {State} state
     * @param {[number, number]} locs
     * @param {boolean} allowCaptures
     * @return {Move[]}
     */
    function displacementMoves(pieceId, state, locs, allowCaptures) {
        let moves = []
        for (let loc of locs) {
            let move = deepClone(state)
            let piece = move.pieces[pieceId]
            if (!isValidLoc(loc)) {
                continue
            }
            let capture = getPieces(loc, move).map(captured_piece => captured_piece.captured = true).length != 0
            piece.loc = loc
            
            let name
            if (capture) {
                if (!allowCaptures) {
                    continue
                }
                name = 'capture'
            } else {
                name = 'move'
            }
            moves.push(createMove(pieceId, move, name, loc))
        }
        return moves
    }

    /**
     * Computes all possible locations in given directions until a stop condition is met.
     * @param {number} pieceId - The ID of the piece to move.
     * @param {State} state - The game state, which includes piece positions.
     * @param {[number, number][]} dirs - Array of direction vectors (e.g., [[1, 0], [0, 1]]).
     * @param {(loc: [number, number], state: State) => boolean} stopCondition - Function to determine when to stop.
     * @param {boolean} includeStop - Whether to include the stopping location.
     * @return {[number, number][]} - List of valid locations the piece can move to.
     */
    function getAllPossibleLocationsInDirections(pieceId, state, dirs, stopCondition, includeStop) {
        let locs = []
        let startingLoc = state.pieces[pieceId].loc

        for (let dir of dirs) {
            let loc = addLoc(startingLoc, dir)

            while (true) {
                if (!isValidLoc(loc)) {
                    break
                }
                let stop = stopCondition(loc, state)
                if (stop) {
                    if (includeStop) {
                        locs.push(loc)
                    }
                    break
                }
                locs.push(loc)
                loc = addLoc(loc, dir)
            }
        }
        return locs
    }

    function deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj
        if (Array.isArray(obj)) return obj.map(deepClone)
        const cloned = {}
        for (const key in obj) {
            cloned[key] = deepClone(obj[key])
        }
        return cloned
    }

    /**
     * @function copyState
     * @param {State} state
     * @return {State} copy of state
     */
    function copyState(state) {
        return deepClone(state)
    }

    /**
     * @function copyMove
     * @param {Move} 
     * @return {Move} copy of move
     */
    function copyMove(move) {
        return deepClone(move)
    }

    return {addLoc, subLoc, chessDist, isValidLoc, cardinals, diagonals, knightDirs, createMove, getMoveDisplacement, getPieces, displacementMoves, getAllPossibleLocationsInDirections, copyMove, copyState}
}
