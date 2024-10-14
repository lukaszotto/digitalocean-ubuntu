const express = require('express')
const ws = require('ws')
const server = require('http').createServer()

const app = express()

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname })
})

server.on('request', app)
server.listen(3000, () => {
    console.log('server started on 3000')
})

// websockets

const WebSocketServer = ws.Server

const wss = new WebSocketServer({ server: server })

wss.on('connection', (ws) => {
    const numclients = wss.clients.size

    console.log('clients conneted: ', numclients)
    wss.broadcast(`Current visitors: ${numclients}`)
    if (ws.readyState == ws.OPEN) {
        ws.send('welcome')
    }

    ws.on('close', () => {
        wss.broadcast(`Current visitors: ${numclients}`)
        console.log('client disconnected')
    })
})

wss.broadcast = (data) => {
    wss.clients.forEach((client) => {
        client.send(data)
    })
}
