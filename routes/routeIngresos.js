import { Router } from "express";
import ingresosModel from '../models/ingresosModel.js';
import ingresos from '../data/ingresos.json' with { type: 'json' };
import { validateIngreso } from '../schemas/movimientos.js';
import { randomUUID } from 'node:crypto';

export const ingresoRouter = Router();

// Endpoint para obtener todos los ingresos

ingresoRouter.get('/', async (req, res) => {
  const ingresos = await ingresosModel.getAll();
  res.status(200).json(ingresos);
});

// Endpoint para obtener ingresos filtrados por mes y año
ingresoRouter.get('/:anyo/:mes', async (req, res) => {
  const { anyo, mes } = req.params;
  if (mes && anyo) {
    const ingresosFiltrados = await ingresosModel.getByMonthYear(anyo, mes);
    res.status(200).json(ingresosFiltrados);
  } else {
    res.status(404).json({ error: 'Parámetros mes y año no han sido encontrados' });
  }
});

// Endpoint para agregar un nuevo ingreso
ingresoRouter.post('/', async (req, res) => {
  const result = validateIngreso(req.body);  // Validar el ingreso          
  if (result.error) {
    return res.status(400).json({ errors: result.error.issues });
  }
  const ingreso = result.data;
  // Crear id con un randomUUID
  const nuevoIngreso = { ...ingreso, id: randomUUID() };
  await ingresosModel.create(nuevoIngreso);
  res.status(201).json(nuevoIngreso);
});

// Endpoint para actualizar un ingreso existente
ingresoRouter.put('/:id', async (req, res) => {
  const { id } = req.params;
  const ingresoIndex = await ingresosModel.getById(id);

  if (ingresoIndex !== -1) {
    const result = validateIngreso(req.body);  // Validar también en PUT

    if (result.error) {
      return res.status(400).json({ errors: result.error.issues });
    }
    const updatedIngreso = { ...ingresos[ingresoIndex], ...result.data };
    await ingresosModel.update(id, updatedIngreso);
    res.status(200).json(updatedIngreso);
  } else {
    res.status(404).json({ error: 'Ingreso no encontrado' });
  }
});

// Endpoint para eliminar un ingreso
ingresoRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await ingresosModel.delete(id);
  res.status(200).json({ message: 'Ingreso eliminado correctamente' });
});


