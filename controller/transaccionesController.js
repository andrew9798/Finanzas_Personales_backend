// src/controller/transaccionesController.js
import TransaccionesModel from '../models/transaccionesModel.js';
import { randomUUID } from 'crypto';

export default class TransaccionesController {
    static async getAll(req, res) {
        try {
            const tipo = req.tipo;
            const transacciones = await TransaccionesModel.getAll(tipo);
            res.status(200).json(transacciones);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getByMonthYear(req, res) {
        try {
            const tipo = req.tipo;
            const { anyo, mes } = req.params;
            const transacciones = await TransaccionesModel.getByMonthYear(tipo, anyo, mes);
            res.status(200).json(transacciones);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const tipo = req.tipo;
            const id_usuario = "54046b1e-b8be-11f0-bdfa-e0d55e61010f"; // Valor fijo para pruebas
            const transaccionData = req.body;
            const { categoria, ...restData } = transaccionData;
            
            // 1. Buscar el id_categoria si se envió una categoría
            let id_categoria = null;
            if (categoria) {
                id_categoria = await TransaccionesModel.getCategoriaIdByNombre(categoria, tipo);
                
                if (!id_categoria) {
                    console.log("aqui esta el error");
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
                id_categoria,
                id_usuario
            };
            
            await TransaccionesModel.create(nuevaTransaccion);
            
            // 3. Devolver con el nombre de la categoría
            res.status(201).json({
                ...nuevaTransaccion,
                categoria
            });
            
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const tipo = req.tipo;
            const { categoria, ...restData } = req.body;
            
            // 1. Verificar que la transacción existe
            const transaccionActual = await TransaccionesModel.getById(id);
            
            if (!transaccionActual) {
                return res.status(404).json({ error: 'Transacción no encontrada' });
            }
            
            // 2. Si viene 'categoria' (nombre), convertirlo a id_categoria
            let datosParaActualizar = { ...restData };
            
            if (categoria) {
                const id_categoria = await TransaccionesModel.getCategoriaIdByNombre(
                    categoria, 
                    transaccionActual.tipo // Usar el tipo de la transacción actual
                );
                
                if (!id_categoria) {
                    return res.status(400).json({ 
                        error: `La categoría "${categoria}" no existe para tipo "${transaccionActual.tipo}"` 
                    });
                }
                
                datosParaActualizar.id_categoria = id_categoria;
            }
            
            // 3. Si no hay nada que actualizar
            if (Object.keys(datosParaActualizar).length === 0) {
                return res.status(400).json({ error: 'No hay datos para actualizar' });
            }
            
            // 4. Actualizar en BD
            await TransaccionesModel.update(id, datosParaActualizar);
            
            // 5. Obtener transacción actualizada (con nombre de categoría)
            const transaccionActualizada = await TransaccionesModel.getById(id);
            
            res.status(200).json(transaccionActualizada);
            
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            
            // Verificar que existe antes de eliminar
            const transaccion = await TransaccionesModel.getById(id);
            
            if (!transaccion) {
                return res.status(404).json({ error: 'Transacción no encontrada' });
            }
            
            await TransaccionesModel.delete(id);
            res.status(200).json({ message: 'Transacción eliminada correctamente' });
            
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}