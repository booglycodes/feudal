let moves = null
let state = {
    turn: 'white', 
    pieces: [
        { name: 'archtower', loc: [0, 7], captured: false, id: 0, color: 'white' },
        { name: 'magician', loc: [1, 7], captured: false, id: 1, color: 'white' },
        { name: 'martyr', loc: [2, 7], captured: false, id: 2, color: 'white' },
        { name: 'vizir', loc: [3, 7], captured: false, id: 3, color: 'white' },
        { name: 'king', loc: [4, 7], captured: false, id: 4, color: 'white' },
        { name: 'martyr', loc: [5, 7], captured: false, id: 5, color: 'white' },
        { name: 'magician', loc: [6, 7], captured: false, id: 6, color: 'white' },
        { name: 'archtower', loc: [7, 7], captured: false, id: 7, color: 'white' },
        { name: 'mercenary', loc: [0, 6], captured: false, id: 8, color: 'white' },
        { name: 'mercenary', loc: [1, 6], captured: false, id: 9, color: 'white' },
        { name: 'mercenary', loc: [2, 6], captured: false, id: 10, color: 'white' },
        { name: 'mercenary', loc: [3, 6], captured: false, id: 11, color: 'white' },
        { name: 'mercenary', loc: [4, 6], captured: false, id: 12, color: 'white' },
        { name: 'mercenary', loc: [5, 6], captured: false, id: 13, color: 'white' },
        { name: 'mercenary', loc: [6, 6], captured: false, id: 14, color: 'white' },
        { name: 'mercenary', loc: [7, 6], captured: false, id: 15, color: 'white' },

        { name: 'archtower', loc: [0, 0], captured: false, id: 16, color: 'black' },
        { name: 'magician', loc: [1, 0], captured: false, id: 17, color: 'black' },
        { name: 'martyr', loc: [2, 0], captured: false, id: 18, color: 'black' },
        { name: 'vizir', loc: [3, 0], captured: false, id: 19, color: 'black' },
        { name: 'king', loc: [4, 0], captured: false, id: 20, color: 'black' },
        { name: 'martyr', loc: [5, 0], captured: false, id: 21, color: 'black' },
        { name: 'magician', loc: [6, 0], captured: false, id: 22, color: 'black' },
        { name: 'archtower', loc: [7, 0], captured: false, id: 23, color: 'black' },
        { name: 'mercenary', loc: [0, 1], captured: false, id: 24, color: 'black' },
        { name: 'mercenary', loc: [1, 1], captured: false, id: 25, color: 'black' },
        { name: 'mercenary', loc: [2, 1], captured: false, id: 26, color: 'black' },
        { name: 'mercenary', loc: [3, 1], captured: false, id: 27, color: 'black' },
        { name: 'mercenary', loc: [4, 1], captured: false, id: 28, color: 'black' },
        { name: 'mercenary', loc: [5, 1], captured: false, id: 29, color: 'black' },
        { name: 'mercenary', loc: [6, 1], captured: false, id: 30, color: 'black' },
        { name: 'mercenary', loc: [7, 1], captured: false, id: 31, color: 'black' }
    ],
    counter: 0
}


const canvas = document.getElementById('chessboard')
const ctx = canvas.getContext('2d')
const boardSize = 8
const squareSize = canvas.width / boardSize

const pieceShadowDisplacement = [8, 2]
const maxPiecesShadowing = 3

function formatJson(json) {
    return Object.entries(json)
      .map(([key, value]) => `${key} = ${JSON.stringify(value)}`)
      .join("\n")
}

let shift = 0
let topPiece = {}
let locsToMoves = {}
async function drawBoard() {
    if (moves == null) {
        return
    }
    // dirty hack to make locsToMoves consistent. This sucks. should seperate into two passes instead of just drawing it all
    // twice, but because the chessboard is so low resolution and there are so few objects, drawing it twice is fine (perf-wise)
    for (let i = 0; i < 2; i++) { 
        document.getElementById('turn-info').textContent = 'turn: ' + state.turn
        ctx.imageSmoothingEnabled = false
        if (squareSelection !== null) {
            let piece = state.pieces[topPiece[squareSelection[0] + ',' + squareSelection[1]]]

            document.getElementById('piece-info').textContent = formatJson(piece)
            locsToMoves = {}
            for (let move of moves) {
                if (move.pieceId === piece.id) {
                    let key = move.loc[0] + ',' + move.loc[1]
                    if (locsToMoves[key] === undefined) {
                        locsToMoves[key] = {}
                    }
                    locsToMoves[key][move.name] = move
                }
            }
        } else {
            locsToMoves = {}
            document.getElementById('piece-info').textContent = ''
        }
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const x = col * squareSize
                const y = row * squareSize
                let squareColor = (row + col) % 2 === 0 ? '#f0d9b5' : '#b58863'
                if (squareSelection != null) {
                    if (col === squareSelection[0] && row === squareSelection[1]) {
                        squareColor = tintColor(squareColor, '#00FFFF', 0.3)
                    }
                }
                let key = col + ',' + row
                if (locsToMoves[key] !== undefined) {
                    squareColor = tintColor(squareColor, '#FF0000', 0.3)
                }
                ctx.fillStyle = squareColor
                ctx.fillRect(x, y, squareSize, squareSize)
            }
        }
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                topPiece[col + ',' + row] = null
                let squareX = col * squareSize
                let squareY = row * squareSize
                let piecesOnSquare = []
                for (let piece of state.pieces) {
                    if (piece.loc[0] == col && piece.loc[1] == row && !piece.captured) {
                        piecesOnSquare.push(piece)
                    }
                }
                let piecesToShow = []
                for (let i = 0; i < piecesOnSquare.length && i < maxPiecesShadowing; i++) {
                    piecesToShow.push(piecesOnSquare[(shift + i) % piecesOnSquare.length])
                }
                let i = piecesToShow.length - 1
                for (let piece of piecesToShow.reverse()) {
                    let img = pieces[piece.name].imageData[piece.color]
                    let x = squareX + squareSize / 4 + pieceShadowDisplacement[0] * i
                    let y = squareY + squareSize / 4 + pieceShadowDisplacement[1] * i
                    ctx.drawImage(img, x, y, squareSize / 2, squareSize / 2)
                    topPiece[col + ',' + row] = piece.id
                    i -= 1
                }
            }
        }
    }
}

function tintColor(base, tint, strength) {
    let r1 = parseInt(base.slice(1, 3), 16)
    let g1 = parseInt(base.slice(3, 5), 16)
    let b1 = parseInt(base.slice(5, 7), 16)
    
    let r2 = parseInt(tint.slice(1, 3), 16)
    let g2 = parseInt(tint.slice(3, 5), 16)
    let b2 = parseInt(tint.slice(5, 7), 16)

    let r = Math.round(r1 * (1 - strength) + r2 * strength)
    let g = Math.round(g1 * (1 - strength) + g2 * strength)
    let b = Math.round(b1 * (1 - strength) + b2 * strength)

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

const addPiece = document.getElementById('add-piece')

let addWhitePiece = true
document.getElementById('add-piece-color').addEventListener('click', () => {
    addWhitePiece = !addWhitePiece
    document.getElementById('add-piece-color').textContent = addWhitePiece ? 'add white pieces' : 'add black pieces'
})

let squareSelection = null
canvas.addEventListener('click', async (e) => {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const col = Math.floor(x / squareSize)
    const row = Math.floor(y / squareSize)

    let key = col + ',' + row
    if(addPiece.checked) {
        let options = Object.keys(pieces).flatMap(pieceName => {
            let color = addWhitePiece ? 'white' : 'black'
            return {
                name: 'add ' + pieceName,
                action: async () => {
                    let piece = {id: state.pieces.length, name: pieceName, color, loc: [col, row], captured: false}
                    state.pieces.push(piece)
                    moves = await getLegalMoves()
                    await drawBoard()
                }
            }
        })
        createDropdown(e.clientX, e.clientY, options)
    } else {
        if (squareSelection === null) {
            if (topPiece[key] !== undefined && topPiece[key] !== null) {
                squareSelection = [col, row]
            }
        } else {
            let pieceMoves = locsToMoves[key]
            if (pieceMoves !== undefined) {
                let moveNames = Object.keys(pieceMoves)
                if (moveNames.length === 1) {
                    let move = pieceMoves[moveNames[0]]
                    state = move.state
                    state.counter += 1
                    moves = await getLegalMoves()
                    squareSelection = null
                } else {
                    let options = Object.values(pieceMoves).map(move => {
                        return {
                            name: move.name,
                            action: async () => {
                                state = move.state
                                state.counter += 1
                                moves = await getLegalMoves()
                                squareSelection = null
                                await drawBoard()
                            }
                        }
                    })
                    createDropdown(e.clientX, e.clientY, options)
                }
            } else {
                squareSelection = null
            }
        }
        await drawBoard()
    }
})

oncanvas = false
canvas.addEventListener('mouseleave', () => {
    oncanvas = false
})
canvas.addEventListener('mouseenter', () => oncanvas = true)

function createDropdown(x, y, options) {
    let existingDropdown = document.getElementById('custom-dropdown')
    if (existingDropdown) {
        existingDropdown.remove() // Remove existing dropdown before creating a new one
    }

    let dropdown = document.createElement('div')
    dropdown.id = 'custom-dropdown'
    dropdown.className = 'dropdown-menu'
    dropdown.style.left = `${x - 6}px`
    dropdown.style.top = `${y - 6}px`

    options.forEach(({name, action}) => {
        let item = document.createElement('div')
        item.className = 'dropdown-item'
        item.textContent = name
        item.addEventListener('click', () => {
            action()
            dropdown.remove()
        })
        dropdown.appendChild(item)
    })

    // Remove dropdown when the mouse moves away
    dropdown.addEventListener('mouseleave', () => {
        dropdown.remove()
    })
    document.body.appendChild(dropdown)
}

async function init() {
    authToken = await fetchAuthToken()
    pieces = await loadPiecesFromSheet()
    for (let pieceName in pieces) {
        console.log(state)
        state = await pieces[pieceName].runners[0].start(state)
    }
    moves = await getLegalMoves()
    await drawBoard()
}

init()

document.addEventListener('keydown', async (event) => {
    if (!oncanvas) {
        return
    }
    if (event.code === 'Space') {
        shift++
        await drawBoard()
    }
})

async function processMoves(mv) {
    let m = await Promise.all(Object.keys(mv).map(pieceName => pieces[pieceName].runners[0].moves(mv[pieceName])))
    return m.flat().flat()
}

async function filterMoves(mv, state, moves) {
    let filters = await Promise.all(Object.keys(mv).map(pieceName => pieces[pieceName].runners[0].filter(state, moves)))
    return filters.reduce((acc, row) => acc.map((val, i) => val && row[i]))
}

async function processCanCaptureKing(mv) {
    const results = await Promise.all(Object.keys(mv).flatMap(pieceName => {
        const moves = mv[pieceName];
        const chunkSize = Math.ceil(moves.length / pieces[pieceName].runners.length); // Split into chunks based on runner count
        const chunks = [];

        // Split moves into chunks based on the number of runners
        for (let i = 0; i < pieces[pieceName].runners.length; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, moves.length);
            chunks.push(moves.slice(start, end));
        }

        // Use flatMap to distribute chunks across the runners
        return chunks.map((chunk, index) => {
            return pieces[pieceName].runners[index].canCaptureKing(chunk); // Pass each chunk to the corresponding runner
        });
    }));

    // Flatten the results
    return results.flat();
}


function getMoves(state) {
    let pieceBatches = {}
    for (let pieceName in pieces) {
        let pieceIds = []
        for (let piece of state.pieces) {
            if (piece.color === state.turn && piece.name === pieceName && !piece.captured) {
                pieceIds.push(piece.id)
            }
        }
        if (pieceIds.length > 0) {
            pieceBatches[pieceName] = [{pieceIds, state}]
        }
    }
    return pieceBatches
}

function combineMoves(a, b) {
    for (let pieceName in b) {
        if (pieceName in a) {
            a[pieceName] = a[pieceName].concat(b[pieceName])
        } else {
            a[pieceName] = b[pieceName]
        }
    }
}

async function inCheckMoves(state) {
    state.turn = state.turn === 'white' ? 'black' : 'white'
    let moves = getMoves(state)
    let kingCaptured = moves.some(move => move.state.pieces.some(piece => piece.name === 'king' && piece.color === turn && piece.captured))
    state.turn = state.turn === 'white' ? 'black' : 'white'
    return kingCaptured
}

async function getLegalMoves() {
    let startTotal = performance.now()

    let startGetMoves = performance.now()
    let z = getMoves(state)
    console.log(`getMoves initial: ${(performance.now() - startGetMoves).toFixed(2)} ms`)

    let startProcessMoves = performance.now()
    let moves = await processMoves(z)
    console.log(`processMoves: ${(performance.now() - startProcessMoves).toFixed(2)} ms`)

    let startGeneratingNextMoves = performance.now()
    let nextmoves = {}
    for (let i = 0; i < moves.length; i++) {
        let move = moves[i]
        move.state.turn = state.turn === 'white' ? 'black' : 'white'
        move.state.origin = i
        combineMoves(nextmoves, getMoves(move.state))
    }
    console.log(`Generating next moves: ${(performance.now() - startGeneratingNextMoves).toFixed(2)} ms`)

    let startInitializingBanned = performance.now()
    let banned = new Array(moves.length).fill(false)
    console.log(`Initializing banned array: ${(performance.now() - startInitializingBanned).toFixed(2)} ms`)

    let startProcessCanCaptureKing = performance.now()
    let maybeCheckMoves = await processCanCaptureKing(nextmoves)
    console.log(`processCanCaptureKing: ${(performance.now() - startProcessCanCaptureKing).toFixed(2)} ms`)

    let startFilteringBadMoves = performance.now()
    for (let moveId of maybeCheckMoves) {
        banned[moveId] = true
    }
    let movesWithoutCheck = moves.filter((_, i) => !banned[i])
    console.log(`Filtering bad moves: ${(performance.now() - startFilteringBadMoves).toFixed(2)} ms`)
    let allowed = await filterMoves(z, state, movesWithoutCheck)
    let allowedMoves = movesWithoutCheck.filter((_, i) => allowed[i])  

    if (allowedMoves.length === 0) {
        let startCheckmateAlert = performance.now()
        alert('checkmate!')
        console.log(`checkmate alert: ${(performance.now() - startCheckmateAlert).toFixed(2)} ms`)
    }

    console.log(`Total getLegalMoves: ${(performance.now() - startTotal).toFixed(2)} ms`)
    return allowedMoves
}

