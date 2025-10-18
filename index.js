const express = require('express')
const cors = require('cors')
const app = express()

// ⭐ MIDDLEWARES - EN ESTE ORDEN
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

//llamada a los JSON
const ingresos = require('./ingresos.json')
const gastos = require('./gastos.json')

//Endpoint para obtener todos los ingresos
app.get('/ingresos', (req, res) => {
  res.status(200).json(ingresos);
});

// Endpoint para obtener ingresos filtrados por mes y año
app.get('/ingresos/:anyo/:mes', (req, res) => {
  const { anyo, mes } = req.params;
  if (mes && anyo) {
    // console.log(mes, anyo);
    const ingresosFiltrados = ingresos.filter(ingreso => {
      const fecha = new Date(ingreso.fecha);
      return fecha.getMonth() + 1 === parseInt(mes) && fecha.getFullYear() === parseInt(anyo);
    });
    res.status(200).json(ingresosFiltrados);
  } else {
    res.status(404).json({ error: 'Parámetros mes y año no han sido encontrados' });
  }
});

// Endpoint para crear un nuevo ingreso
app.post('/ingresos', (req, res) => {
  // console.log('Body recibido:', req.body);
  const nuevoIngreso = req.body;
  ingresos.push(nuevoIngreso);
  res.status(201).json(nuevoIngreso);
});

//Endpoint actualizar un ingreso
app.put('/ingresos/:id', (req, res) => {
  const { id } = req.params;
  const ingresoIndex = ingresos.findIndex(i => i.id === parseInt(id));

  if (ingresoIndex !== -1) {
    const updatedIngreso = { ...ingresos[ingresoIndex], ...req.body };
    ingresos[ingresoIndex] = updatedIngreso;
    res.status(200).json(updatedIngreso);
  } else {
    res.status(404).json({ error: 'Ingreso no encontrado' });
  }
});

//Endpoint eliminar un ingreso
app.delete('/ingresos/:id', (req, res) => {
  const { id } = req.params;
  const ingresoIndex = ingresos.findIndex(i => i.id === parseInt(id));
  if (ingresoIndex !== -1) {
    ingresos.splice(ingresoIndex, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Ingreso no encontrado' });
  }
});

//Endpoint para obtener todos los gastos
app.get('/gastos', (req, res) => {
  res.json(gastos);
});

// Endpoint para obtener gastos filtrados por mes y año
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

// Endpoint para crear un nuevo gasto
app.post('/gastos', (req, res) => {
  const nuevoGasto = req.body;
  gastos.push(nuevoGasto);
  res.status(201).json(nuevoGasto);
  console.log(nuevoGasto);
}); 

//Endpoint actualizar un gasto
app.put('/gastos/:id', (req, res) => {
  const { id } = req.params;
  const gastoIndex = gastos.findIndex(g => g.id === parseInt(id));

  if (gastoIndex !== -1) {
    const updatedGasto = { ...gastos[gastoIndex], ...req.body };
    gastos[gastoIndex] = updatedGasto;
    res.status(200).json(updatedGasto);
  } else {
    res.status(404).json({ error: 'Gasto no encontrado' });
  }
});

//Endpoint eliminar un gasto
app.delete('/gastos/:id', (req, res) => {
  const { id } = req.params;  
  const gastoIndex = gastos.findIndex(g => g.id === parseInt(id));

  if (gastoIndex !== -1) {
    gastos.splice(gastoIndex, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Gasto no encontrado' });
  }
});

// ⭐ INICIA EL SERVIDOR CON EXPRESS DIRECTAMENTE
app.listen(1234, () => {
  console.log('Servidor corriendo en http://localhost:1234')
})