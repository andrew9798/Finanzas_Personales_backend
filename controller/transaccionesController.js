// src/controller/transaccionesController.js
import TransaccionesModel from '../models/transaccionesModel.js';
import { randomUUID } from 'crypto';

export default class TransaccionesController {
  static async getAll(req, res) {
    const tipo = req.tipo; // inyectado desde el router
    const transacciones = await TransaccionesModel.getAll(tipo);
    res.status(200).json(transacciones);
  }

  static async getByMonthYear(req, res) {
    const tipo = req.tipo;
    const { anyo, mes } = req.params;
    const transacciones = await TransaccionesModel.getByMonthYear(tipo, anyo, mes);
    res.status(200).json(transacciones);
  }

static async create(req, res) {
    try {
        const tipo = req.tipo;
        const transaccionData = req.body;
        const { categoria, ...restData } = transaccionData; // Separar categoría del resto
        
        // 1. Buscar el id_categoria si se envió una categoría
        let id_categoria = null;
        if (categoria) {
            id_categoria = await TransaccionesModel.getCategoriaIdByNombre(categoria, tipo);
            
            if (!id_categoria) {
                return res.status(400).json({ 
                    error: `La categoría "${categoria}" no existe para tipo "${tipo}"` 
                });
            }
        }
        
        // 2. Crear la transacción con el id_categoria
        const nuevaTransaccion = { 
            ...restData, 
            id: randomUUID(), 
            tipo,
            id_categoria  // Agregar el id_categoria encontrado
        };
        
        await TransaccionesModel.create(nuevaTransaccion);
        
        // 3. Opcional: devolver con el nombre de la categoría en lugar del id
        res.status(201).json({
            ...nuevaTransaccion,
            categoria  // Mantener el nombre para la respuesta
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

  static async update(req, res) {
    const { id } = req.params;
    const updatedData = req.body;
    await TransaccionesModel.update(id, updatedData);
    res.status(200).json({ message: 'Transacción actualizada correctamente' });
  }

  static async delete(req, res) {
    const { id } = req.params;
    await TransaccionesModel.delete(id);
    res.status(200).json({ message: 'Transacción eliminada correctamente' });
  }
}