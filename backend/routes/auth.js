const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// POST /api/auth/login — Login admin / cliente
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    res.json({
      message: 'Login exitoso',
      token: process.env.SECRET_KEY || 'martex_secret_key_2024',
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST /api/auth/register — Registro de clientes
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios.' });
    }

    const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, password_hash, 'cliente']
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: result.insertId,
        nombre,
        email,
        rol: 'cliente'
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST /api/auth/google — Login / Auth con Google
router.post('/google', async (req, res) => {
  try {
    const { google_id, nombre, email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Correo electrónico no proporcionado por Google.' });
    }

    const [existing] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    let user;
    if (existing.length > 0) {
      user = existing[0];
      if (!user.google_id && google_id) {
        await pool.query('UPDATE usuarios SET google_id = ? WHERE id = ?', [google_id, user.id]);
      }
    } else {
      const [result] = await pool.query(
        'INSERT INTO usuarios (google_id, nombre, email, rol) VALUES (?, ?, ?, ?)',
        [google_id || 'google_user', nombre || 'Usuario Google', email, 'cliente']
      );
      user = {
        id: result.insertId,
        nombre: nombre || 'Usuario Google',
        email,
        rol: 'cliente'
      };
    }

    res.json({
      message: 'Autenticación con Google exitosa',
      token: process.env.SECRET_KEY || 'martex_secret_key_2024',
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('Error en auth Google:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST /api/auth/verify — Verificar token
router.post('/verify', (req, res) => {
  const token = req.headers['authorization'];
  const secretKey = process.env.SECRET_KEY || 'martex_secret_key_2024';
  if (token === `Bearer ${secretKey}`) {
    res.json({ valid: true });
  } else {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
