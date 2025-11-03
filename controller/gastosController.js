import { randomUUID } from 'node:crypto';
import TransaccionesModel from '../models/transaccionesModel.js';

export default class gastosController {
    // Aquí podrían ir métodos relacionados con la lógica de negocio de gastos
    static async getAllGastos(req, res) {
        const gastos = await TransaccionesModel.getAll();
        res.status(200).json(gastos);
    }

    // Endpoint para obtener gastos filtrados por mes y año
    static async getGastosByMonthYear(req, res) {
        const { anyo, mes } = req.params;
        const gastos = await TransaccionesModel.getByMonthYear(anyo, mes);
        res.status(200).json(gastos);
    }

    // Endpoint para crear un nuevo gasto
    static async createGasto(req, res) {
        const gastoData = req.body;
        const nuevoGasto = { ...gastoData, id: randomUUID() };
        await TransaccionesModel.create(nuevoGasto);
        res.status(201).json(nuevoGasto);
    }

    // Endpoint para actualizar un gasto existente
    static async updateGasto(req, res) {
        const { id } = req.params;
        const updatedData = req.body;
        await TransaccionesModel.update(id, updatedData);
        res.status(200).json({ message: 'Gasto actualizado correctamente' });
    }

    // Endpoint para eliminar un gasto
    static async deleteGasto(req, res) {
        const { id } = req.params;
        await TransaccionesModel.delete(id);
        res.status(200).json({ message: 'Gasto eliminado correctamente' });
    }
}