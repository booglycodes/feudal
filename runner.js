function getRunner() {
    let blob = new Blob([`${library.toString()}\n(${workerScript.toString()})()`], { type: "application/javascript" })
    let worker = new Worker(URL.createObjectURL(blob))

    async function handleWorkerRequest(type, args) {
        return new Promise((resolve, reject) => {
            const id = Math.random().toString(36).slice(2)
            function listener(e) {
                if (e.data.id === id) {
                    worker.removeEventListener("message", listener)
                    if (e.data.error) {
                        reject(e.data.error)
                    } else {
                        resolve(e.data.result)
                    }
                }
            }
            worker.addEventListener("message", listener)
            worker.postMessage({ id, type, ...args })
        })
    }

    return {
        worker,
        async moves(batch) {
            return handleWorkerRequest('moves', {batch})
        },
        async canCaptureKing(batch) {
            return handleWorkerRequest('canCaptureKing', {batch})
        },
        async init(code) {
            this.code = code
            return handleWorkerRequest('init', { code })
        },
    }
}

function workerScript() {
    "use strict"

    function getAllProperties(obj) {
        let props = new Set()
        while (obj) {
            Object.getOwnPropertyNames(obj).forEach(prop => props.add(prop))
            obj = Object.getPrototypeOf(obj)
        }
        return Array.from(props)
    }

    let safeScope = Object.create(null)
    const WHITELIST = ['console', 'postMessage', 'Function', 'library', 'Math', 'JSON']
    for (let key of getAllProperties(self)) {
        if (WHITELIST.includes(key)) {
            continue
        }
        try {
            self[key] = undefined
        } catch (e) {
            // some properties cannot be redefined. ignore these.
        }
    }

    let exports = null
    self.onmessage = function (e) {
        let { id, type, batch, code } = e.data
        try {
            if (type === 'init') {
                try {
                    exports = new Function(code)()
                    if (typeof exports.moves !== 'function') throw "Missing required 'moves' function"
                    if (typeof exports.rules !== 'function') throw "Missing required 'rules' function"
                    postMessage({ id })
                } catch (err) {
                    exports = null
                    throw err
                }
                return
            }
            if (!exports) throw 'worker has not been successfully initialized'

            if (type === 'moves') {
                let results = []
                for (let {pieceIds, state} of batch) {
                    for (let pieceId of pieceIds) {
                        results.push(exports.moves(pieceId, state))
                    }
                }
                postMessage({ id, result: results })
                return
            } 
            if (type === 'canCaptureKing') {
                let results = []
                
                for (let { pieceIds, state } of batch) {
                    let kingAlreadyCaptured = state.pieces.some(piece => 
                        piece.name === 'king' && piece.color !== state.turn && piece.captured
                    )
                
                    if (kingAlreadyCaptured) {
                        results.push(state.origin)
                        continue
                    }
                
                    for (let pieceId of pieceIds) {
                        let moves = exports.moves(pieceId, state)
                        if (moves.some(move => 
                            move.state.pieces.some(piece => piece.name === 'king' && piece.color !== state.turn && piece.captured)
                        )) {
                            results.push(state.origin)
                            break
                        }
                    }
                }
            
                postMessage({ id, result: results })
                
                return
            }
            throw "Received invalid request type: " + type
        } catch (err) {
            postMessage({ id, error: err.toString() })
        }
    }
}

