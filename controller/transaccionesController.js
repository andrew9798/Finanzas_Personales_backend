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
    const tipo = req.tipo;
    const transaccionData = req.body;
    const nuevaTransaccion = { ...transaccionData, id: randomUUID(), tipo };
    await TransaccionesModel.create(nuevaTransaccion);
    res.status(201).json(nuevaTransaccion);
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