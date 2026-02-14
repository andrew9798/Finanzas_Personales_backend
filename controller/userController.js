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

    static async getById(req, res) {
        try {
            const tipo = req.tipo;
            const { id } = req.params;
            const transaccion = await TransaccionesModel.getById(tipo, id);
            res.status(200).json(transaccion);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getByEmail(req, res) {
        try {
            const tipo = req.tipo;
            const { email } = req.params;
            const transaccion = await TransaccionesModel.getByEmail(tipo, email);
            res.status(200).json(transaccion);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }   
    }

    static async getByNickname(req, res) {
        try {
            const tipo = req.tipo;
            const { nickname } = req.params;
            const transaccion = await TransaccionesModel.getByNickname(tipo, nickname);
            res.status(200).json(transaccion);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            console.log("lo que me llega del frontend",req.body);
            const tipo = req.tipo;
            const id_usuario = randomUUID(); 
            const transaccionData = req.body;
            const { categoria, ...restData } = transaccionData;
            const transaccion = await TransaccionesModel.create(tipo, id_usuario, restData);
            res.status(201).json(transaccion);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}