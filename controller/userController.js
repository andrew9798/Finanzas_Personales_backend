import userModel from '../models/usersModel.js';
import { randomUUID } from 'crypto';

export default class TransaccionesController {
    static async getAll(req, res) {
        try {
            const tipo = req.tipo;
            const users = await userModel.getAll(tipo);
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const tipo = req.tipo;
            const { id } = req.params;
            const userById = await userModel.getById(tipo, id);
            res.status(200).json(userById);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getByEmail(req, res) {
        try {
            const tipo = req.tipo;
            const { email } = req.params;
            const userByEmail = await userModel.getByEmail(tipo, email);
            res.status(200).json(userByEmail);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getByNickname(req, res) {
        try {
            const tipo = req.tipo;
            const { nickname } = req.params;
            const userByName = await userModel.getByNickname(tipo, nickname);
            res.status(200).json(userByName);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const tipo = req.tipo;
            const userData = req.body;
            const nuevoUser = { ...userData, id: randomUUID(), tipo };
            await userModel.create(nuevoUser);
            res.status(201).json(nuevoUser);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const tipo = req.tipo;
            const { id } = req.params;
            const userData = req.body;
            const updatedUser = { ...userData, id, tipo };
            await userModel.update(updatedUser);
            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const tipo = req.tipo;
            const { id } = req.params;
            await userModel.delete(tipo, id);
            res.status(204).send();
        }catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


}