import userModel from '../models/usersModel.js';
import jwt from 'jsonwebtoken';

export default class authController {

    static async register(req, res) {
        try {
            const { nickname, gmail, pass } = req.body;

            // Validar campos requeridos
            if (!nickname || !gmail || !pass) {
                return res.status(400).json({ error: 'Faltan campos: nickname, gmail y pass son obligatorios' });
            }

            // Verificar duplicados
            const emailExiste = await userModel.emailExists(gmail);
            if (emailExiste) {
                return res.status(409).json({ error: 'El email ya está registrado' });
            }

            const nicknameExiste = await userModel.nicknameExists(nickname);
            if (nicknameExiste) {
                return res.status(409).json({ error: 'El nickname ya está en uso' });
            }

            // Crear usuario (tipo 'usuario' por defecto, definido en el model)
            const insertId = await userModel.create({ nickname, gmail, pass });

            res.status(201).json({
                message: 'Usuario registrado correctamente',
                id: insertId
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async login(req, res) {
        try {
            const { gmail, pass } = req.body;

            if (!gmail || !pass) {
                return res.status(400).json({ error: 'gmail y pass son obligatorios' });
            }

            // Buscar usuario (getByEmail incluye el pass hasheado)
            const user = await userModel.getByEmail(gmail);
            if (!user) {
                return res.status(401).json({ error: 'Credenciales incorrectas' });
            }

            // Verificar contraseña
            const passwordValido = await userModel.verifyPassword(pass, user.pass);
            if (!passwordValido) {
                return res.status(401).json({ error: 'Credenciales incorrectas' });
            }

            // Actualizar último acceso
            await userModel.updateLastAccess(user.id);

            // Generar JWT con tipo incluido (aquí es donde se asigna req.tipo luego)
            const token = jwt.sign(
                {
                    id: user.id,
                    tipo: user.tipo,       // <-- esto llega como req.tipo en tus controllers
                    nickname: user.nickname
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(200).json({
                token,
                user: {
                    id: user.id,
                    nickname: user.nickname,
                    gmail: user.gmail,
                    tipo: user.tipo
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async logout(req, res) {
        // JWT es stateless: el logout real ocurre en el cliente borrando el token.
        // Si necesitas invalidación server-side, implementa una blacklist en Redis o BD.
        res.status(200).json({ message: 'Sesión cerrada correctamente' });
    }
}