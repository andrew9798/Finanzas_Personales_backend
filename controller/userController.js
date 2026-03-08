import userModel from '../models/usersModel.js';

// ─── Nombre corregido: era "TransaccionesController" ─────────────────────────

export default class UserController {

    static async getAll(req, res) {
        try {
            // ✅ Corregido: req.tipo → req.user.tipo (viene del JWT decodificado en verifyToken)
            const { tipo } = req.user;
            const users = await userModel.getAll(tipo);
            res.status(200).json(users);
        } catch (error) {
            console.error('[UserController.getAll]', error);
            // ✅ Corregido: nunca exponer error.message al cliente
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    static async getById(req, res) {
        try {
            const { tipo, id: requesterId } = req.user;
            const { id } = req.params;

            // ✅ Añadido: un usuario normal solo puede verse a sí mismo
            if (tipo === 'usuario' && id !== requesterId.toString()) {
                return res.status(403).json({ error: 'Acceso denegado' });
            }

            const user = await userModel.getById(id);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.status(200).json(user);
        } catch (error) {
            console.error('[UserController.getById]', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    static async getByNickname(req, res) {
        try {
            const { tipo } = req.user;

            // ✅ Solo admins pueden buscar usuarios por nickname
            if (tipo !== 'admin') {
                return res.status(403).json({ error: 'Acceso denegado' });
            }

            const { nickname } = req.params;
            const user = await userModel.getByNickname(nickname);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.status(200).json(user);
        } catch (error) {
            console.error('[UserController.getByNickname]', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    // ✅ Eliminado: getByEmail — exponía datos de otros usuarios sin control
    //    Si lo necesitas para admin, protégelo con requireRole('admin') en el router

    static async update(req, res) {
        try {
            const { tipo, id: requesterId } = req.user;
            const { id } = req.params;

            // ✅ Añadido: un usuario solo puede editarse a sí mismo
            if (tipo === 'usuario' && id !== requesterId.toString()) {
                return res.status(403).json({ error: 'Acceso denegado' });
            }

            const userData = req.body;

            // ✅ Añadido: evitar que un usuario se asigne su propio tipo (escalada de privilegios)
            if (tipo !== 'admin') {
                delete userData.tipo;
            }

            const updatedUser = { ...userData, id };
            await userModel.update(updatedUser);
            res.status(200).json(updatedUser);
        } catch (error) {
            console.error('[UserController.update]', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    static async delete(req, res) {
        try {
            const { tipo, id: requesterId } = req.user;
            const { id } = req.params;

            // ✅ Añadido: solo admins pueden borrar otros usuarios
            if (tipo !== 'admin' && id !== requesterId.toString()) {
                return res.status(403).json({ error: 'Acceso denegado' });
            }

            await userModel.delete(id);
            res.status(204).send();
        } catch (error) {
            console.error('[UserController.delete]', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}