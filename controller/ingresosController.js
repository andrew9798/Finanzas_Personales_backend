import TransaccionesModel from '../models/transaccionesModel.js';
import { randomUUID } from 'node:crypto';

export default class ingresosController {   
    // Aquí podrían ir métodos relacionados con la lógica de negocio de ingresos
    static async getAllIngresos(req, res) {
        const ingresos = await TransaccionesModel.getAll();
        res.status(200).json(ingresos);
    }

    // Endpoint para obtener ingresos filtrados por mes y año
    static async getIngresosByMonthYear(req, res) {
        const { anyo, mes } = req.params;   
        const ingresos = await TransaccionesModel.getByMonthYear(anyo, mes);
        res.status(200).json(ingresos);
    }

    // Endpoint para crear un nuevo ingreso
    static async createIngreso(req, res) {
        const ingresoData = req.body;
        const nuevoIngreso = { ...ingresoData, id: randomUUID() };
        await TransaccionesModel.create(nuevoIngreso);
        res.status(201).json(nuevoIngreso);
    }

    // Endpoint para actualizar un ingreso existente
    static async updateIngreso(req, res) {
        const { id } = req.params;
        const updatedData = req.body;
        await TransaccionesModel.update(id, updatedData);
        res.status(200).json({ message: 'Ingreso actualizado correctamente' });
    }

    // Endpoint para eliminar un ingreso
    static async deleteIngreso(req, res) {
        const { id } = req.params;
        await TransaccionesModel.delete(id);
        res.status(200).json({ message: 'Ingreso eliminado correctamente' });
    }
}