import jwt from 'jsonwebtoken';

// Middleware base - verifica que el token sea válido
export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        req.tipo = decoded.tipo;     // <-- aquí se asigna el req.tipo que usas en tus controllers
        next();
    } catch (error) {
        res.status(403).json({ error: 'Token inválido o expirado' });
    }
};

// Middleware extra - solo admins
export const verifyAdmin = (req, res, next) => {
    if (req.tipo !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado: se requiere rol admin' });
    }
    next();
};