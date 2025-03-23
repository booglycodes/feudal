const GRID_SIZE = 32
const SCALE = 10
document.documentElement.style.setProperty('--checker-size', (SCALE * 2) + 'px')

let canvasInfos = ["draw-piece-white", "draw-piece-black"].map(id => {
    let canvas = document.getElementById(id)
    canvas.width = GRID_SIZE * SCALE
    canvas.height = GRID_SIZE * SCALE
    
    let copy = document.createElement("canvas")
    copy.width = GRID_SIZE
    copy.height = GRID_SIZE
    return {
        canvas : canvas,
        ctx : document.getElementById(id).getContext('2d'),
        copy : copy,
        copyCtx : copy.getContext('2d')
    }
})

let currentColor = 'rgb(0,0,0,255)'
let history = []
let redoStack = []

document.getElementById("color-picker").addEventListener("input", (e) => {
    currentColor = hexToRgb(e.target.value)
})

document.getElementById("copy-arrow").addEventListener("click", (e) => {
    saveHistory()
    canvasInfos[1].ctx.clearRect(0, 0, GRID_SIZE * SCALE, GRID_SIZE * SCALE)
    canvasInfos[1].ctx.drawImage(canvasInfos[0].canvas, 0, 0)
    canvasInfos[1].copyCtx.clearRect(0, 0, GRID_SIZE, GRID_SIZE)
    canvasInfos[1].copyCtx.drawImage(canvasInfos[0].copy, 0, 0)
})

document.getElementById("clear-white").addEventListener("click", (e) => {
    saveHistory()
    canvasInfos[0].ctx.clearRect(0, 0, GRID_SIZE * SCALE, GRID_SIZE * SCALE)
    canvasInfos[0].copyCtx.clearRect(0, 0, GRID_SIZE, GRID_SIZE)
})

document.getElementById("clear-black").addEventListener("click", (e) => {
    saveHistory()
    canvasInfos[1].ctx.clearRect(0, 0, GRID_SIZE * SCALE, GRID_SIZE * SCALE)
    canvasInfos[1].copyCtx.clearRect(0, 0, GRID_SIZE, GRID_SIZE)
})

document.getElementById("undo").addEventListener("click", () => {
    if (history.length > 0) {
        redoStack.push(getCanvasData())
        restoreCanvasData(history.pop())
        updateUndoRedoButtons()
    }
})

document.getElementById("redo").addEventListener("click", () => {
    if (redoStack.length > 0) {
        history.push(getCanvasData())
        restoreCanvasData(redoStack.pop())
        updateUndoRedoButtons()
    }
})

let eightDirFill = false
document.getElementById('fill-dir').addEventListener('click', () => {
    eightDirFill = !eightDirFill
    if (eightDirFill) {
        document.getElementById('fill-dir').textContent = '8-directional fill'
    } else {
        document.getElementById('fill-dir').textContent = '4-directional fill'
    }
})

let isDrawing = false
for (let canvasInfo of canvasInfos) {
    canvasInfo.canvas.addEventListener("mousedown", (e) => {
        let fill = document.getElementById('fill').checked
        if (!fill) {
            if (!isDrawing) {
                saveHistory()
            }
            draw(e, canvasInfo) 
        }
        isDrawing = true
    })
    canvasInfo.canvas.addEventListener("mousemove", (e) => { 
        let fill = document.getElementById('fill').checked
        if (isDrawing && !fill) {
            draw(e, canvasInfo) 
        }
    })
    canvasInfo.canvas.addEventListener("mouseup", (e) => { 
        let fill = document.getElementById('fill').checked
        if (isDrawing && fill) {
            saveHistory()
            floodFill(e, canvasInfo)
        }
        isDrawing = false
        canvasInfo.lastPos = null
    })
    canvasInfo.canvas.addEventListener("mouseleave", () => {
        isDrawing = false
        canvasInfo.lastPos = null
    })
}

function getPos(e, canvasInfo) {
    const rect = canvasInfo.canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / SCALE)
    const y = Math.floor((e.clientY - rect.top) / SCALE)
    return [x, y]
}

function draw(e, canvasInfo) {
    const [x, y] = getPos(e, canvasInfo)
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return

    let erase = document.getElementById('erase').checked
    let mirrorX = document.getElementById('mirror-x').checked
    let mirrorY = document.getElementById('mirror-y').checked

    if (canvasInfo.lastPos) {
        let [lx, ly] = canvasInfo.lastPos
        bresenhamLine(lx, ly, x, y, (px, py) => {
            drawPixel(canvasInfo, currentColor, erase, px, py)
            if (mirrorX) drawPixel(canvasInfo, currentColor, erase, GRID_SIZE - px - 1, py)
            if (mirrorY) drawPixel(canvasInfo, currentColor, erase, px, GRID_SIZE - py - 1)
            if (mirrorX && mirrorY) drawPixel(canvasInfo, currentColor, erase, GRID_SIZE - px - 1, GRID_SIZE - py - 1)
        })
    }

    canvasInfo.lastPos = [x, y]
}


function bresenhamLine(x0, y0, x1, y1, callback) {
    let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1
    let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1
    let err = dx + dy, e2

    while (true) {
        callback(x0, y0)
        if (x0 === x1 && y0 === y1) break
        e2 = 2 * err
        if (e2 >= dy) { err += dy; x0 += sx }
        if (e2 <= dx) { err += dx; y0 += sy }
    }
}

function floodFill(e, canvasInfo) {
    const [x, y] = getPos(e, canvasInfo)
    let originalColor = getPixelColor(canvasInfo, x, y)
    if (currentColor === originalColor) {
        return
    }

    let stack = [[x, y]]
    while (stack.length !== 0) {
        const [cx, cy] = stack.pop()
        if (cx < 0 || cx >= GRID_SIZE || cy < 0 || cy >= GRID_SIZE) {
            continue
        }
        if (getPixelColor(canvasInfo, cx, cy) === originalColor) {
            drawPixel(canvasInfo, currentColor, false, cx, cy)
            stack.push([cx + 1, cy])
            stack.push([cx - 1, cy])
            stack.push([cx, cy + 1])
            stack.push([cx, cy - 1])
            if (eightDirFill) {
                stack.push([cx + 1, cy + 1])
                stack.push([cx - 1, cy - 1])
                stack.push([cx - 1, cy + 1])
                stack.push([cx + 1, cy - 1])
            }
        }
    }
}

function getPixelColor(canvasInfo, x, y) {
    const pixel = canvasInfo.copyCtx.getImageData(x, y, 1, 1).data
    return `rgb(${pixel[0]},${pixel[1]},${pixel[2]},${pixel[3]})`
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgb(${r},${g},${b},255)`
}

function drawPixel(canvasInfo, color, erase, x, y) {
    if (erase) {
        canvasInfo.ctx.clearRect(x * SCALE, y * SCALE, SCALE, SCALE)
        canvasInfo.copyCtx.clearRect(x, y, 1, 1)
    } else {
        canvasInfo.ctx.fillStyle = color
        canvasInfo.ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE)

        canvasInfo.copyCtx.fillStyle = color
        canvasInfo.copyCtx.fillRect(x, y, 1, 1)
    }
}

function saveHistory() {
    history.push(getCanvasData())
    redoStack = []
    updateUndoRedoButtons()
}

function getCanvasData() {
    return canvasInfos.map(canvasInfo => [canvasInfo.canvas.toDataURL(), canvasInfo.copy.toDataURL()])
}

function restoreCanvasData(data) {
    data.forEach((imgData, idx) => {
        let canvasInfo = canvasInfos[idx]
        let canvasImg = new Image()
        canvasImg.src = imgData[0]
        canvasImg.onload = () => {
            canvasInfo.ctx.clearRect(0, 0, GRID_SIZE * SCALE, GRID_SIZE * SCALE)
            canvasInfo.ctx.drawImage(canvasImg, 0, 0)
        }
        let copyImg = new Image()
        copyImg.src = imgData[1]
        copyImg.onload = () => {
            canvasInfo.copyCtx.clearRect(0, 0, GRID_SIZE, GRID_SIZE)
            canvasInfo.copyCtx.drawImage(copyImg, 0, 0)
        }
    })
}

function updateUndoRedoButtons() {
    document.getElementById('undo').disabled = history.length === 0
    document.getElementById('redo').disabled = redoStack.length === 0
}

/**
 * @function loadImage
 * @param {string} src 
 * @returns {Promise<Image>}
 */
function loadImage(src) {
    return new Promise((resolve, reject) => {
      let img = new Image()
      img.src = src
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Image failed to load'))
    })
}

async function getPieceImages() {
    let imageUrls = canvasInfos.map(canvasInfo => canvasInfo.copy.toDataURL())
    let images = []
    for (let imageUrl of imageUrls) {
        images.push(await loadImage(imageUrl))
    }
    return images
}

function setCanvasImageData(imageData) {
    [imageData['white'], imageData['black']].forEach((imgData, idx) => {
        let canvasInfo = canvasInfos[idx]
        canvasInfo.copyCtx.imageSmoothingEnabled = false
        canvasInfo.copyCtx.clearRect(0, 0, GRID_SIZE, GRID_SIZE)
        canvasInfo.copyCtx.drawImage(imgData, 0, 0)

        canvasInfo.ctx.imageSmoothingEnabled = false
        canvasInfo.ctx.clearRect(0, 0, GRID_SIZE * SCALE, GRID_SIZE * SCALE)
        canvasInfo.ctx.drawImage(imgData, 0, 0, GRID_SIZE * SCALE, GRID_SIZE * SCALE)
    })
}


