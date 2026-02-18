import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import connection from '../data/Connection.js';

const SALT_ROUNDS = 10;

const AuthController = {

  async register(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // Esto lo tengo que cambiar porque quiero que se sepa si es el email o es el nickname el que ya existe.
      const [existing] = await connection.query(
        'SELECT id FROM users WHERE email = ? OR username = ?',
        [email, username]
      );

      if (existing.length > 0) {
        return res.status(409).json({ error: 'El email o nombre de usuario ya está registrado' });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const [result] = await connection.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword]
      );

      return res.status(201).json({
        message: 'Usuario registrado correctamente',
        userId: result.insertId
      });

    } catch (error) {
      console.error('Error en register:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    try {
      const [rows] = await connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (rows.length === 0) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const user = rows[0];

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      return res.status(200).json({
        message: 'Login exitoso',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async logout(req, res) {
    // En JWT stateless el logout real es responsabilidad del cliente
    return res.status(200).json({ message: 'Logout correcto (elimina el token del cliente)' });
  }
};

export default AuthController;
