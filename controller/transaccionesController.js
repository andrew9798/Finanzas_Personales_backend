// src/controller/transaccionesController.js
import TransaccionesModel from '../models/transaccionesModel.js';
import { randomUUID } from 'crypto';

export default class TransaccionesController {
    
    // 1. Solo obtiene las transacciones del usuario logueado
    static async getAll(req, res) {
        try {
            const tipo = req.tipo;
            const id_usuario = req.user.id; // 🚩 Seguridad: Filtro por usuario
            
            // Importante: Tu modelo debe aceptar el id_usuario ahora
            const transacciones = await TransaccionesModel.getAll(tipo, id_usuario);
            res.status(200).json(transacciones);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // 2. Filtra por fecha pero solo dentro de los datos del usuario
    static async getByMonthYear(req, res) {
        try {
            const tipo = req.tipo;
            const id_usuario = req.user.id; // 🚩 Seguridad
            const { anyo, mes } = req.params;
            
            const transacciones = await TransaccionesModel.getByMonthYear(tipo, anyo, mes, id_usuario);
            
            res.status(200).json(transacciones);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // 3. Verifica que la transacción solicitada pertenezca al usuario
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const id_usuario = req.user.id; // 🚩 Seguridad
            
            const transaccion = await TransaccionesModel.getById(id);
            
            // Si no existe O no pertenece al usuario, damos un 404 (u 403)
            // Es mejor dar un 404 para no confirmar que el ID existe a un atacante
            if (!transaccion || transaccion.id_usuario !== id_usuario) {
                return res.status(404).json({ error: 'Transacción no encontrada' });
            }
            
            res.status(200).json(transaccion);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // 4. Crea la transacción vinculándola al ID real del token
    static async create(req, res) {
        try {
            const tipo = req.tipo;
            const id_usuario = req.user.id; // 🚩 Adiós al valor fijo de pruebas
            
            const { categoria, concepto, cantidad, fecha, ...restData } = req.body;
            
            if (cantidad < 0) {
                return res.status(400).json({ error: "La cantidad no puede ser negativa" });
            }

            if (!concepto || !cantidad || !fecha || !categoria) {
                return res.status(400).json({ error: "Faltan campos obligatorios" });
            }

            const id_categoria = await TransaccionesModel.getCategoriaIdByNombre(categoria, tipo);
            
            if (!id_categoria) {
                return res.status(400).json({ 
                    error: `La categoría "${categoria}" no existe para tipo "${tipo}"` 
                });
            }

            const nuevaTransaccion = { 
                ...restData, 
                id: randomUUID(), 
                tipo,
                concepto,
                cantidad,
                fecha,
                id_categoria,
                id_usuario // 🚩 Vinculado al usuario real
            };
            
            await TransaccionesModel.create(nuevaTransaccion);
            
            res.status(201).json({ ...nuevaTransaccion, categoria });
            
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // 5. Solo permite actualizar si el usuario es el dueño
    static async update(req, res) {
        try {
            const { id } = req.params;
            const id_usuario = req.user.id; // 🚩 Seguridad
            const { categoria, concepto, cantidad, fecha } = req.body;
            
            const transaccionActual = await TransaccionesModel.getById(id);
            
            // 🚩 Verificación de propiedad
            if (!transaccionActual || transaccionActual.id_usuario !== id_usuario) {
                return res.status(404).json({ error: 'Transacción no encontrada' });
            }

            if (!concepto || !cantidad || !fecha || !categoria) {
                return res.status(400).json({ error: "Faltan campos obligatorios" });
            }
            
            const id_categoria = await TransaccionesModel.getCategoriaIdByNombre(categoria, transaccionActual.tipo);
            
            if (!id_categoria) {
                return res.status(400).json({ error: "Categoría no válida" });
            }
            
            const datosParaActualizar = { concepto, cantidad, fecha, id_categoria };
            
            await TransaccionesModel.update(id, datosParaActualizar);
            
            const actualizada = await TransaccionesModel.getById(id);
            res.status(200).json(actualizada);
            
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // 6. Solo permite borrar si el usuario es el dueño
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const id_usuario = req.user.id; // 🚩 Seguridad
            
            const transaccion = await TransaccionesModel.getById(id);
            
            // 🚩 Verificación de propiedad
            if (!transaccion || transaccion.id_usuario !== id_usuario) {
                return res.status(404).json({ error: 'Transacción no encontrada' });
            }
            
            await TransaccionesModel.delete(id);
            res.status(200).json({ message: 'Transacción eliminada correctamente' });
            
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}