import { Router } from "express";  
import * as gastosModel from '../models/gastosModel.js'; 
import gastos from '../data/gastos.json' with { type: 'json' };
import { validateGasto } from '../schemas/movimientos.js';
import { randomUUID } from 'node:crypto';

export const gastoRouter = Router();

// Endpoint para obtener todos los gastos
gastoRouter.get('/', async (req, res) => {
  const gastos = await gastosModel.getAll();
  res.status(200).json(gastos);
});     
// Endpoint para obtener gastos filtrados por mes y año
gastoRouter.get('/:anyo/:mes', async (req, res) => {
  const { anyo, mes } = req.params;
  if (mes && anyo) {
    const gastosFiltrados = await gastosModel.getByMonthYear(anyo, mes);
    res.status(200).json(gastosFiltrados);
  } else {
    res.status(404).json({ error: 'Parámetros mes y año no han sido encontrados' });
  }
});

// Endpoint para agregar un nuevo gasto
gastoRouter.post('/', async (req, res) => {
  const result = validateGasto(req.body);  // Validar el gasto
  if (result.error) {
    return res.status(400).json({ errors: result.error.issues });
  }
  const gasto = result.data;
  // Crear id con un randomUUID
  const nuevoGasto = { ...gasto, id: randomUUID() };
  await gastosModel.create(nuevoGasto);
  res.status(201).json(nuevoGasto);
});

// Endpoint para actualizar un gasto existente
gastoRouter.put('/:id', async (req, res) => {
  const { id } = req.params;
  const result = validateGasto(req.body);  // Validar también en PUT
  if (result.error) {
    return res.status(400).json({ errors: result.error.issues });
  }
  const updatedGasto = { ...gastos[gastoIndex], ...result.data };
  await gastosModel.update(id, updatedGasto);
  res.status(200).json(updatedGasto);
});

// Endpoint para eliminar un gasto
gastoRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await gastosModel.delete(id);
  res.status(200).json({ message: 'Gasto eliminado correctamente' });
  if (gastoIndex !== -1) {
    gastos.splice(gastoIndex, 1);
    res.status(200).json({ message: 'Gasto eliminado correctamente' });
  } else {
    res.status(404).json({ error: 'Gasto no encontrado' });
  } 
});