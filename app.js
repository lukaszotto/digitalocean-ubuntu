const http = require('http')

const PORT = 3000

const server = http.createServer((req, res) => {
  res.write('on the way')
  res.end()
  
})

server.listen(PORT)
console.log('server started')
