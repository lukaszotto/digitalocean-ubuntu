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
const WebSocketServer = ws.Server

const wss = new WebSocketServer({ server: server })

process.on('SIGINT', () => {
    wss.clients.forEach((client) => {
        client.close()
    })
    server.close(() => {
        shutdownDB()
    })
})

// websockets

wss.on('connection', (ws) => {
    const numclients = wss.clients.size

    console.log('clients conneted: ', numclients)
    wss.broadcast(`Current visitors: ${numclients}`)
    if (ws.readyState == ws.OPEN) {
        ws.send('welcome')
    }

    db.run(`
      INSERT INTO visitors (count, time)
      VALUES (${numclients}, datetime('now'))
      `)

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

// end websocket

// begin database

const sqlite = require('sqlite3')

const db = new sqlite.Database(':memory:')

db.serialize(() => {
    db.run(`
    CREATE TABLE visitors (
      count INTEGER,
      time TEXT
      
    )
    `)
})

const getCounts = () => {
    db.each('SELECT * FROM visitors', (err, row) => {
        console.log(row)
    })
}

const shutdownDB = () => {
    getCounts()
    console.log('shutting down db')
    db.close()
}
