const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/productos — Listar activos (con filtro por categoría opcional)
router.get('/', async (req, res) => {
  try {
    const { categoria } = req.query;
    let query = 'SELECT * FROM productos WHERE activo = 1';
    const params = [];

    if (categoria && ['medico', 'belleza'].includes(categoria)) {
      query += ' AND categoria = ?';
      params.push(categoria);
    }

    query += ' ORDER BY fecha_creacion DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ error: 'Error obteniendo productos.' });
  }
});

// GET /api/productos/all — Listar todos (Admin)
router.get('/all', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos ORDER BY fecha_creacion DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo productos admin:', error);
    res.status(500).json({ error: 'Error obteniendo productos.' });
  }
});

// POST /api/productos — Crear producto
router.post('/', async (req, res) => {
  try {
    const { titulo, descripcion, categoria, precio, imagen_url } = req.body;

    if (!titulo || !categoria || !precio) {
      return res.status(400).json({ error: 'Título, categoría y precio son obligatorios.' });
    }

    const [result] = await pool.query(
      'INSERT INTO productos (titulo, descripcion, categoria, precio, imagen_url) VALUES (?, ?, ?, ?, ?)',
      [titulo, descripcion || '', categoria, precio, imagen_url || '']
    );

    res.status(201).json({ id: result.insertId, message: 'Producto creado exitosamente.' });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ error: 'Error creando producto.' });
  }
});

// PUT /api/productos/:id — Editar producto
router.put('/:id', async (req, res) => {
  try {
    const { titulo, descripcion, categoria, precio, imagen_url, activo } = req.body;

    const [result] = await pool.query(
      'UPDATE productos SET titulo = ?, descripcion = ?, categoria = ?, precio = ?, imagen_url = ?, activo = ? WHERE id = ?',
      [titulo, descripcion, categoria, precio, imagen_url, activo ? 1 : 0, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    res.json({ message: 'Producto actualizado exitosamente.' });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ error: 'Error actualizando producto.' });
  }
});

// DELETE /api/productos/:id — Desactivar producto (Soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE productos SET activo = 0 WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    res.json({ message: 'Producto desactivado exitosamente.' });
  } catch (error) {
    console.error('Error desactivando producto:', error);
    res.status(500).json({ error: 'Error desactivando producto.' });
  }
});

module.exports = router;
