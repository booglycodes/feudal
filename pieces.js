const RUNNERS = 15

let pieces = null
let properties = null
let authToken = null

async function loadPiecesFromSheet() {
    let sheet = await readSheet('A1:A1000', authToken, 'majorDimension=COLUMNS')
    let loadedPieces = {}
    if (sheet.values !== undefined) {
        for (let row of sheet.values[0]) {
            let piece = JSON.parse(row)
            let imageData = {}
            for (let color in piece.imageData) {
                imageData[color] = await loadImage(piece.imageData[color])
            }
            piece.imageData = imageData
            piece.runners = []
            for (let i = 0; i < RUNNERS; i++) {
                piece.runners.push(getRunner())
            }
            for (let runner of piece.runners) {
                await runner.init(piece.code)
            }
            loadedPieces[piece.name] = piece
        }
    }
    return loadedPieces
}

async function writePiecesToSheet() {
    let data = []
    for (let pieceName in pieces) {
        let piece = pieces[pieceName]
        let runners = piece.runners
        piece.runners = undefined
        let whiteImg = piece.imageData.white
        let blackImg = piece.imageData.black
        piece.imageData.white = piece.imageData.white.src
        piece.imageData.black = piece.imageData.black.src
        data.push(JSON.stringify(piece))
        piece.imageData.white = whiteImg
        piece.imageData.black = blackImg
        piece.runners = runners
    }
    writeSheet([data], authToken)
}

async function createOrUpdate(isUpdating) {
    if (pieces === null || authToken === null) {
        alert('still loading')
        return
    }
    if (pieceName.value === '' || pieceName.value === null || pieceName.value === undefined) {
        alert('invalid piece name')
        return
    }
    let code = window.editor.getValue()
    let images = await getPieceImages()
    let runners = []
    for (let i = 0; i < RUNNERS; i++) {
        runners.push(getRunner())
    }
    for (let runner of runners) {
        await runner.init(code)
    }

    pieces = await loadPiecesFromSheet()
    if (pieces[pieceName.value] === undefined || isUpdating) {
        pieces[pieceName.value] = {
            name : pieceName.value,
            imageData : {
                'white' : images[0],
                'black' : images[1]
            },
            code,
            runners
        }
    } else {
        alert('piece already exists. if you want to change it, load it and then update it.')
        return
    }
    await writePiecesToSheet()
    if (isUpdating) {
        alert('updated piece!')
    } else {
        alert('created piece!')
    }
}

const createPiece = document.getElementById('create-or-update-piece')
const pieceName = document.getElementById('piece-name')
document.getElementById('create-piece').addEventListener('click', async () => {
    createOrUpdate(false)
})

let loadedPiece = null
document.getElementById('load-piece').addEventListener('click', async () => {
    if (pieceName.value === '' || pieceName.value === null || pieceName.value === undefined) {
        alert('invalid piece name')
        return
    }
    piece = pieces[pieceName.value]
    if (piece === undefined) {
        alert('no piece was found with name: "' + pieceName.value + '", do you need to sync?')
        return
    }
    window.editor.getModel().setValue(piece.code)
    setCanvasImageData(piece.imageData)
    loadedPiece = pieceName.value
})

document.getElementById('update-piece').addEventListener('click', async () => {
    if (loadedPiece === null) {
        alert("you haven't loaded a piece!")
        return
    }
    if (pieceName.value !== loadedPiece) {
        alert("name in the piece-name bar was changed after piece was loaded! The piece that was loaded was: " + loadedPiece)
        return
    }
    createOrUpdate(true)
})

document.getElementById('sync').addEventListener('click', async () => {
    pieces = await loadPiecesFromSheet()
    alert('sync complete!')
})