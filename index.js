const http = require('node:http')
const cors = require('cors')

const ingresos = require('./ingresos.json')
const gastos = require('./gastos.json')

// Middleware CORS
const corsMiddleware = cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
})

const processRequest = (req, res) => {
  // Aplicar middleware CORS
  corsMiddleware(req, res, () => {
    const { method, url } = req
    console.log(method, url)

    switch (method) {
      case 'GET':
        switch (url) {
          case '/ingresos':
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            return res.end(JSON.stringify(ingresos))
          case '/gastos':
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            return res.end(JSON.stringify(gastos))
          default:
            res.statusCode = 404
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            return res.end('<h1>404</h1>')
        }

      case 'POST':
        switch (url) {
          case '/ingresos': {
            let body = ''

            req.on('data', chunk => {
              body += chunk.toString()
            })

            req.on('end', () => {
              const data = JSON.parse(body)
              res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' })
              data.timestamp = Date.now()
              res.end(JSON.stringify(data))
            })

            break
          }

          default:
            res.statusCode = 404
            res.setHeader('Content-Type', 'text/plain; charset=utf-8')
            return res.end('404 Not Found')
        }
    }
  })
}

const server = http.createServer(processRequest)

server.listen(1234, () => {
  console.log('server listening on port http://localhost:1234')
})