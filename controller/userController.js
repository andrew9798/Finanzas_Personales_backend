import userModel from '../models/usersModel.js';

// ─── Nombre corregido: era "TransaccionesController" ─────────────────────────

export default class UserController {

    static async getAll(req, res) {
        try {
            // ✅ Corregido: req.tipo → req.user.tipo (viene del JWT decodificado en verifyToken)
            const users = await userModel.getAll();
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
            // if (tipo === 'usuario' && id !== requesterId.toString()) {
            //     return res.status(403).json({ error: 'Acceso denegado' });
            // }

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

            //✅ Añadido: solo admins pueden borrar otros usuarios
            if (tipo !== 'admin' && id !== requesterId.toString()) {
                return res.status(403).json({ error: 'Acceso denegado' });
            }

            const userData = req.body;
            console.log('Datos recibidos para actualización:', userData);

            if (tipo !== 'admin') {
                delete userData.tipo;
            }

            await userModel.update(id, userData);

            res.status(200).json({ ...userData, id });

        } catch (error) {

            // Error de duplicado en MySQL  //ER_DUP_ENTRY -- código específico para detectar violación de UNIQUE
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    error: 'El email o nickname ya está en uso'
                });
            }

            console.error('[UserController.update]', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    static async delete(req, res) {
    try {
        const { tipo, id: requesterId } = req.user;
        const { id } = req.params;

        console.log("tipo de usuario:", tipo);

        // 🔐 Control de permisos
        if (tipo !== 'admin' && id !== requesterId.toString()) {
            return res.status(403).json({
                error: 'Acceso denegado'
            });
        }

        const deletedRows = await userModel.delete(id);
        console.log("Filas eliminadas:", deletedRows);

        // ❌ Usuario inexistente o ya eliminado
        if (deletedRows === 0) {
            return res.status(404).json({
                error: 'El usuario no existe o ya ha sido eliminado'
            });
        }

        // ✅ Eliminación correcta
        return res.status(204).send();

    } catch (error) {
        console.error('[UserController.delete]', error);

        return res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
}
}