const http = require('node:http')
const express = require('express')
const cors = require('cors')
const app = express()

const ingresos = require('./ingresos.json')
const gastos = require('./gastos.json')

// Middleware CORS
const corsMiddleware = cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
})


//Endpoint para obtener todos los ingresos
app.get('/ingresos', (req, res) => {
  res.status(200).json(ingresos);
});

// Endpoint para obtener ingresos filtrados por mes y año, considerando que la fecha es un string en formato "YYYY-MM-DD" y que se pasa como parametro enviado en la url
app.get('/ingresos/:anyo/:mes', (req, res) => {
  const { anyo, mes } = req.params;
  if (mes && anyo) {
    console.log(mes, anyo);
    const ingresosFiltrados = ingresos.filter(ingreso => {
      const fecha = new Date(ingreso.fecha);
      return fecha.getMonth() + 1 === parseInt(mes) && fecha.getFullYear() === parseInt(anyo);
    });
    res.status(200).json(ingresosFiltrados);
  } else {
    // res.status(200).json(ingresos);
    res.status(404).json({ error: 'Parámetros mes y año no han sido encontrados' });
  }
});

// Endpoint para craear un nuevo ingreso
app.post('/ingresos', (req, res) => {
  const nuevoIngreso = req.body;
  ingresos.push(nuevoIngreso);
  res.status(201).json(nuevoIngreso);
});


//Endpoint para obtener todos los gastos
app.get('/gastos', (req, res) => {
  res.json(gastos);
});

// Endpoint para obtener gastos filtrados por mes y año, considerando que la fecha es un string en formato "YYYY-MM-DD" y que se pasa como parametro enviado en la url
app.get('/gastos/:anyo/:mes', (req, res) => {
  const { anyo, mes } = req.params; 

  if (mes && anyo) {
    const gastosFiltrados = gastos.filter(gasto => {
      const fecha = new Date(gasto.fecha);
      return fecha.getMonth() + 1 === parseInt(mes) && fecha.getFullYear() === parseInt(anyo);
    });
    res.status(200).json(gastosFiltrados);
  } else {
    res.status(404).json({ error: 'Parámetros mes y año no han sido encontrados' });
  }
}); 

// Endpoint para craear un nuevo gasto
app.post('/gastos', (req, res) => {
  const nuevoGasto = req.body;
  gastos.push(nuevoGasto);
  res.status(201).json(nuevoGasto);
}); 

const processRequest = (req, res) => {
  corsMiddleware(req, res, () => {
    app(req, res)
  })
}

const server = http.createServer(processRequest)

server.listen(1234, () => {
  console.log('server listening on port http://localhost:1234')
})  