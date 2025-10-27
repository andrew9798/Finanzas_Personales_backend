import { Router } from "express";

import ingresos from '../data/ingresos.json' with { type: 'json' };
import { validateIngreso } from '../schemas/movimientos.js';
import { randomUUID } from 'node:crypto';    

export const ingresoRouter = Router();

// Endpoint para obtener todos los ingresos

ingresoRouter.get('/', (req, res) => {
  res.status(200).json(ingresos);
});

// Endpoint para obtener ingresos filtrados por mes y año
ingresoRouter.get('/:anyo/:mes', (req, res) => {
  const { anyo, mes } = req.params;
  if (mes && anyo) {
    const ingresosFiltrados = ingresos.filter(ingreso => {
      const fecha = new Date(ingreso.fecha);
      return fecha.getMonth() + 1 === parseInt(mes) && fecha.getFullYear() === parseInt(anyo);
    });
    res.status(200).json(ingresosFiltrados);
  } else {
    res.status(404).json({ error: 'Parámetros mes y año no han sido encontrados' });
  }
});

// Endpoint para agregar un nuevo ingreso
ingresoRouter.post('/', (req, res) => {
  const result = validateIngreso(req.body);  // Validar el ingreso          
    if (result.error) {
        return res.status(400).json({ errors: result.error.issues });   
    }
    const ingreso = result.data;
    // Crear id con un randomUUID
    const nuevoIngreso = { ...ingreso, id: randomUUID() };  
    ingresos.push(nuevoIngreso);
    res.status(201).json(nuevoIngreso);
});

// Endpoint para actualizar un ingreso existente
ingresoRouter.put('/:id', (req, res) => {
  const { id } = req.params;
  const ingresoIndex = ingresos.findIndex(i => String(i.id) === String(id)); // Usar String para comparar

  if (ingresoIndex !== -1) {
    const result = validateIngreso(req.body);  // Validar también en PUT

    if (result.error) {
      return res.status(400).json({ errors: result.error.issues });
    }

    const updatedIngreso = { ...ingresos[ingresoIndex], ...result.data };
    ingresos[ingresoIndex] = updatedIngreso;
    res.status(200).json(updatedIngreso);
  } else {
    res.status(404).json({ error: 'Ingreso no encontrado' });
  }
}); 

// Endpoint para eliminar un ingreso
ingresoRouter.delete('/:id', (req, res) => {
  const { id } = req.params;
  const ingresoIndex = ingresos.findIndex(i => String(i.id) === String(id)); // Usar String para comparar 
  if (ingresoIndex !== -1) {
    ingresos.splice(ingresoIndex, 1);
    res.status(200).json({ message: 'Ingreso eliminado correctamente' });
  } else {
    res.status(404).json({ error: 'Ingreso no encontrado' });
  }
});
