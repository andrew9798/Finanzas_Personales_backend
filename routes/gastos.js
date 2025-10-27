import { Router } from "express";   

import gastos from '../data/gastos.json' with { type: 'json' };
import { validateGasto } from '../schemas/movimientos.js';
import { randomUUID } from 'node:crypto';

export const gastoRouter = Router();

// Endpoint para obtener todos los gastos
gastoRouter.get('/', (req, res) => {
  res.status(200).json(gastos);
});     
// Endpoint para obtener gastos filtrados por mes y año
gastoRouter.get('/:anyo/:mes', (req, res) => {
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

// Endpoint para agregar un nuevo gasto
gastoRouter.post('/', (req, res) => {
  const result = validateGasto(req.body);  // Validar el gasto
  if (result.error) {
    return res.status(400).json({ errors: result.error.issues });
  }
  const gasto = result.data;
  // Crear id con un randomUUID
  const nuevoGasto = { ...gasto, id: randomUUID() };
  gastos.push(nuevoGasto);
  res.status(201).json(nuevoGasto);
});

// Endpoint para actualizar un gasto existente
gastoRouter.put('/:id', (req, res) => {
  const { id } = req.params;
  const gastoIndex = gastos.findIndex(g => String(g.id) === String(id)); // Usar String para comparar

  if (gastoIndex !== -1) {
    const result = validateGasto(req.body);  // Validar también en PUT

    if (result.error) {
      return res.status(400).json({ errors: result.error.issues });
    }

    const updatedGasto = { ...gastos[gastoIndex], ...result.data };
    gastos[gastoIndex] = updatedGasto;
    res.status(200).json(updatedGasto);
  } else {
    res.status(404).json({ error: 'Gasto no encontrado' });
  }
});

// Endpoint para eliminar un gasto
gastoRouter.delete('/:id', (req, res) => {
  const { id } = req.params;
  const gastoIndex = gastos.findIndex(g => String(g.id) === String(id)); // Usar String para comparar   
  if (gastoIndex !== -1) {
    gastos.splice(gastoIndex, 1);
    res.status(200).json({ message: 'Gasto eliminado correctamente' });
  } else {
    res.status(404).json({ error: 'Gasto no encontrado' });
  } 
});