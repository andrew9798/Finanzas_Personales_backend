import express, { json } from 'express';
import cors from 'cors';
const app = express()
import { randomUUID } from 'crypto';

// ⭐ ACTUALIZAR IMPORTS - Importar las funciones y categorías correctas
import { validateIngreso, validateGasto, categoriasIngresos, categoriasGastos } from "./schemas/movimientos.js";

// Deshabilitar la cabecera 'X-Powered-By' por seguridad
app.disable('x-powered-by');

// ⭐ MIDDLEWARES - EN ESTE ORDEN
app.use(json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

//llamada a los JSON
import ingresos from '../frontend/src/services/ingresos.js';
import gastos from '../frontend/src/services/gastos.js';

// ⭐ NUEVOS ENDPOINTS PARA OBTENER CATEGORÍAS
app.get('/categorias/ingresos', (req, res) => {
  res.status(200).json(categoriasIngresos);
});

app.get('/categorias/gastos', (req, res) => {
  res.status(200).json(categoriasGastos);
});

//Endpoint para obtener todos los ingresos
app.get('/ingresos', (req, res) => {
  res.status(200).json(ingresos);
});

// Endpoint para obtener ingresos filtrados por mes y año
app.get('/ingresos/:anyo/:mes', (req, res) => {
  const { anyo, mes } = req.params;
  if (mes && anyo) {
    const ingresosFiltrados = filter(ingreso => {
      const fecha = new Date(ingreso.fecha);
      return fecha.getMonth() + 1 === parseInt(mes) && fecha.getFullYear() === parseInt(anyo);
    });
    res.status(200).json(ingresosFiltrados);
  } else {
    res.status(404).json({ error: 'Parámetros mes y año no han sido encontrados' });
  }
});

// ⭐ ACTUALIZADO - Endpoint para crear un nuevo ingreso
app.post('/ingresos', (req, res) => {
  const result = validateIngreso(req.body);  // ⭐ Cambiado a validateIngreso

  if (result.error) {
    //quiero una respuesta que me de los errores de validacion
    return res.status(400).json({ errors: JSON.parse(result.error.message) });
  }

  const ingreso = result.data;
  const id = randomUUID();
  const nuevoIngreso = { ...ingreso, id };
  push(nuevoIngreso);
  res.status(201).json(nuevoIngreso);
});

//Endpoint actualizar un ingreso
app.put('/ingresos/:id', (req, res) => {
  const { id } = req.params;
  const ingresoIndex = findIndex(i => i.id === id);  // ⭐ Quitado parseInt si usas UUID

  if (ingresoIndex !== -1) {
    const result = validateIngreso(req.body);  // ⭐ Validar también en PUT
    
    if (result.error) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const updatedIngreso = { ...ingresos[ingresoIndex], ...result.data };
    ingresos[ingresoIndex] = updatedIngreso;
    res.status(200).json(updatedIngreso);
  } else {
    res.status(404).json({ error: 'Ingreso no encontrado' });
  }
});

//Endpoint eliminar un ingreso
app.delete('/ingresos/:id', (req, res) => {
  const { id } = req.params;
  const ingresoIndex = findIndex(i => i.id === id);  // ⭐ Quitado parseInt
  
  if (ingresoIndex !== -1) {
    splice(ingresoIndex, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Ingreso no encontrado' });
  }
});

//Endpoint para obtener todos los gastos
app.get('/gastos', (req, res) => {
  res.status(200).json(gastos);
});

// Endpoint para obtener gastos filtrados por mes y año
app.get('/gastos/:anyo/:mes', (req, res) => {
  const { anyo, mes } = req.params; 

  if (mes && anyo) {
    const gastosFiltrados = _filter(gasto => {
      const fecha = new Date(gasto.fecha);
      return fecha.getMonth() + 1 === parseInt(mes) && fecha.getFullYear() === parseInt(anyo);
    });
    res.status(200).json(gastosFiltrados);
  } else {
    res.status(404).json({ error: 'Parámetros mes y año no han sido encontrados' });
  }
}); 

// ⭐ ACTUALIZADO - Endpoint para crear un nuevo gasto
app.post('/gastos', (req, res) => {
  const result = validateGasto(req.body);  // ⭐ Agregar validación

  if (result.error) {
    return res.status(400).json({ errors: result.error.errors });
  }

  const gasto = result.data;
  const id = randomUUID();
  const nuevoGasto = { ...gasto, id };
  _push(nuevoGasto);
  res.status(201).json(nuevoGasto);
}); 

//Endpoint actualizar un gasto
app.put('/gastos/:id', (req, res) => {
  const { id } = req.params;
  const gastoIndex = _findIndex(g => g.id === id);  // ⭐ Quitado parseInt

  if (gastoIndex !== -1) {
    const result = validateGasto(req.body);  // ⭐ Validar también en PUT
    
    if (result.error) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const updatedGasto = { ...gastos[gastoIndex], ...result.data };
    gastos[gastoIndex] = updatedGasto;
    res.status(200).json(updatedGasto);
  } else {
    res.status(404).json({ error: 'Gasto no encontrado' });
  }
});

//Endpoint eliminar un gasto
app.delete('/gastos/:id', (req, res) => {
  const { id } = req.params;  
  const gastoIndex = _findIndex(g => g.id === id);  // ⭐ Quitado parseInt

  if (gastoIndex !== -1) {
    _splice(gastoIndex, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Gasto no encontrado' });
  }
});

// ⭐ INICIA EL SERVIDOR CON EXPRESS DIRECTAMENTE
app.listen(1234, () => {
  console.log('Servidor corriendo en http://localhost:1234')
})