const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/pedidos — Listar pedidos
router.get('/', async (req, res) => {
  try {
    const { estado } = req.query;
    let query = 'SELECT * FROM pedidos';
    const params = [];

    if (estado && ['pendiente', 'completado'].includes(estado)) {
      query += ' WHERE estado = ?';
      params.push(estado);
    }

    query += ' ORDER BY fecha DESC';

    const [pedidos] = await pool.query(query, params);

    for (let pedido of pedidos) {
      const [detalles] = await pool.query(
        `SELECT dp.*, p.titulo, p.imagen_url 
         FROM detalle_pedidos dp 
         JOIN productos p ON dp.producto_id = p.id 
         WHERE dp.pedido_id = ?`,
        [pedido.id]
      );
      pedido.detalles = detalles;
    }

    res.json(pedidos);
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({ error: 'Error obteniendo pedidos.' });
  }
});

// POST /api/pedidos — Registrar nueva compra (checkout)
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { usuario_id, cliente_nombre, dui, direccion, telefono, metodo_pago, items } = req.body;

    const pago_final = metodo_pago || 'efectivo';

    if (!cliente_nombre || !dui || !direccion || !telefono || !items || items.length === 0) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios y debe incluir productos.' });
    }

    let total = 0;
    for (const item of items) {
      total += item.precio * item.cantidad;
    }

    const [pedidoResult] = await connection.query(
      'INSERT INTO pedidos (usuario_id, cliente_nombre, dui, direccion, telefono, metodo_pago, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [usuario_id || null, cliente_nombre, dui, direccion, telefono, pago_final, total]
    );

    const pedidoId = pedidoResult.insertId;

    for (const item of items) {
      await connection.query(
        'INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [pedidoId, item.producto_id, item.cantidad, item.precio]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: 'Pedido registrado exitosamente.',
      pedido_id: pedidoId,
      total: total
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error procesando pedido:', error);
    res.status(500).json({ error: 'Error procesando pedido.' });
  } finally {
    connection.release();
  }
});

// PUT /api/pedidos/:id/estado — Cambiar estado
router.put('/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;

    if (!estado || !['pendiente', 'completado'].includes(estado)) {
      return res.status(400).json({ error: 'Estado invalido.' });
    }

    const [result] = await pool.query(
      'UPDATE pedidos SET estado = ? WHERE id = ?',
      [estado, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado.' });
    }

    res.json({ message: 'Estado del pedido actualizado.' });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ error: 'Error actualizando estado.' });
  }
});

module.exports = router;
